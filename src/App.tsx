/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Lock,
  FileText,
  Download,
  Printer,
  Plus,
  Folder,
  FolderOpen,
  BookOpen,
  ChevronRight,
  User,
  GraduationCap,
  AlertCircle,
  RefreshCw,
  LogOut,
  Check,
  Edit2,
  Calendar,
  Sparkles,
  Search,
  BookOpenCheck
} from "lucide-react";
import { curriculumData, Sector, PreGeneratedPlan } from "./curriculumData";
import { generateILAWDocx } from "./docxHelper";

export default function App() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("ilaw_auth") === "true";
  });
  const [password, setPassword] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");

  // User saved plans for Template Bank
  const [savedPlans, setSavedPlans] = useState<{
    id: string;
    savedAt: string;
    componentId?: string;
    sectorId?: string;
    weekNum?: number;
    plan: PreGeneratedPlan;
  }[]>(() => {
    try {
      const stored = localStorage.getItem("ilaw_saved_plans");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const saveActivePlanToBank = () => {
    if (!activeLessonPlan) return;
    
    // Check if we already have this plan saved (by checking identical or close properties)
    const isAlreadySaved = savedPlans.some(
      (p) => p.plan.name === activeLessonPlan.name && p.plan.competency === activeLessonPlan.competency
    );
    if (isAlreadySaved) {
      setErrorMessage("Paalala: Ang lesson plan na ito ay mayroon nang katulad na nakasave sa iyong Bank.");
      return;
    }

    const planId = "user_" + Date.now();
    const todayStr = new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const newWrapper = {
      id: planId,
      savedAt: todayStr,
      componentId: selectedComponentId,
      sectorId: selectedSectorId,
      weekNum: selectedWeekNum,
      plan: JSON.parse(JSON.stringify(activeLessonPlan)),
    };

    const updated = [newWrapper, ...savedPlans];
    setSavedPlans(updated);
    localStorage.setItem("ilaw_saved_plans", JSON.stringify(updated));
    
    // Determine the user-friendly category & sector name for target response
    const currentCompName = activeComponentObj?.name || selectedComponentId;
    const currentSectName = activeSectorObj?.name || selectedSectorId;
    setErrorMessage(`Matagumpay na nailigtas ang lesson plan! Nai-file ito directly sa folder ng "${currentSectName}" under ${currentCompName} (Week ${selectedWeekNum}).`);
  };

  const deleteSavedPlan = (id: string) => {
    const updated = savedPlans.filter((p) => p.id !== id);
    setSavedPlans(updated);
    localStorage.setItem("ilaw_saved_plans", JSON.stringify(updated));
    setErrorMessage("Nabura ang napiling lesson plan mula sa iyong Template Bank.");
  };

  // Portal view states: "generator" | "bank"
  const [activePortalTab, setActivePortalTab] = useState<"generator" | "bank">("generator");

  // Input states for form / generation
  const [teacherName, setTeacherName] = useState<string>("Celso Antonio B. Tabares IV");
  const [gradeAndSection, setGradeAndSection] = useState<string>("Grade 9 - Section Mahinhin");
  const [learningArea, setLearningArea] = useState<string>("Technology and Livelihood Education (TLE)");
  const [references, setReferences] = useState<string>("DepEd K-12 TLE Learning Modules & BOW");
  const [declarationOfAI, setDeclarationOfAI] = useState<string>(
    "AI was used to unpack lesson objectives and scaffold step-by-step laboratory and classroom experiences based on DepEd learning standards, in compliance with DO 3, s. 2026 Annex A."
  );
  const [learnerContext, setLearnerContext] = useState<string>(
    "The learners are junior high school students who excel in tactile, visual, and group-directed laboratory models. Some struggle with abstract conceptual reading; motor skills development is highly prioritized."
  );

  // Selected curriculum parameters
  const [selectedComponentId, setSelectedComponentId] = useState<string>("ict");
  const [selectedSectorId, setSelectedSectorId] = useState<string>("programming");
  const [selectedWeekNum, setSelectedWeekNum] = useState<number>(1);
  const [customCompetencyText, setCustomCompetencyText] = useState<string>("");

  // Bank view states (directory navigation)
  const [expandedComponents, setExpandedComponents] = useState<{ [key: string]: boolean }>({
    fcs: true, // open FCS by default so they see the exemplar sandwich plan
  });
  const [selectedBankSectorId, setSelectedBankSectorId] = useState<string>("");
  const [selectedBankWeekNum, setSelectedBankWeekNum] = useState<number>(0);

  // Active loaded lesson plan
  const [activeLessonPlan, setActivePlan] = useState<PreGeneratedPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Formative state for current editing cell/day
  const [activePreviewDayNo, setActivePreviewDayNo] = useState<number>(1);

  // Auto-filled learning competency text whenever week/sector changes
  useEffect(() => {
    const comp = curriculumData.find((c) => c.id === selectedComponentId);
    const sector = comp?.sectors.find((s) => s.id === selectedSectorId);
    const weekData = sector?.weeks[selectedWeekNum];
    if (weekData) {
      setCustomCompetencyText(weekData.competency);
    }
  }, [selectedComponentId, selectedSectorId, selectedWeekNum]);

  // Handle local credentials bypass
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === "TATAK SUPREMO") {
      setIsAuthenticated(true);
      localStorage.setItem("ilaw_auth", "true");
      setAuthError("");
    } else {
      setAuthError("Kredensyal Hindi Sapat. Please try again.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("ilaw_auth");
    setPassword("");
  };

  // Helper variables to fetch current names
  const activeComponentObj = curriculumData.find((c) => c.id === selectedComponentId);
  const activeSectorObj = activeComponentObj?.sectors.find((s) => s.id === selectedSectorId);

  // Toggle component folders in Bank list
  const toggleComponentFolder = (compId: string) => {
    setExpandedComponents((prev) => ({
      ...prev,
      [compId]: !prev[compId],
    }));
  };

  // Load a plan from the bank
  const loadBankPlan = (compId: string, sectorId: string, weekNum: number) => {
    const comp = curriculumData.find((c) => c.id === compId);
    const sector = comp?.sectors.find((s) => s.id === sectorId);
    const preGenPlan = sector?.preGenerated?.[weekNum];

    if (preGenPlan) {
      // Create a fresh clone so editing doesn't mutate our constant curriculumData directly
      const planCopy: PreGeneratedPlan = JSON.parse(JSON.stringify(preGenPlan));
      // Inject customized teacher name, section parameters from the user's form
      planCopy.teacher = teacherName;
      planCopy.gradeAndSection = gradeAndSection;
      planCopy.learningArea = learningArea;
      planCopy.references = [references, ...planCopy.references];
      planCopy.declarationOfAI = declarationOfAI;
      planCopy.context = learnerContext;

      setActivePlan(planCopy);
      setActivePreviewDayNo(1);
      setErrorMessage("");
      setTimeout(() => {
        document.getElementById("active-plan-preview")?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } else {
      // For pages/weeks with no preGen, trigger prompt to generate
      const targetComp = comp?.name || compId;
      const targetSec = sector?.name || sectorId;
      const compCompetency = sector?.weeks[weekNum]?.competency || "";
      
      setSelectedComponentId(compId);
      setSelectedSectorId(sectorId);
      setSelectedWeekNum(weekNum);
      setActivePortalTab("generator");
      setCustomCompetencyText(compCompetency);
      setErrorMessage(
        `Note: Week ${weekNum} under ${targetSec} does not have a pre-saved exemplar. We have loaded this competency into the ILAW Live Generator for you.`
      );
    }
  };

  // Generate with Server-side proxy
  const handleLiveGenerate = async () => {
    setIsGenerating(true);
    setErrorMessage("");
    setGenerationStep("Analyzing physical curriculum requirements...");

    // Smooth staggered progress labels mock to provide warm scannable UX during slow operation
    const stepIntervals = [
      "Establishing compliance parameters under DepEd standards...",
      "Scaffolding daily 60-minute instructional sequences...",
      "Formulating Knowledge, Skills, and Attitude (KSA) measurable goals...",
      "Unpacking the Budget of Work (BOW) competency into 4 sessions...",
      "Integrating OSH and emergency resource alternatives...",
      "Assembling formative rubric tables...",
      "Applying AI Declaration Statement (DO 3, s. 2026 Annex A)...",
    ];

    let currentStepIdx = 0;
    const progressTimer = setInterval(() => {
      if (currentStepIdx < stepIntervals.length) {
        setGenerationStep(stepIntervals[currentStepIdx]);
        currentStepIdx++;
      }
    }, 1800);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherName,
          gradeAndSection,
          learningArea,
          references,
          learnerContext,
          componentName: activeComponentObj?.name || selectedComponentId,
          sectorName: activeSectorObj?.name || selectedSectorId,
          weekNum: selectedWeekNum,
          competency: customCompetencyText,
          declarationOfAI,
        }),
      });

      clearInterval(progressTimer);

      if (!response.ok) {
        let errorDataMsg = "";
        try {
          const errorData = await response.json();
          errorDataMsg = errorData.error || errorData.message || JSON.stringify(errorData);
        } catch {
          try {
            const rawText = await response.text();
            // Abstract HTML responses or long system dumps to a clean, user-friendly message
            if (rawText.includes("<!DOCTYPE") || rawText.includes("<!doctype") || rawText.includes("<html")) {
              errorDataMsg = "Ang server ay kasalukuyang nakakaranas ng aberya o timeout bunsod ng mahabang request. Pakisubukang muli pagkaraan ng ilang sandali (Wait 1 minute and click Unpack Lesson Plan again).";
            } else {
              errorDataMsg = rawText.substring(0, 300) || ("Endpoint status code: " + response.status);
            }
          } catch {
            errorDataMsg = "Endpoint status code: " + response.status;
          }
        }
        throw new Error(errorDataMsg);
      }

      const responseRawText = await response.text();
      let generatedData;
      try {
        generatedData = JSON.parse(responseRawText);
      } catch (jsonErr) {
        console.error("Nigo JSON parsing error for response:", responseRawText, jsonErr);
        throw new Error("Hindi naging wasto ang tugon mula sa ILAW server (Payload is not valid JSON). Pakisubukang i-click muli ang 'Unpack Lesson Plan'.");
      }
      
      if (!generatedData.days || !Array.isArray(generatedData.days)) {
        throw new Error("Invalid output received from the ILAW generator. Please check your config parameters.");
      }

      // Convert generated output to active lesson plan structure
      const fullPlan: PreGeneratedPlan = {
        name: activeSectorObj?.weeks[selectedWeekNum]?.suggestedName || `${activeSectorObj?.name || "TLE"} - Week ${selectedWeekNum} Lessons`,
        gradeAndSection,
        learningArea,
        teacher: teacherName,
        noOfSessions: "4 Sessions (60 mins each)",
        references: [references],
        declarationOfAI,
        competency: customCompetencyText,
        context: learnerContext,
        days: generatedData.days,
      };

      setActivePlan(fullPlan);
      setActivePreviewDayNo(1);
      setErrorMessage("");
      setTimeout(() => {
        document.getElementById("active-plan-preview")?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } catch (err: any) {
      clearInterval(progressTimer);
      console.error(err);
      setErrorMessage(
        err.message || "Something went wrong on the server connection. Please verify your GEMINI_API_KEY settings."
      );
    } finally {
      setIsGenerating(false);
      setGenerationStep("");
    }
  };

  // Mutator to support on-the-fly client side adjustments (compliance with "if he wants changes just help him")
  const updatePlanField = (dayNo: number, path: string, value: any) => {
    if (!activeLessonPlan) return;

    const updated = { ...activeLessonPlan };
    const day = updated.days.find((d) => d.dayNo === dayNo);

    if (day) {
      if (path === "title") {
        day.title = value;
      } else if (path === "objectives.knowledge") {
        day.objectives.knowledge = value;
      } else if (path === "objectives.skills") {
        day.objectives.skills = value;
      } else if (path === "objectives.attitude") {
        day.objectives.attitude = value;
      } else if (path === "assessment.task") {
        day.assessment.task = value;
      }
      setActivePlan(updated);
    }
  };

  // Convert schema plan to formatted JSON download file
  const triggerJSONDownload = () => {
    if (!activeLessonPlan) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeLessonPlan, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ILAW_Lesson_Plan_Week_${selectedWeekNum || "1"}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Convert schema plan to formatted Word document (.docx) download file
  const triggerDOCXDownload = async () => {
    if (!activeLessonPlan) return;
    try {
      const blob = await generateILAWDocx(activeLessonPlan);
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", url);
      downloadAnchor.setAttribute("download", `ILAW_Lesson_Plan_Week_${selectedWeekNum || "1"}.docx`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error creating DOCX document:", err);
    }
  };

  // Trigger Native browser landscape print
  const triggerLandscapePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-slate-200">
      
      {/* 1. PASSWORD ACCESS WALL */}
      {!isAuthenticated && (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(51,65,85,0.4),rgba(15,23,42,1))]" />
          
          <div className="max-w-md w-full bg-slate-800/80 border border-slate-700/60 p-8 rounded-2xl shadow-2xl backdrop-blur-md relative z-10">
            <div className="text-center mb-6">
              <span className="inline-block p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-3 text-amber-400">
                <Lock className="w-8 h-8" />
              </span>
              <h1 className="text-3xl font-display font-semibold tracking-tight text-white mb-1">
                ILAW TLE <span className="text-amber-400">Engine</span>
              </h1>
              <p className="text-xs text-slate-400 tracking-wider uppercase font-mono">
                DepEd Lesson Plan Platform
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2 font-mono">
                  Susi sa Pagpasok (Portal Password)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ilagay ang Password..."
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all font-mono"
                  id="auth-password-input"
                />
              </div>

              {authError && (
                <div role="alert" className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-xs text-red-300 leading-normal">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-medium rounded-xl transition-all shadow-lg shadow-amber-500/10 cursor-pointer font-display"
                id="auth-submit-btn"
              >
                Magpatuloy (Unlock Portal)
              </button>
            </form>

            <div className="mt-8 border-t border-slate-700/50 pt-5 text-center">
              <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                Platform Designed, Tuned, and Developed by<br />
                <span className="text-amber-400 font-bold text-xs font-display">Celso Antonio B. Tabares IV</span><br />
                <span className="text-[10px] text-slate-300 font-medium">Teacher I</span><br />
                <span className="text-[10px] text-slate-400">Toboso National High School</span>
              </p>
              <p className="text-[10px] text-slate-500 mt-2 font-mono">
                DO 3, s. 2026 Annex A & DepEd ILAW Framework Compliant
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. AUTHENTICATED PLATFORM PORTAL */}
      {isAuthenticated && (
        <div className="flex flex-col min-h-screen">
          
          {/* Main Top Navigation Header (no-print) */}
          <header className="bg-slate-950 text-white border-b border-slate-800 no-print sticky top-0 z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-amber-500 text-slate-950 rounded-xl shadow-lg shadow-amber-500/10 shrink-0">
                  <BookOpenCheck className="w-6 h-6" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-display font-semibold tracking-tight">
                      ILAW TLE Lesson Plan Generator
                    </h1>
                    <span className="px-2 py-0.5 bg-amber-400/15 border border-amber-400/30 text-[10px] text-amber-300 uppercase tracking-widest font-mono rounded">
                      DO 3, s. 2026 compl
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    Developed by <span className="text-slate-300 font-sans font-medium">Celso Antonio B. Tabares IV (Teacher I - Toboso National High School)</span>
                  </p>
                </div>
              </div>

              {/* Action buttons on header */}
              <div className="flex items-center gap-2">
                
                <button
                  onClick={handleLogout}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer font-mono"
                  id="header-logout-btn"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Kandado (Lock)
                </button>
              </div>
            </div>
          </header>

          {/* Quick Informational Notice Segment (no-print) */}
          <section className="bg-amber-400 text-slate-950 text-xs py-2 px-4 text-center font-medium shadow-inner no-print flex items-center justify-center gap-2 flex-wrap">
            <span className="px-1.5 py-0.5 bg-slate-950 text-amber-400 text-[10px] rounded font-mono font-bold uppercase shrink-0">DepEd ILAW</span>
            <span>Unpack 1-Week Budget of Work (BOW) learning competencies cleanly into 4 distinct daily scaffolded lesson plans.</span>
          </section>

          {/* Portal Layout Container */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
            
            {/* Nav Dual Tabs for switching features (no-print) */}
            <div className="flex bg-slate-200 p-1.5 rounded-2xl max-w-md mx-auto sm:mx-0 no-print gap-1.5">
              <button
                onClick={() => setActivePortalTab("generator")}
                className={`flex-1 py-2 px-4 rounded-xl text-xs font-semibold tracking-tight transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activePortalTab === "generator"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                id="portal-btn-generator"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                ILAW Generator
              </button>
              <button
                onClick={() => setActivePortalTab("bank")}
                className={`flex-1 py-2 px-4 rounded-xl text-xs font-semibold tracking-tight transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activePortalTab === "bank"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                id="portal-btn-bank"
              >
                <BookOpen className="w-4 h-4 text-amber-500" />
                ILAW Template Bank
              </button>
            </div>

            {/* TAB 1: ILAW LIVE GENERATOR PANEL */}
            {activePortalTab === "generator" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
                
                {/* Inputs Meta Block Form (1 Column) */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5">
                  <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-amber-500" />
                    <h2 className="font-display font-medium text-slate-900">Mga Detalye ng Guro (Meta)</h2>
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 font-mono">
                        Pangalan ng Guro (Designed By)
                      </label>
                      <input
                        type="text"
                        value={teacherName}
                        onChange={(e) => setTeacherName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all"
                        id="input-teacher-name"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 font-mono">
                        Baitang at Seksyon (Grade & Section)
                      </label>
                      <input
                        type="text"
                        value={gradeAndSection}
                        onChange={(e) => setGradeAndSection(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all"
                        id="input-grade-section"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 font-mono">
                        Asignatura (Learning Area)
                      </label>
                      <input
                        type="text"
                        value={learningArea}
                        onChange={(e) => setLearningArea(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all"
                        id="input-learning-area"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 font-mono">
                        Mga Sanggunian (References)
                      </label>
                      <input
                        type="text"
                        value={references}
                        onChange={(e) => setReferences(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all"
                        id="input-references"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 font-mono">
                        Declaration of AI Compliance
                      </label>
                      <textarea
                        value={declarationOfAI}
                        onChange={(e) => setDeclarationOfAI(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all resize-none leading-relaxed"
                        id="input-declaration-ai"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 font-mono">
                        Propayl ng Mag-aaral (Learner Context Base)
                      </label>
                      <textarea
                        value={learnerContext}
                        onChange={(e) => setLearnerContext(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all resize-none leading-relaxed"
                        id="input-learner-context"
                      />
                    </div>
                  </div>
                </div>

                {/* Component Selectors and BOW Target Unpacking (2 Columns) */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5 lg:col-span-2 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-amber-500" />
                      <h2 className="font-display font-medium text-slate-900">Pagpili sa Kurikulum (BOW Alignment)</h2>
                    </div>

                    {/* Dropdowns */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 font-mono">
                          Component Category
                        </label>
                        <select
                          value={selectedComponentId}
                          onChange={(e) => {
                            setSelectedComponentId(e.target.value);
                            // Auto-set the first sector in list for this components
                            const comp = curriculumData.find((c) => c.id === e.target.value);
                            if (comp?.sectors.length) {
                              setSelectedSectorId(comp.sectors[0].id);
                            }
                          }}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                          id="select-component"
                        >
                          {curriculumData.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 font-mono">
                          Specialized Sector Subfolder
                        </label>
                        <select
                          value={selectedSectorId}
                          onChange={(e) => setSelectedSectorId(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                          id="select-sector"
                        >
                          {activeComponentObj?.sectors.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 font-mono">
                          Target Week (BOW Lesson Range)
                        </label>
                        <select
                          value={selectedWeekNum}
                          onChange={(e) => setSelectedWeekNum(parseInt(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                          id="select-week"
                        >
                          {Array.from({ length: 10 }, (_, i) => i + 1).map((w) => (
                            <option key={w} value={w}>
                              Week {w}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Autofilled Competency Output Area */}
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase font-mono">
                          Official target learning competency (from BOW)
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 font-mono">
                          Week {selectedWeekNum} Learning Area Target
                        </span>
                      </div>
                      <textarea
                        value={customCompetencyText}
                        onChange={(e) => setCustomCompetencyText(e.target.value)}
                        rows={3}
                        className="w-full bg-white border border-slate-200 rounded-lg text-xs font-semibold p-3 text-slate-800 leading-relaxed focus:outline-none focus:ring-1 focus:ring-amber-500"
                        id="input-custom-competency"
                      />
                      <p className="text-[10px] text-slate-400 leading-normal">
                        *Review the official competency above. You can customize the phrasing above if you want to unpack a slightly adjusted target.
                      </p>
                    </div>
                  </div>

                  {/* Primary Trigger Actions Wrapper */}
                  <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-left w-full sm:w-auto">
                      <span className="text-xs text-slate-400 font-mono block">PLATFORM ENGINE MODEL</span>
                      <span className="text-xs text-slate-700 font-medium">Gemini 3.5 Flash (Failsafe-optimized JSON mode)</span>
                    </div>

                    {/* Submit generator btn */}
                    <button
                      onClick={handleLiveGenerate}
                      disabled={isGenerating}
                      className="w-full sm:w-auto py-3 px-6 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-amber-400 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-slate-900/10 cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-55"
                      id="btn-live-generate"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                          Ginagawa ang Lesson Plan...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          Mag-Generate Ng 4-Araw Plan
                        </>
                      )}
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* TAB 2: ILAW TEMPLATE CURRICULUM BANKS NAVIGATION (no-print) */}
            {activePortalTab === "bank" && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6 no-print">
                <div className="border-b border-slate-100 pb-3 flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-amber-500" />
                    <h2 className="font-display font-medium text-slate-900">ILAW Curricular Exemplar Banks</h2>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    Official TLE directories (22 specialized sectors)
                  </span>
                </div>

                {/* USER SAVED PLAN BANK */}
                <div className="bg-slate-950/5 border border-slate-950/10 rounded-2xl p-5 space-y-3.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-2">
                      <FolderOpen className="w-4 h-4 text-amber-500" />
                      Aking mga Iniligtas na Plan (My Saved Template Bank)
                    </h3>
                    <span className="text-[10px] text-slate-600 bg-slate-200/80 px-2.5 py-0.5 rounded-full font-mono font-medium">
                      {savedPlans.length} plans saved
                    </span>
                  </div>

                  {savedPlans.length === 0 ? (
                    <p className="text-xs text-slate-450 italic">
                      Wala ka pang naka-save na plano. Mag-generate ng aralin at i-click ang "I-save sa Bank" upang lumitaw dito na may kasamang petsa.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {savedPlans.map((item) => (
                        <div key={item.id} className="bg-white border border-slate-200 p-4 rounded-xl hover:border-amber-400/40 transition-all shadow-sm flex flex-col justify-between gap-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className="text-[10px] text-slate-400 font-mono">
                                Petsa ng Pag-save: <span className="text-slate-700 font-bold bg-slate-100 px-1.5 py-0.5 rounded occurrence-date">{item.savedAt}</span>
                              </span>
                              <span className="text-[9.5px] text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-150 px-1.5 py-0.5 rounded font-mono uppercase tracking-tight">
                                Saved Plan
                              </span>
                            </div>
                            <h4 className="font-bold text-slate-800 text-xs leading-snug line-clamp-1 font-display">
                              {item.plan.name}
                            </h4>
                            <p className="text-[11px] text-slate-500 font-sans line-clamp-2 leading-relaxed">
                              {item.plan.competency}
                            </p>
                          </div>

                          <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                            <span className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]" title={item.plan.teacher}>
                              Guro: {item.plan.teacher}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setActivePlan(item.plan);
                                  setActivePreviewDayNo(1);
                                  setErrorMessage(`Matagumpay na naiload ang iyong iniligtas na template: "${item.plan.name}"!`);
                                  setTimeout(() => {
                                    document.getElementById("active-plan-preview")?.scrollIntoView({ behavior: "smooth" });
                                  }, 150);
                                }}
                                className="py-1 px-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 text-[10.5px] font-bold uppercase tracking-wider rounded font-mono cursor-pointer transition-all"
                              >
                                Buksan Preview
                              </button>
                              <button
                                onClick={() => deleteSavedPlan(item.id)}
                                className="py-1 px-2 hover:bg-red-50 text-red-500 hover:text-red-700 text-[10.5px] font-bold rounded cursor-pointer transition-all border border-transparent hover:border-red-100"
                                title="Burahin sa Bank"
                              >
                                I-delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Left Column Component Files Tree Navigation (1 Column) */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 md:col-span-1 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-2">
                      📁 Kurikulum Diretoryo (Folders)
                    </h3>
                    
                    <div className="space-y-2">
                      {curriculumData.map((category) => {
                        const isExpanded = !!expandedComponents[category.id];
                        return (
                          <div key={category.id} className="space-y-1">
                            {/* Directory parent node title */}
                            <button
                              onClick={() => toggleComponentFolder(category.id)}
                              className="w-full text-left font-display text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100/50 hover:bg-slate-100 py-2 px-2.5 rounded-lg flex items-center justify-between transition-all cursor-pointer border border-slate-200/50"
                            >
                              <div className="flex items-center gap-2 truncate">
                                {isExpanded ? (
                                  <FolderOpen className="w-4 h-4 text-amber-500 shrink-0" />
                                ) : (
                                  <Folder className="w-4 h-4 text-slate-400 shrink-0" />
                                )}
                                <span className="font-medium truncate">{category.name}</span>
                              </div>
                              <ChevronRight className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-all ${isExpanded ? "rotate-90" : ""}`} />
                            </button>

                            {/* List child sectors if expanded */}
                            {isExpanded && (
                              <div className="pl-4 pr-1 py-1 space-y-1 border-l border-slate-200 ml-4">
                                {category.sectors.map((sect) => (
                                  <button
                                    key={sect.id}
                                    onClick={() => {
                                      setSelectedBankSectorId(sect.id);
                                      setSelectedBankWeekNum(0); // clear week on change
                                      // also set the matching generation select states in background
                                      setSelectedComponentId(category.id);
                                      setSelectedSectorId(sect.id);
                                    }}
                                    className={`w-full text-left text-xs py-1.5 px-2.5 rounded-md flex items-center justify-between transition-all cursor-pointer ${
                                      selectedBankSectorId === sect.id
                                        ? "bg-slate-900 text-white font-medium shadow-sm"
                                        : "text-slate-600 hover:bg-slate-200/50"
                                    }`}
                                  >
                                    <span className="truncate">{sect.name}</span>
                                    {sect.preGenerated && (
                                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" title="Contains exemplar ready material" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mid Column Weeks list of competencies (2 Columns matching selected Sector) */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 md:col-span-2 space-y-4">
                    {selectedBankSectorId ? (
                      (() => {
                        // Find matching active sector detail
                        let activeSec: Sector | undefined;
                        let activeCompId = "";
                        for (const c of curriculumData) {
                          const s = c.sectors.find((sec) => sec.id === selectedBankSectorId);
                          if (s) {
                            activeSec = s;
                            activeCompId = c.id;
                            break;
                          }
                        }

                        if (!activeSec) return null;

                        return (
                          <div className="space-y-3">
                            <div className="border-b border-slate-200 pb-2">
                              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                                📑 MGA LINGGO (WEEKS) NG {activeSec.name}
                              </h3>
                              <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                                Select any week to preview the curriculum learning competency, check or load its files.
                              </p>
                            </div>

                            <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-1">
                              {Object.keys(activeSec.weeks).map((weekStr) => {
                                const wNum = parseInt(weekStr);
                                const isWeekPreGen = !!activeSec?.preGenerated?.[wNum];
                                const weekComp = activeSec?.weeks[wNum];
                                const matchingSavedInWeek = savedPlans.filter(
                                  (p) =>
                                    p.componentId === activeCompId &&
                                    p.sectorId === selectedBankSectorId &&
                                    p.weekNum === wNum
                                );

                                return (
                                    <div
                                      key={wNum}
                                      className={`p-3.5 rounded-xl border transition-all flex flex-col gap-3 text-xs ${
                                        selectedBankWeekNum === wNum
                                          ? "bg-white border-amber-500 shadow-md"
                                          : "bg-white hover:bg-slate-50/50 border-slate-200"
                                      }`}
                                    >
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="space-y-1 flex-1">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="px-2 py-0.5 bg-slate-105 border border-slate-200 text-[10px] text-slate-600 font-bold uppercase font-mono rounded">
                                              Week {wNum} Target
                                            </span>
                                            {isWeekPreGen && (
                                              <span className="px-2 py-0.5 bg-amber-100 border border-amber-200 text-[10.5px] text-slate-900 font-medium rounded flex items-center gap-1 font-mono">
                                                🌟 Standard Exemplar Ready
                                              </span>
                                            )}
                                            {matchingSavedInWeek.length > 0 && (
                                              <span className="px-2 py-0.5 bg-emerald-100 border border-emerald-200 text-[10.5px] text-emerald-900 font-medium rounded flex items-center gap-1 font-mono">
                                                📁 {matchingSavedInWeek.length} My Saved File{matchingSavedInWeek.length > 1 ? "s" : ""}
                                              </span>
                                            )}
                                          </div>
                                          <p className="font-medium text-slate-800 leading-relaxed max-w-xl">
                                            {weekComp.competency}
                                          </p>
                                        </div>

                                        <div className="shrink-0 flex items-center gap-2">
                                          {isWeekPreGen ? (
                                            <button
                                              onClick={() => {
                                                setSelectedBankWeekNum(wNum);
                                                loadBankPlan(activeCompId, selectedBankSectorId, wNum);
                                              }}
                                              className="py-1.5 px-3 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-semibold rounded-lg font-mono text-[11px] tracking-tight cursor-pointer shadow-sm transition-all"
                                            >
                                              Buksan Preview (Load)
                                            </button>
                                          ) : (
                                            <button
                                              onClick={() => {
                                                setSelectedBankWeekNum(wNum);
                                                loadBankPlan(activeCompId, selectedBankSectorId, wNum);
                                              }}
                                              className="py-1.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg font-mono text-[11px] tracking-tight cursor-pointer transition-all"
                                            >
                                              Suriin sa Engine
                                            </button>
                                          )}
                                        </div>
                                      </div>

                                      {/* Sub-list of user saved files in this week folder */}
                                      {matchingSavedInWeek.length > 0 && (
                                        <div className="mt-2.5 pt-2.5 border-t border-slate-100 space-y-1.5">
                                          <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-emerald-800 uppercase tracking-tight font-mono">
                                            <FileText className="w-3.5 h-3.5 text-emerald-600" />
                                            Mga Naka-save na File sa Folder na ito:
                                          </div>
                                          <div className="space-y-1.5">
                                            {matchingSavedInWeek.map((saved) => (
                                              <div
                                                key={saved.id}
                                                className="bg-emerald-50/50 border border-emerald-100 p-2.5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                              >
                                                <div className="space-y-0.5 min-w-0 flex-1">
                                                  <div className="font-bold text-slate-800 truncate flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                                                    {saved.plan.name}
                                                  </div>
                                                  <div className="text-[10px] text-slate-500 flex items-center gap-1.5 flex-wrap">
                                                    <span>Guro: <strong className="text-slate-700">{saved.plan.teacher}</strong></span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                      <Calendar className="w-3 h-3 text-slate-400" />
                                                      Iniligtas noong: <strong className="text-slate-800 font-mono">{saved.savedAt}</strong>
                                                    </span>
                                                  </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                  <button
                                                    onClick={() => {
                                                      setActivePlan(saved.plan);
                                                      setActivePreviewDayNo(1);
                                                      setErrorMessage(`Matagumpay na naiload ang iniligtas na plan: "${saved.plan.name}"!`);
                                                      setTimeout(() => {
                                                        document.getElementById("active-plan-preview")?.scrollIntoView({ behavior: "smooth" });
                                                      }, 150);
                                                    }}
                                                    className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-[10px] tracking-wide rounded font-mono transition-all uppercase cursor-pointer"
                                                  >
                                                    Tingnan File
                                                  </button>
                                                  <button
                                                    onClick={() => deleteSavedPlan(saved.id)}
                                                    className="py-1 px-2 text-slate-400 hover:text-red-600 hover:bg-red-50 text-[10px] rounded transition-all cursor-pointer border border-transparent hover:border-red-100"
                                                    title="Burahin ang file"
                                                  >
                                                    I-delete
                                                  </button>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                              })}
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 space-y-3">
                        <FolderOpen className="w-12 h-12 text-slate-300 animate-pulse" />
                        <div className="space-y-1 max-w-sm">
                          <p className="font-medium text-slate-700">Wala Pang Napiling Sector subfolder</p>
                          <p className="text-xs leading-normal text-slate-400">
                            Pumili po ng component sa kaliwang bahagi, at i-click ang sector para i-browse ang weekly Budget of Work list.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

              </div>
            )}

            {/* LIVE LOADING INDICATOR (no-print) */}
            {isGenerating && (
              <div className="p-8 bg-slate-900 border border-slate-800/80 rounded-2xl shadow-xl flex flex-col items-center justify-center text-center space-y-4 max-w-lg mx-auto no-print">
                <RefreshCw className="w-10 h-10 animate-spin text-amber-500" />
                <div className="space-y-1 w-full">
                  <h3 className="font-display font-semibold text-white tracking-wide">Pagsusuri ng ILAW Artificial Intelligence</h3>
                  <p className="text-xs text-slate-305 font-mono bg-slate-950/80 px-4 py-2 border border-slate-800 rounded-lg inline-block">
                    {generationStep}
                  </p>
                </div>
                <div className="w-full max-w-[200px] h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full animate-infinite-loading w-1/3" />
                </div>
                <p className="text-[10px] text-slate-400 leading-normal max-w-xs">
                  Salamat sa paghihintay. Ito ay un-interrupted call sa Gemini 3.5 AI Engine para i-structure ang Knowledge, Skills, at Attitude objectives.
                </p>
              </div>
            )}

            {/* DETAILED LOG OR ERROR CATCH (no-print) */}
            {errorMessage && (
              <div role="alert" className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl max-w-3xl mx-auto flex items-start gap-3 text-xs leading-relaxed text-amber-800 font-sans tracking-wide shadow-sm no-print">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 animate-bounce" />
                <div className="space-y-1">
                  <p className="font-semibold uppercase tracking-wider text-[10px] text-amber-700 font-mono">Curricular Guide Indicator / Notification</p>
                  <p>{errorMessage}</p>
                </div>
              </div>
            )}

            {/* 3. ACTIVE PREVIEW PANELS (Generated/Loaded Lesson Plans) */}
            {activeLessonPlan && !isGenerating && (
              <div className="space-y-6" id="active-plan-preview">
                
                {/* Visual Options Header toolbar (no-print) */}
                <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 no-print">
                  <div className="space-y-1 text-center md:text-left">
                    <p className="text-[10px] font-bold text-amber-400 tracking-wider uppercase font-mono">
                      ✨ NA-GENERATE NA ILAW LESSON PLAN LAYOUT
                    </p>
                    <h3 className="font-display font-medium text-white max-w-xl truncate text-sm">
                      {activeLessonPlan.name}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {/* save to bank button */}
                    <button
                      onClick={saveActivePlanToBank}
                      className="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 border border-emerald-500 rounded-lg text-xs font-mono font-bold tracking-tight text-white flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                      id="btn-save-to-bank"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-250 animate-pulse" />
                      I-save sa Bank
                    </button>

                    {/* download Word (.docx) file button */}
                    <button
                      onClick={triggerDOCXDownload}
                      className="py-1.5 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-750 border border-blue-500 rounded-lg text-xs font-mono font-semibold tracking-tight text-white flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                      id="btn-download-docx"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-200" />
                      Word (.docx)
                    </button>

                    {/* print landscape button */}
                    <button
                      onClick={triggerLandscapePrint}
                      className="py-1.5 px-4 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold font-sans text-xs tracking-wide rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                      id="btn-print-landscape"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Download as PDF file
                    </button>
                  </div>
                </div>

                {/* Day selector navigation for client interactive-review (no-print) */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 no-print shadow-sm">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">
                    Araw Preview (Daily Tabs):
                  </span>
                  
                  <div className="grid grid-cols-4 gap-1.5 w-full md:w-auto">
                    {[1, 2, 3, 4].map((dayNum) => {
                      const dayData = activeLessonPlan.days.find((d) => d.dayNo === dayNum);
                      return (
                        <button
                          key={dayNum}
                          onClick={() => setActivePreviewDayNo(dayNum)}
                          className={`py-2 px-3.5 text-xs font-semibold rounded-lg transition-all cursor-pointer truncate ${
                            activePreviewDayNo === dayNum
                              ? "bg-slate-900 text-white font-semibold"
                              : "bg-slate-100/70 hover:bg-slate-200 text-slate-600"
                          }`}
                          id={`btn-day-tab-${dayNum}`}
                        >
                          Day {dayNum} {dayData ? ` - ${dayData.title}` : ""}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* VISUAL DIGITAL RENDER SHEET OF THE ACTIVE DAY IN LANDSCAPE LOGIC (no-print) */}
                {(() => {
                  const dayPlan = activeLessonPlan.days.find((d) => d.dayNo === activePreviewDayNo);
                  if (!dayPlan) return null;

                  return (
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-md p-6 space-y-5 no-print relative overflow-x-auto">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                        <div className="space-y-0.5">
                          <span className="px-2 py-0.5 bg-amber-100 border border-amber-200 text-[10px] text-slate-800 font-bold uppercase rounded font-mono">
                            DAY {dayPlan.dayNo} ACTIVE TARGET REVIEW
                          </span>
                          <h4 className="font-display font-medium text-slate-900 text-sm">
                            {dayPlan.title}
                          </h4>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono tracking-wider">
                          *Double-click text cell borders below to do instant edits.
                        </span>
                      </div>

                      {/* LANDSCAPE MOCK RENDER OF COMPLIANT BLOCKS */}
                      <div className="min-w-[800px] border border-slate-300 rounded-lg overflow-hidden divide-y divide-slate-200 text-xs">
                        
                        {/* Upper Section parameters row */}
                        <div className="grid grid-cols-4 bg-slate-950 text-white p-3 font-mono font-medium gap-3">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-light">NAME OF LESSON</span>
                            <span className="text-amber-400">{activeLessonPlan.name}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-light">LEARNING AREA</span>
                            <p className="truncate" title={activeLessonPlan.learningArea}>{activeLessonPlan.learningArea}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-light">DESIGNED BY TEACHER/S</span>
                            <span className="text-slate-350">{activeLessonPlan.teacher}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-light">DESIGNED FOR LEVEL/SEC</span>
                            <span className="text-slate-350">{activeLessonPlan.gradeAndSection}</span>
                          </div>
                        </div>

                        {/* Unpacked Learning Competency block fully layouted */}
                        <div className="p-3.5 bg-slate-50 border-b border-slate-150 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                            Learning Competency / Content Performance Standard:
                          </span>
                          <p className="font-semibold text-slate-800 leading-relaxed font-display text-sm">
                            {activeLessonPlan.competency}
                          </p>
                        </div>

                        {/* Objectives Intentions Box Block */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                          
                          {/* Inner Objectives grid */}
                          <div className="p-4 space-y-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">
                              Intentions - Learning Objectives (KSA)
                            </span>
                            
                            <div className="space-y-2.5">
                              <div>
                                <span className="px-1.5 py-0.5 bg-sky-200/50 border border-sky-400/20 text-[9px] text-sky-800 font-bold uppercase rounded font-mono mr-1.5 inline-block">K</span>
                                <input
                                  type="text"
                                  value={dayPlan.objectives.knowledge}
                                  onChange={(e) => updatePlanField(dayPlan.dayNo, "objectives.knowledge", e.target.value)}
                                  className="w-full bg-transparent font-medium border-b border-dashed border-transparent hover:border-slate-300 focus:border-slate-500 py-1"
                                />
                              </div>
                              <div>
                                <span className="px-1.5 py-0.5 bg-emerald-250/50 border border-emerald-400/20 text-[9px] text-emerald-800 font-bold uppercase rounded font-mono mr-1.5 inline-block">S</span>
                                <input
                                  type="text"
                                  value={dayPlan.objectives.skills}
                                  onChange={(e) => updatePlanField(dayPlan.dayNo, "objectives.skills", e.target.value)}
                                  className="w-full bg-transparent font-medium border-b border-dashed border-transparent hover:border-slate-300 focus:border-slate-500 py-1"
                                />
                              </div>
                              <div>
                                <span className="px-1.5 py-0.5 bg-purple-200/50 border border-purple-400/20 text-[9px] text-purple-800 font-bold uppercase rounded font-mono mr-1.5 inline-block">A</span>
                                <input
                                  type="text"
                                  value={dayPlan.objectives.attitude}
                                  onChange={(e) => updatePlanField(dayPlan.dayNo, "objectives.attitude", e.target.value)}
                                  className="w-full bg-transparent font-medium border-b border-dashed border-transparent hover:border-slate-300 focus:border-slate-500 py-1"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Learner Context block */}
                          <div className="p-4 space-y-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">
                              Intentions - Learner Context Observations
                            </span>
                            <div className="text-slate-700 leading-relaxed font-sans max-h-[145px] overflow-y-auto pr-1">
                              {dayPlan.objectives.knowledge ? (
                                <p>{activeLessonPlan.context}</p>
                              ) : (
                                <p className="text-slate-450 italic">Walang Context Observations.</p>
                              )}
                            </div>
                          </div>

                          {/* AI Declaration header and details */}
                          <div className="p-4 bg-slate-50 space-y-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">
                              Declaration of AI use (DO 3, s. 2026)
                            </span>
                            <p className="text-slate-600 leading-relaxed font-mono text-[10.5px]">
                              {activeLessonPlan.declarationOfAI}
                            </p>
                          </div>
                        </div>

                        {/* Learning Experience Block (PreLesson, I Do, We Do, You Do) */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                          
                          {/* Ready and routines (PreLesson) */}
                          <div className="p-4 space-y-2.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">
                              1. Pre-Lesson Activities
                            </span>
                            <ul className="list-disc pl-4 space-y-1.5 text-slate-700 leading-normal">
                              {dayPlan.experience.preLesson.map((step, idx) => (
                                <li key={idx}>{step}</li>
                              ))}
                            </ul>
                          </div>

                          {/* Instructional Flow grids */}
                          <div className="p-4 space-y-2.5 md:col-span-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">
                              2. Scaffolded Instructional Flow
                            </span>
                            
                            <div className="space-y-3">
                              <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg space-y-1">
                                <span className="inline-block text-[9.5px] font-bold text-amber-705 uppercase font-mono">Teacher Modeling (I DO):</span>
                                <ul className="list-disc pl-4 space-y-1 font-sans text-slate-700">
                                  {dayPlan.experience.flow.iDo.map((item, id) => (
                                    <li key={id}>{item}</li>
                                  ))}
                                </ul>
                              </div>

                              <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg space-y-1">
                                <span className="inline-block text-[9.5px] font-bold text-amber-750 uppercase font-mono">Guided group (WE DO):</span>
                                <ul className="list-disc pl-4 space-y-1 font-sans text-slate-700">
                                  {dayPlan.experience.flow.weDo.map((item, id) => (
                                    <li key={id}>{item}</li>
                                  ))}
                                </ul>
                              </div>

                              <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg space-y-1">
                                <span className="inline-block text-[9.5px] font-bold text-amber-750 uppercase font-mono">Independent task (YOU DO):</span>
                                <ul className="list-disc pl-4 space-y-1 font-sans text-slate-700">
                                  {dayPlan.experience.flow.youDo.map((item, id) => (
                                    <li key={id}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>

                          {/* Emergency Resources and integrations */}
                          <div className="p-4 space-y-4">
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">
                                3. Resources & alternatives
                              </span>
                              <ul className="list-disc pl-4 space-y-1 text-slate-705">
                                {dayPlan.experience.resources.map((res, id) => (
                                  <li key={id}>{res}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="space-y-1.5 border-t border-slate-200/50 pt-2.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">
                                4. Opportunities for Integration
                              </span>
                              <ul className="list-disc pl-4 space-y-1 text-slate-700 font-mono text-[10.5px]">
                                {dayPlan.experience.integration.map((int, id) => (
                                  <li key={id}>{int}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Assessment parameters */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                          
                          {/* Task details and Accommodations */}
                          <div className="p-4 space-y-3.5">
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">
                                Formative Evaluation Task
                              </span>
                              <textarea
                                value={dayPlan.assessment.task}
                                onChange={(e) => updatePlanField(dayPlan.dayNo, "assessment.task", e.target.value)}
                                rows={3}
                                className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-805 leading-relaxed leading-normal focus:outline-none"
                              />
                            </div>

                            <div className="space-y-1 bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-lg">
                              <span className="text-[9.5px] font-bold text-amber-705 uppercase font-mono block">
                                Divergent Accommodations:
                              </span>
                              <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-650">
                                {dayPlan.assessment.accommodations.map((acc, id) => (
                                  <li key={id}>{acc}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Formative Matrix Rubric criteria points list */}
                          <div className="p-4 space-y-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">
                              Evaluation Rubric Grid (50 Points Total)
                            </span>
                            
                            <div className="border border-slate-200 rounded overflow-hidden divide-y divide-slate-100">
                              <div className="grid grid-cols-4 bg-slate-100 p-1.5 font-bold text-[10px] font-mono text-slate-600">
                                <span className="col-span-3">CRITERIA PARAMETER</span>
                                <span className="text-right">PTS</span>
                              </div>
                              {dayPlan.assessment.rubric.map((rub, id) => (
                                <div key={id} className="grid grid-cols-4 p-1.5 text-[11px] leading-normal font-medium text-slate-700">
                                  <span className="col-span-3">{rub.criteria}</span>
                                  <span className="text-right font-mono text-amber-600">{rub.points} pts</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* checkup Oral Questions */}
                          <div className="p-4 space-y-2 bg-slate-50/50">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">
                              Analytical checkup Oral Questions
                            </span>
                            <ul className="list-decimal pl-4 space-y-2 font-display font-medium text-slate-750 max-h-[140px] overflow-y-auto">
                              {dayPlan.assessment.oralQuestions.map((q, id) => (
                                <li key={id}>{q}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Ways Forward reflections list */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                          
                          <div className="p-4 space-y-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">
                              Extended Learning Opportunities (Outside Classroom)
                            </span>
                            <ul className="list-disc pl-4 space-y-1 text-slate-700 leading-normal">
                              {dayPlan.waysForward.extendedLearning.map((ext, id) => (
                                <li key={id}>{ext}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-4 bg-slate-50 space-y-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">
                              Teacher Reflection Prompts
                            </span>
                            <ul className="list-decimal pl-4 space-y-1 text-slate-600 leading-relaxed font-mono text-[10.5px]">
                              {dayPlan.waysForward.reflections.map((ref, id) => (
                                <li key={id}>{ref}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })()}

                {/* HIDDEN PRINT PREVIEW SECTION FOR ALL 4 DAYS STACKED TO PRINT TOGETHER IN BEAUTIFUL FORM */}
                <div className="hidden print:block space-y-12">
                  <div className="text-center pb-8 border-b-2 border-slate-900 border-double">
                    <h2 className="text-3xl font-display font-bold tracking-tight text-slate-900 uppercase">
                      4-Day DepEd ILAW format lesson plans
                    </h2>
                    <p className="text-sm font-mono text-slate-600 mt-1">
                      Designed and Unpacked in Compliance with DO 3, s. 2026 Annex A Regulations
                    </p>
                    <p className="text-sm font-sans font-medium text-slate-800 mt-0.5">
                      Designed by Teacher: {activeLessonPlan.teacher} | Grade & Section: {activeLessonPlan.gradeAndSection}
                    </p>
                  </div>

                  {activeLessonPlan.days.map((dayPlan) => (
                    <div key={dayPlan.dayNo} className="print-page space-y-4">
                      
                      {/* Day Header */}
                      <div className="flex justify-between items-end border-b-2 border-slate-900 pb-2">
                        <div>
                          <span className="px-2 py-0.5 bg-slate-900 text-white font-mono text-[10px] font-bold rounded">
                            DAY {dayPlan.dayNo} OF 4
                          </span>
                          <h3 className="text-xl font-display font-semibold tracking-tight text-slate-900 mt-1">
                            {dayPlan.title}
                          </h3>
                        </div>
                        <div className="text-right font-mono text-[10.5px] text-slate-500">
                          <span>Session Time: 60 mins each | Class focus</span>
                        </div>
                      </div>

                      {/* LANDSCAPE TABLE MOCK FOR STANDARD PRINTING */}
                      <div className="border border-slate-950 divide-y divide-slate-950 text-xs">
                        
                        {/* Upper row parameters metadata */}
                        <div className="grid grid-cols-4 bg-slate-900 text-white p-2 font-mono text-[10px] font-semibold tracking-tight">
                          <div>
                            <span className="text-[8.5px] text-slate-400 block font-light">NAME OF LESSON</span>
                            <span>{activeLessonPlan.name}</span>
                          </div>
                          <div>
                            <span className="text-[8.5px] text-slate-400 block font-light">LEARNING AREA</span>
                            <span>{activeLessonPlan.learningArea}</span>
                          </div>
                          <div>
                            <span className="text-[8.5px] text-slate-400 block font-light">DESIGNED BY TEACHER/S</span>
                            <span>{activeLessonPlan.teacher}</span>
                          </div>
                          <div>
                            <span className="text-[8.5px] text-slate-400 block font-light">DESIGNED FOR LEVEL/SEC</span>
                            <span>{activeLessonPlan.gradeAndSection}</span>
                          </div>
                        </div>

                        {/* Unpacked Learning Competency block fully layouted */}
                        <div className="p-2.5 bg-slate-50">
                          <span className="text-[9px] font-bold text-slate-550 uppercase tracking-wider font-mono block">
                            Learning Competency / Content Performance Standard:
                          </span>
                          <p className="font-semibold text-slate-900 leading-normal font-sans">
                            {activeLessonPlan.competency}
                          </p>
                        </div>

                        {/* Intentions Grid column block */}
                        <div className="grid grid-cols-3 divide-x divide-slate-950">
                          
                          {/* Objectives lists */}
                          <div className="p-3 space-y-2">
                            <span className="text-[9px] font-bold text-slate-550 uppercase tracking-wider font-mono block">
                              Intentions - Learning Objectives (KSA)
                            </span>
                            <div className="space-y-1.5 font-medium leading-normal">
                              <p><span className="font-bold font-mono text-slate-550">[K]</span> {dayPlan.objectives.knowledge}</p>
                              <p><span className="font-bold font-mono text-slate-550">[S]</span> {dayPlan.objectives.skills}</p>
                              <p><span className="font-bold font-mono text-slate-550">[A]</span> {dayPlan.objectives.attitude}</p>
                            </div>
                          </div>

                          {/* Learner Context block */}
                          <div className="p-3 space-y-1.5">
                            <span className="text-[9px] font-bold text-slate-550 uppercase tracking-wider font-mono block">
                              Intentions - Learner Context Observations
                            </span>
                            <p className="text-slate-800 leading-relaxed font-sans text-[11px]">
                              {activeLessonPlan.context}
                            </p>
                          </div>

                          {/* AI Declaration header and details */}
                          <div className="p-3 bg-slate-50 space-y-1.5">
                            <span className="text-[9px] font-bold text-slate-550 uppercase tracking-wider font-mono block">
                              Declaration of AI use (DO 3, s. 2026 Annex A)
                            </span>
                            <p className="text-slate-700 leading-relaxed font-mono text-[10px]">
                              {activeLessonPlan.declarationOfAI}
                            </p>
                          </div>
                        </div>

                        {/* Learning Experience Column block */}
                        <div className="grid grid-cols-4 divide-x divide-slate-950">
                          
                          {/* Pre Lesson */}
                          <div className="p-3 space-y-2">
                            <span className="text-[9px] font-bold text-slate-550 uppercase tracking-wider font-mono block">
                              1. Pre-Lesson Activities
                            </span>
                            <ul className="list-disc pl-4 space-y-1 text-slate-800 font-sans leading-normal">
                              {dayPlan.experience.preLesson.map((step, idx) => (
                                <li key={idx}>{step}</li>
                              ))}
                            </ul>
                          </div>

                          {/* Flow I DO / WE DO / YOU DO */}
                          <div className="p-3 space-y-2 col-span-2">
                            <span className="text-[9px] font-bold text-slate-550 uppercase tracking-wider font-mono block">
                              2. Scaffolded Instructional Flow
                            </span>
                            
                            <div className="space-y-2">
                              <p className="leading-snug text-slate-800">
                                <strong className="font-mono text-[10px] text-slate-900 block">[I DO] Teacher Modeling & Demotech:</strong>
                                {dayPlan.experience.flow.iDo.join(" | ")}
                              </p>
                              
                              <p className="leading-snug text-slate-800">
                                <strong className="font-mono text-[10px] text-slate-900 block">[WE DO] Guided Group Exercises:</strong>
                                {dayPlan.experience.flow.weDo.join(" | ")}
                              </p>

                              <p className="leading-snug text-slate-800">
                                <strong className="font-mono text-[10px] text-slate-900 block">[YOU DO] Independent Work / Presentations:</strong>
                                {dayPlan.experience.flow.youDo.join(" | ")}
                              </p>
                            </div>
                          </div>

                          {/* Resources and Integration */}
                          <div className="p-3 space-y-3">
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-slate-550 uppercase tracking-wider font-mono block">
                                3. Resources & Emergency backups
                              </span>
                              <p className="text-slate-800 leading-normal text-[11px]">
                                {dayPlan.experience.resources.join(", ")}
                              </p>
                            </div>

                            <div className="space-y-1 border-t border-slate-300 pt-1.5">
                              <span className="text-[9px] font-bold text-slate-550 uppercase tracking-wider font-mono block">
                                4. Integration Anchors
                              </span>
                              <p className="text-slate-700 font-mono text-[10.5px]">
                                {dayPlan.experience.integration.join(", ")}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Assessment Column block */}
                        <div className="grid grid-cols-3 divide-x divide-slate-950">
                          
                          {/* Task and Accommodates */}
                          <div className="p-3 space-y-2.5">
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-slate-550 uppercase tracking-wider font-mono block">
                                Formative Assessment Task
                              </span>
                              <p className="text-slate-900 font-sans font-medium">
                                {dayPlan.assessment.task}
                              </p>
                            </div>

                            <div className="space-y-1 bg-slate-100 p-1.5 rounded">
                              <strong className="text-[8.5px] font-mono text-slate-650 block">Accommodations:</strong>
                              <p className="text-[10px] text-slate-700">{dayPlan.assessment.accommodations.join(", ")}</p>
                            </div>
                          </div>

                          {/* Rubric Points */}
                          <div className="p-3 space-y-1 w-full">
                            <span className="text-[9px] font-bold text-slate-550 uppercase tracking-wider font-mono block">
                              Evaluation Rubric (50 Pts Total)
                            </span>
                            
                            <table className="w-full border-collapse border border-slate-950 text-[10.5px]">
                              <thead>
                                <tr className="bg-slate-100 font-mono font-bold text-[9px] leading-none text-slate-700">
                                  <th className="border border-slate-950 p-1 text-left">Criteria Parameter</th>
                                  <th className="border border-slate-950 p-1 text-right w-16">Points</th>
                                </tr>
                              </thead>
                              <tbody>
                                {dayPlan.assessment.rubric.map((rub, i) => (
                                  <tr key={i} className="leading-normal">
                                    <td className="border border-slate-950 p-1">{rub.criteria}</td>
                                    <td className="border border-slate-950 p-1 text-right font-mono font-bold text-slate-800">{rub.points} pts</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* checkup Oral Questions */}
                          <div className="p-3 space-y-1">
                            <span className="text-[9px] font-bold text-slate-550 uppercase tracking-wider font-mono block">
                              Oral Reflection checkup Questions
                            </span>
                            <ul className="list-decimal pl-4 space-y-1 leading-snug">
                              {dayPlan.assessment.oralQuestions.map((q, id) => (
                                <li key={id}>{q}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Ways Forward column block */}
                        <div className="grid grid-cols-2 divide-x divide-slate-950">
                          <div className="p-3 space-y-1">
                            <span className="text-[9px] font-bold text-slate-550 uppercase tracking-wider font-mono block">
                              Extended Learning Opportunities
                            </span>
                            <ul className="list-disc pl-4 space-y-1 text-slate-800 leading-normal">
                              {dayPlan.waysForward.extendedLearning.map((ext, idx) => (
                                <li key={idx}>{ext}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-3 bg-slate-50 space-y-1">
                            <span className="text-[9px] font-bold text-slate-550 uppercase tracking-wider font-mono block">
                              Teacher Reflection Prompts Page
                            </span>
                            <ul className="list-decimal pl-4 space-y-1 text-slate-700 font-mono text-[10px]">
                              {dayPlan.waysForward.reflections.map((ref, idx) => (
                                <li key={idx}>{ref}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* If no plan is active, display a clean helpful welcome showcase */}
            {!activeLessonPlan && !isGenerating && (
              <div className="bg-white border border-slate-205 rounded-2xl p-12 text-center max-w-2xl mx-auto space-y-6 shadow-sm no-print">
                <span className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl inline-block shadow-inner">
                  <BookOpen className="w-12 h-12" />
                </span>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-display font-semibold tracking-tight text-slate-900">
                    Welcome sa ILAW DepEd Lesson Plan Engine
                  </h2>
                  <p className="text-xs text-slate-500 leading-relaxed font-sans max-w-md mx-auto">
                    Mag-generate ng 4-araw na customized na lesson plan mula sa opisyal na curriculum standards, o buksan ang aming template library para sa visual exemplars.
                  </p>
                </div>

                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setActivePortalTab("generator")}
                    className="py-2.5 px-5 bg-slate-905 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs cursor-pointer shadow-md transition-all flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                    Buksan Generator Engine
                  </button>
                  <button
                    onClick={() => {
                      setActivePortalTab("bank");
                      setSelectedBankSectorId("food_prep");
                    }}
                    className="py-2.5 px-5 bg-slate-100 hover:bg-slate-205 text-slate-700 border border-slate-200 font-semibold rounded-xl text-xs cursor-pointer transition-all"
                  >
                    Tumingin sa ILAW Bank
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <p className="text-[11px] text-slate-400 font-mono">
                    Designed and Unpacked with strict compliance to Department of Education DO 3, s. 2026 Annex A.<br />
                    Developed by <span className="text-slate-600 font-sans font-medium">Celso Antonio B. Tabares IV (Teacher I, Toboso National High School)</span>.
                  </p>
                </div>
              </div>
            )}

          </main>

          {/* Core Footer Element (no-print) */}
          <footer className="bg-white border-t border-slate-200 mt-12 py-6 no-print">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
              <span className="font-mono">
                &copy; {new Date().getFullYear()} ILAW lesson engine platform. All Rights Reserved.
              </span>
              <div className="flex items-center gap-2.5 font-mono">
                <span>Developer/Chief Architect:</span>
                <span className="font-sans font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
                  Celso Antonio B. Tabares IV (Teacher I - Toboso National High School)
                </span>
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100 font-mono">
                COMPLIANT-STATUS: SYSTEM LIVE (2026 UTC CLOCK)
              </span>
            </div>
          </footer>

        </div>
      )}

    </div>
  );
}
