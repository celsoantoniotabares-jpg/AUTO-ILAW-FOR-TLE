/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { Agent, setGlobalDispatcher } from "undici";

dotenv.config();

// Configure undici global dispatcher with higher timeouts to avoid HeadersTimeoutError on long-running AI Generations
setGlobalDispatcher(new Agent({
  headersTimeout: 300000,   // 5 minutes
  bodyTimeout: 300000,      // 5 minutes
  connectTimeout: 300000,   // 5 minutes
  keepAliveTimeout: 300000 // 5 minutes
}));

const isProd = process.env.NODE_ENV === "production";
const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Health endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "alive" });
  });

  // Safe lazy-loader for GoogleGenAI to avoid crashing on start if key is absent
  let aiClient: GoogleGenAI | null = null;
  function getAIClient() {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        throw new Error("GEMINI_API_KEY is not configured. Please set it in the Secrets panel under Settings.");
      }
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
          timeout: 240000, // 4 minutes timeout for safety
        },
      });
    }
    return aiClient;
  }

  // API endpoint to generate daily lesson plans using ILAW format
  app.post("/api/generate", async (req: express.Request, res: express.Response) => {
    try {
      const ai = getAIClient();
      const {
        teacherName,
        gradeAndSection,
        learningArea,
        references,
        learnerContext,
        componentName,
        sectorName,
        weekNum,
        competency,
        declarationOfAI,
      } = req.body;

      if (!competency) {
        res.status(400).json({ error: "Learning competency is required." });
        return;
      }

      // Carefully craft the robust DepEd structured prompt
      const prompt = `
You are an expert, highly experienced Philippine curriculum developer. Your task is to generate a comprehensive 4-day lesson plan strictly following the DepEd ILAW format based on the following metadata:

=== METADATA ===
- Designed by Teacher/s: ${teacherName || "Unspecified"}
- Grade Level and Section: ${gradeAndSection || "Unspecified"}
- Learning Area/s: ${learningArea || "Technology and Livelihood Education"}
- Component Portfolio: ${componentName || "TLE Portfolio"}
- Sector Discipline: ${sectorName || "Unspecified Sector"}
- Week Number: Week ${weekNum || "1"}
- Base Weekly Competency: "${competency}"
- Custom Teacher observations (Learner Context Base): "${learnerContext || "Heterogeneous mix of learners, highly responsive to cooperative hands-on laboratory experiences."}"
- Declaration of AI Use base: "${declarationOfAI || "Used to assist in organizing the lesson structure in compliance with DO 3, s. 2026 Annex A."}"
- References: "${references || "DepEd K to 12 TLE Learning Modules"}"

=== STRUCTURAL REQUIREMENT ===
Unpack the weekly competency "${competency}" into EXACTLY 4 daily sessions. For each day, strictly provide high-quality educational text matching the DepEd ILAW landscape framework.

For EACH of the 4 days, generate:
1. Session title/focus (e.g. "Day 1: Introduction to...", "Day 2: Demonstration of...")
2. Explicit Intentions:
   - Learning Objectives matching the KSA (Knowledge, Skills, and Attitude) framework. You MUST formulate exactly 3 objectives:
     - 1 Knowledge Objective: Use an observable, action-oriented Bloom's verb (e.g. 'identify', 'explain', 'compare'). DO NOT use 'understand', 'know', or 'learn'.
     - 1 Skill Objective: Use a hands-on, practical Bloom's verb (e.g. 'demonstrate', 'execute', 'perform', 'construct').
     - 1 Attitude Objective: Focus on values, cooperation, safety attention, or professional care (e.g. 'appreciate', 'advocate', 'practice safety', 'display responsibility').
   - Learner Context: Write customized observations of daily learners based on the teacher's Context Base, pointing out strengths, interests, and potential obstacles (e.g. limited tool counts, electrical fluctuations, motor skill variances) for this specific daily activity.
3. Scaffolded Learning Experience:
   - Pre-Lesson: Concrete readiness actions (prayer, morning routines, a stimulating opening question, safety checks, or a diagnostic game).
   - Flow: Split cleanly into standard instructional scaffolding steps:
     - "I Do" (Teacher demo / clear, concise explanation of correct steps),
     - "We Do" (Guided collaborative practice or team assignments where the teacher actively inspects),
     - "You Do" (Independent construction, presentation, checklist tick-off, or individual worksheet task).
   - Learning Resources: Lists of inclusive materials, and ALWAYS include options/alternatives in case of emergency or resources limitations (e.g., printed visual cards, manual tools, or simplified materials).
   - Opportunities for Integration: Concrete integrations mapping lessons to Science (physics/biology of material), Mathematics (cost, parameters), Values Education (labor dignity, safety compliance), or Technology.
4. Formative Assessment:
   - A direct, context-specific Formative task.
   - Structured Rubric Criteria (exactly 3 distinct parameters styled for this task with score points, e.g. 15 points, 15 points, 20 points, totaling 50 points).
   - Exactly 2 analytical Oral Questions for deeper checking (e.g., 'What occurs if...', 'Why must we avoid...').
   - Tailored Accommodations (how you support diverse physical, visual, auditory, or cognitive abilities).
5. Ways Forward:
   - Extended Learning Opportunity: Outside classroom activity (e.g. home checking, interviewing parents, internet diagram search).
   - Reflections: 2 reflective feedback questions for the teacher.

=== COMPLIANCE CONSTRAINTS ===
- Do NOT use filler words or place-marking indices. Text must be professional, highly instructive, and complete.
- Tone: Professional, structured DepEd pedagogical tone.
- Do NOT use vague verbs.
- Formulate the response as a strict, complete JSON payload matching the target response schema. Do NOT cut off.
      `.trim();

      // Invoke the model using gemini-3.5-flash (with solid fallback to gemini-3.1-flash-lite and gemini-flash-latest to handle 503 high-demand occurrences)
      let response = null;
      let attempt = 0;
      const maxAttempts = 6;

      while (attempt < maxAttempts) {
        attempt++;
        
        // Define an intelligent fallback sequence of models to bypass rate-limits or temporary high demands on individual models
        let selectedModel = "gemini-3.5-flash";
        if (attempt === 2 || attempt === 4 || attempt === 6) {
          selectedModel = "gemini-3.1-flash-lite"; // fallback to lite which has high throughput and separate quota pools
        } else if (attempt === 3) {
          selectedModel = "gemini-flash-latest"; // fallback to latest flash release pool
        } else {
          selectedModel = "gemini-3.5-flash";
        }

        try {
          console.log(`[ILAW Engine] Dispatching generation request. Model: '${selectedModel}', Attempt: ${attempt}/${maxAttempts}`);
          response = await ai.models.generateContent({
            model: selectedModel,
            contents: prompt,
            config: {
              systemInstruction: "You are the primary engine for the Philippines DepEd ILAW Lesson Plan Generator. Your answers are always pristine, fully formulated JSON arrays of daily lesson plans conforming exactly to curriculum standards and Annex A DO 3 s. 2026 rules.",
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  days: {
                    type: Type.ARRAY,
                    description: "Array of exactly 4 sequentially scaffolded daily lesson plans.",
                    items: {
                      type: Type.OBJECT,
                      required: ["dayNo", "title", "objectives", "experience", "assessment", "waysForward"],
                      properties: {
                        dayNo: { type: Type.INTEGER, description: "Sequential day index (1, 2, 3, or 4)." },
                        title: { type: Type.STRING, description: "Clear focus title of the day's session." },
                        objectives: {
                          type: Type.OBJECT,
                          required: ["knowledge", "skills", "attitude"],
                          properties: {
                            knowledge: { type: Type.STRING, description: "Daily Knowledge objective (K) starting with observable verb." },
                            skills: { type: Type.STRING, description: "Daily Skill objective (S) starting with action verb." },
                            attitude: { type: Type.STRING, description: "Daily Attitude/Values objective (A)." }
                          }
                        },
                        experience: {
                          type: Type.OBJECT,
                          required: ["preLesson", "flow", "resources", "integration"],
                          properties: {
                            preLesson: {
                              type: Type.ARRAY,
                              items: { type: Type.STRING },
                              description: "Step-by-step pre-lesson routines or diagnostic prompts."
                            },
                            flow: {
                              type: Type.OBJECT,
                              required: ["iDo", "weDo", "youDo"],
                              properties: {
                                iDo: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Actions for 'I Do' teacher modeling." },
                                weDo: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Actions for 'We Do' guided practice." },
                                youDo: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Actions for 'You Do' individual task." }
                              }
                            },
                            resources: {
                              type: Type.ARRAY,
                              items: { type: Type.STRING },
                              description: "Safety equipment, visual tools, papers, and offline backup resources."
                            },
                            integration: {
                              type: Type.ARRAY,
                              items: { type: Type.STRING },
                              description: "Anchored subjects (Science, Values, math, arts)."
                            }
                          }
                        },
                        assessment: {
                          type: Type.OBJECT,
                          required: ["task", "rubric", "oralQuestions", "accommodations"],
                          properties: {
                            task: { type: Type.STRING, description: "Formative evaluation assignment details." },
                            rubric: {
                              type: Type.ARRAY,
                              items: {
                                type: Type.OBJECT,
                                required: ["criteria", "points"],
                                properties: {
                                  criteria: { type: Type.STRING, description: "Name of the grading criteria." },
                                  points: { type: Type.INTEGER, description: "Points score allocated." }
                                }
                              }
                            },
                            oralQuestions: {
                              type: Type.ARRAY,
                              items: { type: Type.STRING },
                              description: "Reflection check questions."
                            },
                            accommodations: {
                              type: Type.ARRAY,
                              items: { type: Type.STRING },
                              description: "How to aid motor, sight, or auditory differentiations."
                            }
                          }
                        },
                        waysForward: {
                          type: Type.OBJECT,
                          required: ["extendedLearning", "reflections"],
                          properties: {
                            extendedLearning: {
                              type: Type.ARRAY,
                              items: { type: Type.STRING },
                              description: "Extended homework, family tasks, or digital explore cues."
                            },
                            reflections: {
                              type: Type.ARRAY,
                              items: { type: Type.STRING },
                              description: "Assessment observations or teacher coaching questions."
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          });
      console.log(`[ILAW Engine] Successfully generated content using model '${selectedModel}' on attempt ${attempt}`);
          break; // break loop on success!
        } catch (apiErr: any) {
          const errMsg = apiErr?.message || "";
          const errStatus = apiErr?.status;
          const isTransient = errMsg.includes("503") || errMsg.includes("demand") || errMsg.includes("temporary") || errMsg.includes("UNAVAILABLE") || errStatus === 503;
          if (isTransient && attempt < maxAttempts) {
            // Incremental backoff with randomized jitter
            const delay = 3000 * attempt + Math.floor(Math.random() * 1500);
            console.warn(`[ILAW Engine] Gemini AI reported busy/temporary demand on model '${selectedModel}'. Attempt ${attempt}/${maxAttempts} failed. Retrying in ${delay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
          } else {
            throw apiErr;
          }
        }
      }

      if (!response) {
        throw new Error("Transmitting or decoding payload with Gemini failed. Please trigger generation once more.");
      }

      const responseText = response.text || "{}";
      res.json(JSON.parse(responseText));
    } catch (error: any) {
      console.error("Gemini lesson generation error:", error);
      let rawMsg = error?.message || "";
      let cleanMsg = typeof rawMsg === "string" ? rawMsg : JSON.stringify(rawMsg);
      if (cleanMsg.includes("503") || cleanMsg.includes("demand") || cleanMsg.includes("UNAVAILABLE") || cleanMsg.includes("resource exhausted") || cleanMsg.includes("temporary")) {
        cleanMsg = "The modern DepEd ILAW lesson planner is currently experiencing high demand. Please wait a moment and try clicking 'Unpack Lesson Plan' again.";
      }
      res.status(500).json({ error: cleanMsg });
    }
  });

  // Connect Vite when running inside Antigravity container sandbox in development
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[ILAW Engine] Server running in ${isProd ? "production" : "development"} mode on http://localhost:${PORT}`);
  });
}

startServer();
