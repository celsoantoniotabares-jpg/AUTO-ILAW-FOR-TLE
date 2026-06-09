import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  PageOrientation,
  BorderStyle,
  VerticalAlign
} from "docx";
import { PreGeneratedPlan } from "./curriculumData";

/**
 * Generates an official, highly structured DOCX file payload as a Blob for a given 4-Day ILAW Lesson Plan.
 * Replicates the landscape page divisions and prompt guidelines of the official DepEd Appendix A template perfectly.
 */
export async function generateILAWDocx(plan: PreGeneratedPlan): Promise<Blob> {
  const COLOR_PRIMARY = "0F172A"; // Slate-900 border / dark texts
  const COLOR_SHADING = "F8FAFC"; // Subtle gray left column
  const COLOR_HEADER_BG = "E2E8F0"; // Ash gray header banner
  const COLOR_INNER_BORDER = "CBD5E1"; // Subtle border gray
  const COLOR_TEXT_DARK = "1E293B"; // Dark Charcoal
  const COLOR_TEXT_MUTED = "475569"; // Gray for instructions
  const FONT_FAMILY_SANS = "Calibri";
  const FONT_FAMILY_MONO = "Courier New";

  // Helper to create styled text
  const createTextRun = (text: string, options: { bold?: boolean; italic?: boolean; size?: number; color?: string; font?: string } = {}) => {
    return new TextRun({
      text,
      bold: options.bold ?? false,
      italics: options.italic ?? false,
      size: options.size ?? 21, // 21 half-points is 10.5pt
      color: options.color ?? COLOR_TEXT_DARK,
      font: options.font ?? FONT_FAMILY_SANS,
    });
  };

  // Helper to create left cell with header labels and the precise checklist instructions from Appendix A
  const createLeftCell = (label: string, instruction?: string) => {
    const lines: Paragraph[] = [
      new Paragraph({
        children: [
          createTextRun(label, { bold: true, size: 21, color: COLOR_PRIMARY }),
        ],
        spacing: { before: 80, after: 40 },
      })
    ];
    if (instruction) {
      lines.push(
        new Paragraph({
          children: [
            createTextRun(instruction, { italic: true, size: 17, color: COLOR_TEXT_MUTED }),
          ],
          spacing: { after: 80 },
        })
      );
    }
    return new TableCell({
      width: { size: 30, type: WidthType.PERCENTAGE },
      children: lines,
      verticalAlign: VerticalAlign.CENTER,
      shading: { fill: COLOR_SHADING },
    });
  };

  // Helper to create right cell filled with generated content paragraphs
  const createRightCell = (paragraphs: Paragraph[]) => {
    return new TableCell({
      width: { size: 70, type: WidthType.PERCENTAGE },
      children: paragraphs,
      verticalAlign: VerticalAlign.CENTER,
    });
  };

  // Helper to create full width master section banners (Intentions, Learning Experience, Assessment, Ways Forward)
  const createSectionHeaderRow = (title: string) => {
    return new TableRow({
      children: [
        new TableCell({
          columnSpan: 2,
          shading: { fill: COLOR_HEADER_BG },
          children: [
            new Paragraph({
              children: [
                createTextRun(title, { bold: true, size: 24, color: COLOR_PRIMARY }),
              ],
              spacing: { before: 120, after: 120 },
            })
          ],
        })
      ]
    });
  };

  // Helper to create a unified table config matching screenshot borders
  const createStyledTable = (rows: TableRow[]) => {
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 8, color: COLOR_PRIMARY },
        bottom: { style: BorderStyle.SINGLE, size: 8, color: COLOR_PRIMARY },
        left: { style: BorderStyle.SINGLE, size: 8, color: COLOR_PRIMARY },
        right: { style: BorderStyle.SINGLE, size: 8, color: COLOR_PRIMARY },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: COLOR_INNER_BORDER },
        insideVertical: { style: BorderStyle.SINGLE, size: 4, color: COLOR_INNER_BORDER },
      },
      rows,
    });
  };

  const sectionChildren: (Paragraph | Table)[] = [];

  // Generate 4 sequential days separate sections
  plan.days.forEach((day, index) => {
    // Top Cover Header
    sectionChildren.push(
      new Paragraph({
        pageBreakBefore: index > 0, // Force clear document page breaks between days
        children: [
          createTextRun("Appendix A", { size: 18, font: FONT_FAMILY_MONO, color: COLOR_TEXT_MUTED }),
        ],
        spacing: { before: 100, after: 40 },
      })
    );

    sectionChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          createTextRun("Lesson Plan Template", { bold: true, size: 28, color: COLOR_PRIMARY }),
        ],
        spacing: { after: 120 },
      })
    );

    sectionChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          createTextRun(`DAY ${day.dayNo}: ${day.title}`, { bold: true, size: 22, color: COLOR_TEXT_MUTED }),
        ],
        spacing: { after: 200 },
      })
    );

    // ==========================================
    // PAGE 1: METADATA & INTENTIONS TABLE
    // ==========================================
    const page1Rows: TableRow[] = [
      // Name of Lesson
      new TableRow({
        children: [
          createLeftCell("Name of Lesson"),
          createRightCell([
            new Paragraph({
              children: [createTextRun(plan.name, { bold: true, size: 20 })]
            })
          ])
        ]
      }),
      // Learning Area/s
      new TableRow({
        children: [
          createLeftCell("Learning Area/s"),
          createRightCell([
            new Paragraph({
              children: [createTextRun(plan.learningArea, { size: 20 })]
            })
          ])
        ]
      }),
      // Designed by Teacher/s
      new TableRow({
        children: [
          createLeftCell("Designed by Teacher/s"),
          createRightCell([
            new Paragraph({
              children: [createTextRun(plan.teacher || "Celso Antonio B. Tabares IV", { bold: true, size: 20 })]
            })
          ])
        ]
      }),
      // Designed for which Grade Level and Section
      new TableRow({
        children: [
          createLeftCell("Designed for which Grade Level and Section"),
          createRightCell([
            new Paragraph({
              children: [createTextRun(plan.gradeAndSection, { size: 20 })]
            })
          ])
        ]
      }),
      // No. of Sessions
      new TableRow({
        children: [
          createLeftCell("No. of Sessions"),
          createRightCell([
            new Paragraph({
              children: [createTextRun(`Day ${day.dayNo} of 4 Sessions (60 mins)`, { size: 20 })]
            })
          ])
        ]
      }),
      // References
      new TableRow({
        children: [
          createLeftCell(
            "References",
            "(books, websites, toolkits, etc.)"
          ),
          createRightCell(
            plan.references.map(ref => new Paragraph({
              children: [createTextRun(`• ${ref}`, { size: 19 })]
            }))
          )
        ]
      }),
      // Declaration of AI use
      new TableRow({
        children: [
          createLeftCell(
            "Declaration of AI use",
            "Cite how AI was used in the formulation of the lesson plan. See DO 3, 2026 Annex A."
          ),
          createRightCell([
            new Paragraph({
              children: [createTextRun(plan.declarationOfAI, { size: 18, font: FONT_FAMILY_MONO, italic: true })]
            })
          ])
        ]
      }),

      // Banner Header: Intentions.
      createSectionHeaderRow("Intentions."),

      // Learning Competency
      new TableRow({
        children: [
          createLeftCell(
            "Learning Competency:",
            "Write the competency/ies from the curriculum that we are targeting, and the content or performance standards applicable to the session."
          ),
          createRightCell([
            new Paragraph({
              children: [createTextRun(plan.competency, { bold: true, size: 20, color: COLOR_PRIMARY })]
            })
          ])
        ]
      }),
      // Learning Objectives
      new TableRow({
        children: [
          createLeftCell(
            "Learning Objectives:",
            "Write the smaller knowledge, skills, or tasks from the competency that the learners will work on and be able to show by the end of the sessions."
          ),
          createRightCell([
            new Paragraph({
              children: [createTextRun("Knowledge (K) Objective [Cognitive domain]:", { bold: true, size: 19, color: COLOR_TEXT_MUTED })]
            }),
            new Paragraph({
              children: [createTextRun(`• ${day.objectives.knowledge}`, { size: 19 })],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [createTextRun("Skills (S) Objective [Psychomotor domain]:", { bold: true, size: 19, color: COLOR_TEXT_MUTED })]
            }),
            new Paragraph({
              children: [createTextRun(`• ${day.objectives.skills}`, { size: 19 })],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [createTextRun("Attitude (A) Objective [Affective domain, Safety, Care]:", { bold: true, size: 19, color: COLOR_TEXT_MUTED })]
            }),
            new Paragraph({
              children: [createTextRun(`• ${day.objectives.attitude}`, { size: 19 })]
            })
          ])
        ]
      }),
      // Learner Context
      new TableRow({
        children: [
          createLeftCell(
            "Learner Context:",
            "Write your observations of your learners, and how they have been performing or responding to learning experiences recently. Include strengths, interests, and possible barriers to learning."
          ),
          createRightCell([
            new Paragraph({
              children: [createTextRun(plan.context || "Heterogeneous, responsive to cooperative hands-on learning models.", { size: 19 })]
            })
          ])
        ]
      })
    ];

    sectionChildren.push(createStyledTable(page1Rows));

    // Spacer paragraph to create clean layout
    sectionChildren.push(
      new Paragraph({
        pageBreakBefore: true, // Force clean page break to next template slide (Learning Experience)
        children: [
          createTextRun("Appendix A", { size: 18, font: FONT_FAMILY_MONO, color: COLOR_TEXT_MUTED }),
        ],
        spacing: { before: 100, after: 40 },
      })
    );

    // ==========================================
    // PAGE 2: LEARNING EXPERIENCE TABLE
    // ==========================================
    const page2Rows: TableRow[] = [
      createSectionHeaderRow("Learning Experience."),

      // Pre-Lesson
      new TableRow({
        children: [
          createLeftCell(
            "Pre-Lesson:",
            "Describe how you will help the learners get ready for the lesson."
          ),
          createRightCell(
            day.experience.preLesson.map(p => new Paragraph({
              children: [createTextRun(`• ${p}`, { size: 19 })]
            }))
          )
        ]
      }),
      // Flow
      new TableRow({
        children: [
          createLeftCell(
            "Flow:",
            "Describe the activities that you can implement in 1 or more sessions to meet the learning objectives.\n\nApply the Learning Design Principles by thinking about how to:\n• make the objectives clear for the learners\n• guide learners before letting them try the task on their own\n• check the state of the learners' well-being, understanding, and mastery over the lesson\n• connect today's new concepts to past competencies\n• encourage collaboration among learners\n• invite learners to reflect on why this matters to them\n• ensure inclusion for learners' varied abilities, learning styles, and contexts"
          ),
          createRightCell([
            new Paragraph({
              children: [createTextRun("1. Teacher Demonstration & Direct Instruction (I DO)", { bold: true, size: 20, color: COLOR_PRIMARY })]
            }),
            ...day.experience.flow.iDo.map(step => new Paragraph({
              children: [createTextRun(`  • ${step}`, { size: 19 })]
            })),
            new Paragraph({
              children: [createTextRun("2. Guided Practice & Cooperative Exercises (WE DO)", { bold: true, size: 20, color: COLOR_PRIMARY })],
              spacing: { before: 120 }
            }),
            ...day.experience.flow.weDo.map(step => new Paragraph({
              children: [createTextRun(`  • ${step}`, { size: 19 })]
            })),
            new Paragraph({
              children: [createTextRun("3. Independent Task & Output Verification (YOU DO)", { bold: true, size: 20, color: COLOR_PRIMARY })],
              spacing: { before: 120 }
            }),
            ...day.experience.flow.youDo.map(step => new Paragraph({
              children: [createTextRun(`  • ${step}`, { size: 19 })]
            }))
          ])
        ]
      }),
      // Learning Resources
      new TableRow({
        children: [
          createLeftCell(
            "Learning Resources:",
            "List down the learning resources that will help you reach your objectives. Ensure that they are available and inclusive.\n\nInclude options and alternatives in case of emergencies."
          ),
          createRightCell(
            day.experience.resources.map(res => new Paragraph({
              children: [createTextRun(`• ${res}`, { size: 19 })]
            }))
          )
        ]
      }),
      // Opportunities for Integration
      new TableRow({
        children: [
          createLeftCell(
            "Opportunities for Integration:",
            "Write down any possibilities to meaningfully anchor learning areas, special topic, or technology. Write N/A if none."
          ),
          createRightCell(
            day.experience.integration.map(int => new Paragraph({
              children: [createTextRun(`• ${int}`, { size: 19 })]
            }))
          )
        ]
      })
    ];

    sectionChildren.push(createStyledTable(page2Rows));

    // Spacer paragraph to create clean layout
    sectionChildren.push(
      new Paragraph({
        pageBreakBefore: true, // Force clean page break to next template slide (Assessment & Ways Forward)
        children: [
          createTextRun("Appendix A", { size: 18, font: FONT_FAMILY_MONO, color: COLOR_TEXT_MUTED }),
        ],
        spacing: { before: 100, after: 40 },
      })
    );

    // ==========================================
    // PAGE 3: ASSESSMENT & WAYS FORWARD TABLE
    // ==========================================
    const page3Rows: TableRow[] = [
      createSectionHeaderRow("Assessment."),

      // Formative Assessment
      new TableRow({
        children: [
          createLeftCell(
            "Formative Assessment:",
            "Create a task, activity, or questions to evaluate learning and provide feedback. Include ways for learners to ask for guidance or support.\n\nRemember to provide appropriate accommodations so all learners can demonstrate their understanding (e.g., varied response formats, small group options, visual or auditory supports)."
          ),
          createRightCell([
            new Paragraph({
              children: [createTextRun("Formative Evaluation Task Description:", { bold: true, size: 19, color: COLOR_PRIMARY })]
            }),
            new Paragraph({
              children: [createTextRun(day.assessment.task, { size: 19 })]
            }),
            new Paragraph({
              children: [createTextRun("Performance Evaluative Rubric Criteria:", { bold: true, size: 19, color: COLOR_PRIMARY })],
              spacing: { before: 120 }
            }),
            ...day.assessment.rubric.map(r => new Paragraph({
              children: [
                createTextRun(`• ${r.criteria}: `, { bold: true, size: 19 }),
                createTextRun(`${r.points} points`, { italic: true, size: 19, color: COLOR_TEXT_MUTED }),
              ]
            })),
            new Paragraph({
              children: [createTextRun("Analytical Assessment oral-check Questions:", { bold: true, size: 19, color: COLOR_PRIMARY })],
              spacing: { before: 120 }
  }),
            ...day.assessment.oralQuestions.map((q, qidx) => new Paragraph({
              children: [createTextRun(`  [${qidx + 1}] ${q}`, { size: 19 })]
            })),
            new Paragraph({
              children: [createTextRun("Tailored Physical/Cognitive Accommodations:", { bold: true, size: 19, color: COLOR_PRIMARY })],
              spacing: { before: 120 }
            }),
            ...day.assessment.accommodations.map(acc => new Paragraph({
              children: [createTextRun(`• ${acc}`, { size: 19 })]
            }))
          ])
        ]
      }),

      createSectionHeaderRow("Ways Forward."),

      // Extended Learning opportunities
      new TableRow({
        children: [
          createLeftCell(
            "Extended Learning opportunities:",
            "Suggest other learning experiences outside the classroom/class hours that learners may want to access to reinforce what they have learned, to spark their curiosities further, or that may provide them support in their areas of difficulty."
          ),
          createRightCell(
            day.waysForward.extendedLearning.map(ext => new Paragraph({
              children: [createTextRun(`• ${ext}`, { size: 19 })]
            }))
          )
        ]
      }),
      // Reflections
      new TableRow({
        children: [
          createLeftCell(
            "Reflections:",
            "Think about what you need to change for the next session based on what happened today. Is there something the learners are interested in exploring?\n\nAre there some things you would like to share with your co-teachers, parents, or school leaders about your classroom experience? What would you like your instructional coach to help you with?"
          ),
          createRightCell(
            day.waysForward.reflections.map(ref => new Paragraph({
              children: [createTextRun(`• ${ref}`, { size: 19 })]
            }))
          )
        ]
      })
    ];

    sectionChildren.push(createStyledTable(page3Rows));
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: PageOrientation.LANDSCAPE,
              width: "11.69in", // standard A4 Landscape orientation
              height: "8.27in",
            },
            margin: {
              top: "0.5in",
              right: "0.5in",
              bottom: "0.5in",
              left: "0.5in",
            },
          },
        },
        children: sectionChildren,
      },
    ],
  });

  return await Packer.toBlob(doc);
}
