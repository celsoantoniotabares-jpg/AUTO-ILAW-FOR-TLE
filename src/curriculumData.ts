/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PreGeneratedPlan {
  name: string;
  gradeAndSection: string;
  learningArea: string;
  teacher: string;
  noOfSessions: string;
  references: string[];
  declarationOfAI: string;
  competency: string;
  context: string;
  days: {
    dayNo: number;
    title: string;
    objectives: {
      knowledge: string;
      skills: string;
      attitude: string;
    };
    experience: {
      preLesson: string[];
      flow: {
        iDo: string[];
        weDo: string[];
        youDo: string[];
      };
      resources: string[];
      integration: string[];
    };
    assessment: {
      task: string;
      rubric: { criteria: string; points: number }[];
      oralQuestions: string[];
      accommodations: string[];
    };
    waysForward: {
      extendedLearning: string[];
      reflections: string[];
    };
  }[];
}

export interface Sector {
  id: string;
  name: string;
  weeks: {
    [key: number]: {
      competency: string;
      suggestedName?: string;
    };
  };
  preGenerated?: {
    [weekNum: number]: PreGeneratedPlan;
  };
}

export interface ComponentCategory {
  id: string;
  name: string;
  description: string;
  sectors: Sector[];
}

export const curriculumData: ComponentCategory[] = [
  {
    id: "ict",
    name: "1. Information & Communications Technology",
    description: "Sectors driving digital creation, systems architecture, and modern technical communications.",
    sectors: [
      {
        id: "programming",
        name: "Computer Programming",
        weeks: {
          1: { competency: "Discuss the current trends, business/career opportunities, and skills needed in Computer Programming. Discuss computer ergonomics." },
          2: { competency: "Distinguish HTML structure, elements, and attributes. Utilize an HTML editor in creating HTML documents." },
          3: { competency: "Apply heading, paragraph, styles and formatting elements in HTML document." },
          4: { competency: "Embed multimedia elements in a webpage. Perform adding list in a webpage. Create a table in a webpage." },
          5: { competency: "Utilize HTML form, types, and elements in a webpage. Apply links to images, email, button, and text in a webpage." },
          6: { competency: "Develop a website. (Plan and Build website, etc.)" },
          7: { competency: "Discuss syntax, selectors, and types of cascading style sheets (CSS). Apply CSS Colors, backgrounds, fonts, and text into a webpage." },
          8: { competency: "Apply CSS borders, margins, and paddings. Apply CSS icons, links, list and tables. Apply CSS animation and transition in a webpage." },
          9: { competency: "Utilize CSS box model in a webpage. Utilize CSS box shadow and transform in a webpage." },
          10: { competency: "Create an interactive website." }
        }
      },
      {
        id: "css",
        name: "Computer Systems Servicing",
        weeks: {
          1: { competency: "Discuss career and business opportunities in computer systems servicing. Discuss tools and equipment in computer systems servicing. Discuss parts and functions of computer system unit. Discuss system software, its types, and functions." },
          2: { competency: "Discuss application software, its types, and functions. Perform computer assembly following safety precautions." },
          3: { competency: "Create a bootable device following technical assembly procedures." },
          4: { competency: "Perform installation of operating system following safety precautions." },
          5: { competency: "Perform installation of drivers, application, and utility software following safety precautions." },
          6: { competency: "Perform testing, updating, and checking of peripheral drivers and application software following safety precautions." },
          7: { competency: "Perform troubleshooting and repairing of the computer system unit following safety precautions." },
          8: { competency: "Perform troubleshooting and repairing of the computer system unit following safety precautions." },
          9: { competency: "Perform routine computer maintenance following safety precautions." },
          10: { competency: "Perform routine computer maintenance following safety precautions." }
        }
      },
      {
        id: "telecom",
        name: "Telecommunication Services",
        weeks: {
          1: { competency: "Discuss Contact Center Industry and its career opportunities. Discuss key jargon in the Contact Center Industry." },
          2: { competency: "Differentiate inbound from outbound calls. Discuss the duties and responsibilities of a Contact Center employee." },
          3: { competency: "Discuss the skills and attributes needed for a Contact Center Employee. Discuss types of services offered in a Contact Center." },
          4: { competency: "Demonstrate phone etiquette in handling call and call flow." },
          5: { competency: "Discuss common metrics used in Contact Centers." },
          6: { competency: "Apply accuracy and fluency in communication in handling inbound and outbound calls either voice or non-voice." },
          7: { competency: "Discuss local and international accounts catered in a Contact Center. Perform procedures in call handling." },
          8: { competency: "Discuss local and international accounts catered in a Contact Center. Perform procedures in call handling." },
          9: { competency: "Perform a call flow according to standard greeting to call closure flow." },
          10: { competency: "Perform a call flow according to standard greeting to call closure flow." }
        }
      },
      {
        id: "visual_arts",
        name: "Visual Arts (Animation, Illustration)",
        weeks: {
          1: { competency: "Discuss current trends, skills, tools and equipment, career, and business opportunities in visual arts sector. Draw simple figures and objects by applying elements and principles of design." },
          2: { competency: "Apply drawing enhancement techniques, shading, textures, and coloring." },
          3: { competency: "Draw a human face with proportion and symmetry. Discuss basics of animation, cleaned-up, and in-between simple drawings." },
          4: { competency: "Produce cleaned-up simple key drawings for animation." },
          5: { competency: "Produce in-between drawings to achieve smooth fluid animation." },
          6: { competency: "Navigate illustration software interface. Produce simple objects using native illustration tools." },
          7: { competency: "Produce digitized drawing using vector and digital sketch illustration software." },
          8: { competency: "Produce enhanced digital drawing applying layers, gradient filters, and shadows." },
          9: { competency: "Produce vectorized drawing using illustrations software curves and anchor points." },
          10: { competency: "Produce simple animations combining key frames, transitions, and timing." }
        }
      }
    ]
  },
  {
    id: "afa",
    name: "2. Agriculture & Fishery Arts",
    description: "Sectors centering on crop farming, sustainable aquaculture, animal rearing, and processing sciences.",
    sectors: [
      {
        id: "animal_production",
        name: "Animal Production",
        weeks: {
          1: { competency: "Discuss procedures in maintaining poultry tools, equipment, house, and facilities. Determine proper poultry environment management." },
          2: { competency: "Perform brooding and growing with safety precautions. Discuss poultry health management and broiler harvesting technique." },
          3: { competency: "Layout housing requirements for weaner, grower, and finisher swine production. Determine swine feeding management." },
          4: { competency: "Determine proper maintenance of housing facilities for swine. Administer vitamins with safe procedures." },
          5: { competency: "Discuss characteristics of good weaner. Administer feeding procedures safely." },
          6: { competency: "Prepare beddings for grower/finisher swine production." },
          7: { competency: "Perform inspections on facilities, tools, equipment, and surrounding agricultural areas." },
          8: { competency: "Discuss feeding management, breeding management, and basic health care management of small ruminants." },
          9: { competency: "Perform raising procedures of small ruminants following environmental guidelines." },
          10: { competency: "Apply sustainable waste management systems in animal production." }
        }
      },
      {
        id: "aquaculture",
        name: "Aquaculture (Fish Culture)",
        weeks: {
          1: { competency: "Discuss hatchery, nursery, and grow-out culture. Identify suitable locations for fish grow-out culture based on selected species." },
          2: { competency: "Layout perspective plans of fish grow-out facilities and circular aquaculture tanks." },
          3: { competency: "Prepare fish grow-out facility based on identified species in accordance with OSH standards." },
          4: { competency: "Perform stocking of fingerlings considering density and acclimation." },
          5: { competency: "Perform feeding of fish stocks following daily feed ratios and schedules." },
          6: { competency: "Perform procedure in sampling of stocks to determine average body weight and health." },
          7: { competency: "Perform maintaining water quality, dissolved oxygen, and temperature for fish grow-out culture." },
          8: { competency: "Apply health management to avoid mortality. Perform harvesting of cultured fish safely." },
          9: { competency: "Perform post-harvest handling of fish in accordance with industry preservation standards." },
          10: { competency: "Sell harvested stocks. Prepare clear financial reports based on cost and return analysis." }
        }
      },
      {
        id: "crop_production",
        name: "Crop Production (Agricultural Crop Production)",
        weeks: {
          1: { competency: "Prepare records of different materials, tools, and equipment used in crop production." },
          2: { competency: "Perform nursery operations and seedling preparation according to Occupational Safety and Health standards." },
          3: { competency: "Perform plant propagation techniques (grafting, budding, layering)." },
          4: { competency: "Perform seed testing to determine germination percentages and viability." },
          5: { competency: "Prepare growing media mixing ratio of soil, compost, and organic matter." },
          6: { competency: "Discuss systems of planting (contour, square, block layouts). Perform actual field layout." },
          7: { competency: "Perform agricultural practices in planting crops according to natural organic farming. Apply fertilizer according to plant requirements." },
          8: { competency: "Apply prevention and control of common pests and agricultural diseases according to OSH standards." },
          9: { competency: "Apply safe management of weeds and environmental pests following crop protection guidelines." },
          10: { competency: "Perform harvesting and post-harvest handling practice. Sell products and calculate cost-return analysis." }
        }
      },
      {
        id: "food_beverage_processing",
        name: "Food and Beverages Processing",
        weeks: {
          1: { competency: "Identify economic demands and potentials of processed food in the local area. Select, receive, and handle raw materials." },
          2: { competency: "Perform food processing procedures (curing, smoking, pickling) following safety standards." },
          3: { competency: "Perform food processing and temperature controls to avoid biological hazards." },
          4: { competency: "Perform packaging and branding of processed food products. Calculate precise product costing." },
          5: { competency: "Discuss pricing and marketing strategies for selling finished processed foods. Sell finished products." },
          6: { competency: "Discuss classifications of fruit juices and beverages. Discuss appropriate pasteurization and processing methods." },
          7: { competency: "Perform processing of fruit juices following safety regulations." },
          8: { competency: "Perform quality testing and sugar-concentration measurement for fruit juice preservation." },
          9: { competency: "Perform packaging, sealing, and labeling of fruit beverages." },
          10: { competency: "Perform setting up market stalls and selling finished beverage products; compile financial reports." }
        }
      },
      {
        id: "fish_capture",
        name: "Fish Capture",
        weeks: {
          1: { competency: "Discuss background of fish capture and marine environment protection. Discuss safety measures and weather navigation." },
          2: { competency: "Discuss different parts and types of nets, and their legality based on national maritime laws and local ordinances." },
          3: { competency: "Perform net weaving with safety precautions and precise manual tying." },
          4: { competency: "Perform net mending, repairing tears, and securing twine ropes." },
          5: { competency: "Perform net assembly and weight distribution for casting nets." },
          6: { competency: "Perform net casting trials following safe throwing procedures." },
          7: { competency: "Discuss traps, pots, and lines used in sustainable hook captures." },
          8: { competency: "Operate safety tools and equipment in fish capture in accordance with OSH standards." },
          9: { competency: "Discuss different types of fishing vessels, their components, parts, functions, and maritime maintenance." },
          10: { competency: "Discuss municipal fishing vessel navigation regulations and safe handling of captured fish." }
        }
      }
    ]
  },
  {
    id: "fcs",
    name: "3. Family and Consumer Science",
    description: "Sectors focusing on livelihood readiness, culinary preparation, domestic services, and craft trades.",
    sectors: [
      {
        id: "food_prep",
        name: "Food Preparation",
        weeks: {
          1: { competency: "Differentiate hot kitchen from cold kitchen. Discuss kitchen brigade system. Explain OSH in kitchen operations. Familiarize with elements of a recipe." },
          2: { competency: "Perform recipe costing, yields, conversions, and markup analysis." },
          3: { competency: "Prepare a variety of sandwiches according to standard food preparation procedures while observing kitchen safety and sanitation practices.", suggestedName: "Basic Food Preparation: Preparing Healthy Sandwiches" },
          4: { competency: "Discuss stocks (fond). Identify types of stocks and explain methods of preparation." },
          5: { competency: "Prepare soup following agricultural ingredients and culinary safety standards." },
          6: { competency: "Discuss types of baked products (yeast and quick bread). Familiarize with ingredients and alternatives." },
          7: { competency: "Identify oven temperatures and mixing methods for varied baking products." },
          8: { competency: "Discuss types of bread, crust formulations, and fermentation roles." },
          9: { competency: "Prepare basic bread products using standard kneading and baking tools." },
          10: { competency: "Conceptualize business ideas in baking, marketing, and local pastries selling." }
        },
        preGenerated: {
          3: {
            name: "Basic Food Preparation: Preparing Healthy Sandwiches",
            gradeAndSection: "Grade 9 - Section Mahinhin",
            learningArea: "Technology and Livelihood Education (TLE) – Food and Consumer Services (FCS)",
            teacher: "Juan dela Cruz",
            noOfSessions: "4 Sessions (60 mins each)",
            references: [
              "K to 12 TLE Learning Module in Cookery/FCS",
              "Department of Education Philippines Curriculum Guides",
              "Food Preparation and Safety Manual",
              "Internet resources and instructional videos on sandwich preparation"
            ],
            declarationOfAI: "AI was used to assist in organizing the lesson plan format, generating learning activities, and suggesting assessment strategies aligned with the DepEd Lesson Plan Template and Grade 9 FCS curriculum, following DO 3, s. 2026 Annex A.",
            competency: "Prepare a variety of sandwiches according to standard food preparation procedures while observing kitchen safety and sanitation practices.",
            context: "The learners are Grade 9 students who enjoy practical and hands-on activities. Most learners are familiar with basic kitchen tools and simple food preparation at home. Some learners may have limited experience in food handling and sanitation procedures. Collaborative activities and demonstrations help increase their participation and confidence.",
            days: [
              {
                dayNo: 1,
                title: "Sandwich Classifications and Key Ingredients",
                objectives: {
                  knowledge: "Identify and describe the different classifications of hot and cold sandwiches and their essential structural components.",
                  skills: "Categorize common household food ingredients into bread, spreads, fillings, and structural garnishes.",
                  attitude: "Appreciate the dietary role of balanced, nutritious components in preparing daily school snacks."
                },
                experience: {
                  preLesson: [
                    "Begin session with a brief morning routine, prayer, and checking of student well-being.",
                    "Show flashcards or high-resolution images of various hot and cold sandwiches (e.g., Club, Grilled Cheese, Pinwheels).",
                    "Pose the opening question: 'What sandwich do you usually prepare or eat, and what makes up its layers?'"
                  ],
                  flow: {
                    iDo: [
                      "Teacher presents a clear visual taxonomy of sandwich types: hot (toasted, grilled, deep-fried) and cold (open-faced, multideck, tea sandwiches).",
                      "Teacher introduces the four structural components of a sandwich: Base (breads), Moistening Agent (spreads), Body (fillings like proteins/cheeses), and Garnish (lettuce, tomatoes)."
                    ],
                    weDo: [
                      "Assemble the class into groups of five.",
                      "Hand each group an index card with a sandwich name.",
                      "Have the groups map out on a sheet of manila paper the exact components of their assigned sandwich, classifying each ingredient."
                    ],
                    youDo: [
                      "Each learner completes an individual 'Sandwich Blueprint Sheet' where they match 10 mixed ingredients to their structural category and decide if the overall combination represents a hot or cold structure."
                    ]
                  },
                  resources: [
                    "Visual charts of sandwich classifications",
                    "A set of dry flashcards listing sandwich ingredients",
                    "Daily Worksheet: Sandwich Blueprint Sheet"
                  ],
                  integration: [
                    "Science: Nutritional density and caloric counting of ingredients.",
                    "Values Education: Collaborating cordially during peer mapping exercises."
                  ]
                },
                assessment: {
                  task: "An individual written sandwich classification matrix quiz (15 items). Match ingredients and hot/cold categorizations correctly.",
                  rubric: [
                    { criteria: "Classification Accuracy", points: 20 },
                    { criteria: "Identification of Roles", points: 15 },
                    { criteria: "Completeness of Blueprint", points: 15 }
                  ],
                  oralQuestions: [
                    "Why must a moistening agent like butter or mayonnaise be applied carefully to a sandwich base?",
                    "What makes a Club sandwich different from a standard open-faced sandwich?"
                  ],
                  accommodations: [
                    "Offer visual reference guides with picture labels of ingredients for struggling readers.",
                    "Provide verbal cueing and simplified printouts for peer-supported learners."
                  ]
                },
                waysForward: {
                  extendedLearning: [
                    "Have students inspect their household refrigerator or pantry at home and list down 5 ingredients that could serve as healthy sandwich fillings."
                  ],
                  reflections: [
                    "Did learners easily differentiate hot vs. cold sandwiches?",
                    "Which classification prompted the most query or confusion during the we-do activity?"
                  ]
                }
              },
              {
                dayNo: 2,
                title: "Food Safety, Sanitation, and Workplace Hygiene",
                objectives: {
                  knowledge: "Explain the critical steps of safe food handling, personal hygiene, and handwashing procedures in a kitchen workspace.",
                  skills: "Execute proper double-hand scrubbing procedures using the DepEd 20-second sanitation guidelines.",
                  attitude: "Advocate for absolute cleanliness and personal sanitization before handling any food materials."
                },
                experience: {
                  preLesson: [
                    "Conduct a neat recap of sandwich parts from Day 1.",
                    "Pass around a UV germ powder demo if available, or explain how microscopic bacteria transmit from unwashed palms to lettuce leaves."
                  ],
                  flow: {
                    iDo: [
                      "Teacher demonstrates correct sanitation protocols: removing jewelry, donning hairnets, apron fitting, and the full 8-step handwashing technique using warm water and liquid soap.",
                      "Teacher discusses food cross-contamination (e.g., using the same board for raw chicken and fresh bread)."
                    ],
                    weDo: [
                      "Students gather around the wash sink in pairs.",
                      "Each peer monitors their partner using a standard 10-point checklist to see if they rub fingernails, thumbs, and wrists for at least 20 seconds."
                    ],
                    youDo: [
                      "Learners write a brief 3-sentence pledge on their journals, describing how they will maintain zero-contamination in their home kitchen during preparation."
                    ]
                  },
                  resources: [
                    "Anti-bacterial hand soap, hand paper towels, sink facility.",
                    "Double-cleaning checklist printouts.",
                    "Laminated posters showing cutting-board color coding (red for meat, green for veggies/breads)."
                  ],
                  integration: [
                    "Science (Biology): Microorganism propagation and pathogen safety.",
                    "Health (MAPEH): Preventing food-borne infectious diseases."
                  ]
                },
                assessment: {
                  task: "A practical sanitation evaluation. The teacher grades individual handwashing and tool-prep techniques on a binary pass/fail scale according to hygienic checklists.",
                  rubric: [
                    { criteria: "Handwashing Thoroughness", points: 20 },
                    { criteria: "Personal Protective Prep (net/apron)", points: 20 },
                    { criteria: "Workspace Sterilization", points: 10 }
                  ],
                  oralQuestions: [
                    "Why must you use separate cutting boards for sandwich bread and raw sandwich protein fillings?",
                    "What are the indicators that a sanitation procedure was not strictly followed?"
                  ],
                  accommodations: [
                    "Grant extended time to students with motor difficulties during the manual tool sanitizing trials.",
                    "Provide verbal prompts for each step of handwashing."
                  ]
                },
                waysForward: {
                  extendedLearning: [
                    "Create a 1-page visual sanitizer checklist poster to pin on the kitchen wall at home."
                  ],
                  reflections: [
                    "Were students fully compliant with hairnets and aprons?",
                    "How many students required reminders about jewelry removal before the handwashing session?"
                  ]
                }
              },
              {
                dayNo: 3,
                title: "Teacher Demonstration and Guided Culinary Practice",
                objectives: {
                  knowledge: "Reiterate standard assembly procedures and blade handling safety during vegetable dicing and bread slicing.",
                  skills: "Operate kitchen knives safely to slice vegetables and assemble a healthy club sandwich within groups.",
                  attitude: "Demonstrate safety, responsibility, and team coordination while working with sharp kitchen utensils."
                },
                experience: {
                  preLesson: [
                    "Review sanitation standards; verify that everyone is in full kitchen attire (aprons, hairnets, closed shoes).",
                    "Set up the teacher's demonstration desk so that all students have an unobstructed view."
                  ],
                  flow: {
                    iDo: [
                      "The teacher demonstrates: wash raw tomatoes and cucumber; trim bread crusts neatly; apply thin butter layer to protect base from moisture; layer fillings carefully; slice diagonally.",
                      "Demonstrate safe claw-grip knife positioning to protect fingers while cutting."
                    ],
                    weDo: [
                      "Students gather in their pre-assigned small groups.",
                      "The teacher guides each group step-by-step to portion out their ingredients, checking initial cutting styles and safety grips before slicing begins."
                    ],
                    youDo: [
                      "Learners coordinate within their group to assemble their first healthy sandwich, ensuring clean layers of bread, tomatoes, protein, lettuce, and a light spread."
                    ]
                  },
                  resources: [
                    "Slicing knives, wooden or color-coded vegetable chopping boards.",
                    "Clean ingredients: whole-wheat bread, sliced tomatoes, cucumbers, lettuce leaves, cheese slices, boiled egg whites.",
                    "Laminated recipe card guide to portion spreads."
                  ],
                  integration: [
                    "Technology: Safe operation of basic culinary hand tools.",
                    "Values Education: Sharing ingredients equitably and coordinating roles in a group."
                  ]
                },
                assessment: {
                  task: "Guided Group Performance Trial. The teacher assesses safety, sanitation, and physical assembly of ingredients during sandwich creation.",
                  rubric: [
                    { criteria: "Knife Safety and Technique", points: 15 },
                    { criteria: "Ingredient Portion Control", points: 15 },
                    { criteria: "Team coordination", points: 20 }
                  ],
                  oralQuestions: [
                    "What is the purpose of using a 'claw grip' when slicing cucumbers?",
                    "Why did we apply a thin layer of butter or mayo directly onto the bread face?"
                  ],
                  accommodations: [
                    "Allow students with low manual dexterity to use pre-sliced ingredients prepared by the teacher.",
                    "Pair struggling groups with an advanced student facilitator for visual guide assistance."
                  ]
                },
                waysForward: {
                  extendedLearning: [
                    "Write a reflection on how team coordination in the TLE laboratory mirrors daily family responsibilities."
                  ],
                  reflections: [
                    "Did all groups maintain absolute knife safety during cutting?",
                    "How well did students manage the cleaning tasks once assembly concluded?"
                  ]
                }
              },
              {
                dayNo: 4,
                title: "Independent Preparation, Presentation, and Rubric Assessment",
                objectives: {
                  knowledge: "Translate sandwich design principles and costing metrics into a presentation layout.",
                  skills: "Prepare and present an original, completely appetizing sandwich selection that complies with DepEd nutrition guidelines.",
                  attitude: "Accept constructive peer evaluations and project reviews with a positive and growth-minded attitude."
                },
                experience: {
                  preLesson: [
                    "Welcome the learners and conduct a final inventory checklist of all culinary stations.",
                    "Set up a presentation display table themed 'Supremo Sandwiches Showcase'."
                  ],
                  flow: {
                    iDo: [
                      "The teacher briefly models how to assemble. Teacher shows how to plate neatly on a white ceramic dish and explain why clean cuts highlight fresh interior colors."
                    ],
                    weDo: [
                      "Each group independently performs their culinary assembly. The teacher moves between tables, speaking only to offer gentle safety oversight, allowing absolute student autonomy."
                    ],
                    youDo: [
                      "Each student group displays their sandwich. One representative presents their healthy sandwich creation, explaining choice of components, nutrition value, and costing estimate."
                    ]
                  },
                  resources: [
                    "Plates, trays, toothpicks, garnish materials.",
                    "Printed Evaluation rubrics.",
                    "Sample sandwich display desk labels."
                  ],
                  integration: [
                    "MAPEH (Arts): Plating aesthetics, color-blocking, food balance styles.",
                    "Mathematics: Calculating budget costs per individual serving."
                  ]
                },
                assessment: {
                  task: "Culmination Performance Task: Prepare and plate a healthy sandwich. Grade each group according to the rubric criteria.",
                  rubric: [
                    { criteria: "Food Safety and Sanitation", points: 10 },
                    { criteria: "Proper Use of Tools", points: 10 },
                    { criteria: "Creativity and Presentation", points: 10 },
                    { criteria: "Teamwork and Cooperation", points: 10 },
                    { criteria: "Taste and Nutritional Value", points: 10 }
                  ],
                  oralQuestions: [
                    "Explain why your group selected this specific garnish to balance the sandwich plating.",
                    "What was the estimated ingredient cost for one individual serving?"
                  ],
                  accommodations: [
                    "Provide verbal support or allowed pictorial explanations instead of a long spoken presentation for non-fluent presenters.",
                    "Allow struggle groups to simplify plating if running behind schedule."
                  ]
                },
                waysForward: {
                  extendedLearning: [
                    "Re-make this exact sandwich recipe at home for your parents or siblings over the weekend, document with a photo or short handwritten feedback."
                  ],
                  reflections: [
                    "Did students show maximum creative growth compared to Day 1?",
                    "What percentage of students successfully calculated serving costing?"
                  ]
                }
              }
            ]
          }
        }
      },
      {
        id: "beauty_care",
        name: "Beauty Care Services",
        weeks: {
          1: { competency: "Explain different nail care services. Discuss diseases and conditions of the nails." },
          2: { competency: "Discuss benefits of hand and foot spa. Identify pressure points applied in hand and foot massage." },
          3: { competency: "Demonstrate different techniques in hand and foot massage following safety precautions." },
          4: { competency: "Perform steps in hand and foot spa, and massage following safety precautions." },
          5: { competency: "Perform manicure and pedicure following safety precautions." },
          6: { competency: "Discuss haircutting services, pre/post preps, career opportunities, and business prospects." },
          7: { competency: "Perform pre-haircutting services (draping, hair sectioning, shampooing)." },
          8: { competency: "Perform steps in haircutting services following safety precautions and styles." },
          9: { competency: "Perform post-haircutting procedures (sanitize, blow-dry, cleanup)." },
          10: { competency: "Calculate labor, materials, and service cost estimate for beauty care services." }
        }
      },
      {
        id: "food_services",
        name: "Food Services",
        weeks: {
          1: { competency: "Discuss fundamentals of food service and identify attributes of professional food service attendants." },
          2: { competency: "Explain OSH in food service and prep service areas according to safety standards." },
          3: { competency: "Identify table implements (flatware, dinnerware, hollowware) for table setting." },
          4: { competency: "Demonstrate table setting in accordance with industry standards and execute restaurant service flow." },
          5: { competency: "Differentiate qualities and preparation factors of alcoholic and non-alcoholic beverages." },
          6: { competency: "Identify bar tools and equipment, safety handlers, and storage layouts." },
          7: { competency: "Discuss types of non-alcoholic beverages, cocktail components, and recipes." },
          8: { competency: "Identify fresh regional ingredients used in preparing non-alcoholic beverages." },
          9: { competency: "Discuss mixing methods (shaking, stirring, blending, layering) of mocktails." },
          10: { competency: "Apply methods of preparing non-alcoholic mocktails and conceptualize business ideas." }
        }
      },
      {
        id: "garments",
        name: "Garments",
        weeks: {
          1: { competency: "Discuss concepts, history, and modern technological developments of the garment industry." },
          2: { competency: "Identify types, styles, features, and parts of upper garments." },
          3: { competency: "Explain procedures for drafting, flat-pattern making, and cutting patterns." },
          4: { competency: "Discuss procedures for preparing, shrinking, graining, and cutting fabric safely." },
          5: { competency: "Explain procedures for assembling upper garments and securing industrial sewing machines." },
          6: { competency: "Discuss procedures for sewing upper garments and applying finishing touches." },
          7: { competency: "Produce finished upper garments or mini dresses observing safety guidelines." },
          8: { competency: "Identify types, pocket styles, trims, and parts of lower garments (skirts/pants)." },
          9: { competency: "Apply technical procedures in drafting and making lower garments following safety regulations." },
          10: { competency: "Perform selling and inventory tracking of finished garment products." }
        }
      },
      {
        id: "handicrafts",
        name: "Handicraft",
        weeks: {
          1: { competency: "Discuss concepts in needlecraft. Determine products and techniques of Quilting and Calado needlecrafts." },
          2: { competency: "Identify styles, designs, patterns, and perform steps in Quilting following safety precautions." },
          3: { competency: "Identify Calado techniques. Describe characteristics, designs, and historical significance." },
          4: { competency: "Apply Calado designs on native fabrics following safety precautions." },
          5: { competency: "Discuss marketing needlecraft products. Track sales and sell finished Quilting/Calado products." },
          6: { competency: "Explain fundamentals of leathercraft, tanning basics, and tool selections." },
          7: { competency: "Discuss methods of preparing leather. Discuss embroidery stitches used in leathercraft." },
          8: { competency: "Familiarize with layout patterns, cutting folds, and safe templates for leather crafts." },
          9: { competency: "Follow steps in preparing and producing leathercraft items (purses, wallets)." },
          10: { competency: "Sell finished leathercraft products and evaluate profit margins and costings." }
        }
      },
      {
        id: "health_massage",
        name: "Health and Wellness Massage",
        weeks: {
          1: { competency: "Discuss origin of wellness services and identify various physical therapy benefits." },
          2: { competency: "Explain health benefits and muscle reliefs of wellness massage techniques." },
          3: { competency: "Determine workplace requirements and strict sanitization policies of a wellness spa facility." },
          4: { competency: "Discuss different types of massage (Swedish, Shiatsu, Reflexology, and deep muscle)." },
          5: { competency: "Discuss pre-massage services, client health checklists, and consultation procedures." },
          6: { competency: "Apply steps in providing wellness massage with OSH precautions and standard strokes." },
          7: { competency: "Discuss concepts, principles, and hygiene standards of caregiving." },
          8: { competency: "Discuss workplace policy, client dignity, and procedures in providing care to clientele." },
          9: { competency: "Explain safe physical procedures for providing domestic support to elderly or sick clientele." },
          10: { competency: "Apply caregiving procedures to newborns, infants, and toddlers safely." }
        }
      },
      {
        id: "hotel_services",
        name: "Hotel Services",
        weeks: {
          1: { competency: "Discuss organizational structure of hotels and identify front office career opportunities." },
          2: { competency: "Explain duties, functions, operations, and structure of front office departments." },
          3: { competency: "Discuss front office personnel responsibilities, attributes, and hotel guest cycles." },
          4: { competency: "Explain OSH in hotels and perform hotel reservations following reservation standards." },
          5: { competency: "Discuss housekeeping organization and role/functions of housekeeping teams." },
          6: { competency: "Discuss housekeeping sections (linen, public areas) and career growth." },
          7: { competency: "Classify guest rooms (deluxe, suite) and master room-status terms." },
          8: { competency: "Explain standard procedures of dry cleaning, vacuuming, and housekeeping tools." },
          9: { competency: "Discuss handling, chemical safety, storage, and 5R's in hotel waste management." },
          10: { competency: "Identify public area sections and maintain hotel lobby areas safely." }
        }
      },
      {
        id: "tourism",
        name: "Tourism Services",
        weeks: {
          1: { competency: "Explain concepts of global tourism. Discuss historical development of tourism in the Philippines." },
          2: { competency: "Explain concepts of tourism. Discuss historical development of tourism in the Philippines." },
          3: { competency: "Identify key roles of DOT, local government units, and travel agencies in tourism." },
          4: { competency: "Examine sectors of the tourism industry (eco-tourism, leisure, cultural)." },
          5: { competency: "Identify career opportunities and skill qualifications in varied hospitality sectors." },
          6: { competency: "Identify career opportunities and skill qualifications in varied hospitality sectors." },
          7: { competency: "Discuss attributes of ideal tour guides. Interpret tourist maps and navigate routes." },
          8: { competency: "Identify regional attractions, historical landmarks, festivals, and cultural events." },
          9: { competency: "Familiarize with sources of tourism directories and tourist information pamphlets." },
          10: { competency: "Identify tangible and intangible tourism services. Recite tour guide comment scripting." }
        }
      }
    ]
  },
  {
    id: "industrial_arts",
    name: "4. Industrial Arts",
    description: "Sectors covering building systems, energy, metals joining, and physical fabrication trades.",
    sectors: [
      {
        id: "automotive",
        name: "Automotive and Small Engine Servicing",
        weeks: {
          1: { competency: "Interpret fundamentals, cycle strokes, and concepts of automotive and engine services." },
          2: { competency: "Discuss tools, materials, consumables, and safety equipment used in repair shops." },
          3: { competency: "Distinguish component parts of automotive and small engine systems (carburetors, blocks)." },
          4: { competency: "Draw complete diagrams of automotive engine electrical circuits and terminals." },
          5: { competency: "Describe parts and mechanics of ignition systems (battery, coils, spark plugs)." },
          6: { competency: "Apply servicing of ignition systems following OSH safety precautions." },
          7: { competency: "Differentiate types of engine operations: 2-stroke vs 4-stroke, diesel vs gasoline." },
          8: { competency: "Describe structural engine construction (cylinders, pistons, crankshafts)." },
          9: { competency: "Apply engine oil checking, filter replacement, and general engine servicing." },
          10: { competency: "Calculate labor, materials, and prepare shop cost estimations for automotive jobs." }
        }
      },
      {
        id: "electrical",
        name: "Electrical and Electronics Servicing",
        weeks: {
          1: { competency: "Discuss electrical services, energy lines, and household electronic servicing." },
          2: { competency: "Differentiate types of materials (conductors, insulators) and servicing components." },
          3: { competency: "Draft circuit diagrams using standard electronic notation, symbols, and rules." },
          4: { competency: "Apply procedures in installing household wiring circuits following OSH standards." },
          5: { competency: "Apply electrical wiring (lamps, outlets, single-pole switches) safety preps." },
          6: { competency: "Apply procedures in power supply assembly (transformers, rectifiers) safely." },
          7: { competency: "Assemble DC power adapter kits following component layout plans." },
          8: { competency: "Differentiate vapor-compression and absorption refrigeration systems." },
          9: { competency: "Apply preventive maintenance servicing of household appliances and cooling lines." },
          10: { competency: "Calculate service fee costing, wire costs, and construct job quotations." }
        }
      },
      {
        id: "metals",
        name: "Metals and Engineering",
        weeks: {
          1: { competency: "Identify, handle, and select sheet metal marking, layout, and measuring tools." },
          2: { competency: "Discuss sheet metal layout drawing and pattern expansion styles." },
          3: { competency: "Apply safety measures, wear correct PPE, in cutting and folding sheet metals." },
          4: { competency: "Perform cutting sheet metals to blueprint dimensions using hand shears." },
          5: { competency: "Perform bending, forming, and shaping metals on mechanical folding jigs." },
          6: { competency: "Differentiate sheet fastening methods (riveting, metal screws, soldering joints)." },
          7: { competency: "Discuss pre-assembly welding requirements, metal dressing, and joints alignment." },
          8: { competency: "Demonstrate correct use and cleaning of metal grinders and drill presses." },
          9: { competency: "Run visual inspection on finished sheet metal products to catch raw edges." },
          10: { competency: "Calculate materials costs, gauge costs, and construct sheet metal estimates." }
        }
      },
      {
        id: "carpentry",
        name: "Residential Carpentry",
        weeks: {
          1: { competency: "Discuss carpentry principles, tools, wood classifications, and byproducts." },
          2: { competency: "Discuss forestry regulatory laws in the Philippines. Calculate board feet costs of lumber." },
          3: { competency: "Demonstrate correct use and preventive maintenance of power tools (jigsaws, drills)." },
          4: { competency: "Discuss handling of wood adhesives. Demonstrate wood joint preparation (lap, mortise)." },
          5: { competency: "Prepare architectural carpentry project plans. Fabricate wood joints safely." },
          6: { competency: "Apply finishing procedures (scraping, sanding, staining, lacquering) on wood projects." },
          7: { competency: "Discuss role, loads support, and significance of carpentry in residential frames." },
          8: { competency: "Classify repair consumables (bolts, wood fillers) for residential structure repairs." },
          9: { competency: "Prepare cost estimations for residential wood repair projects." },
          10: { competency: "Perform residential carpentry repairs (hinges, doors, panels) following safety rules." }
        }
      },
      {
        id: "masonry",
        name: "Residential Construction (Masonry and Tile Setting)",
        weeks: {
          1: { competency: "Identify masonry works. Differentiate consumables, tools, and materials (cement, tamps)." },
          2: { competency: "Illustrate single-storey residential floor plans and load-bearing partitions." },
          3: { competency: "Apply construction site preparative actions (leveling, layout lines) following safety rules." },
          4: { competency: "Identify steel reinforcement bars. Apply steel cutting, bending, and tying with wire ties." },
          5: { competency: "Apply wooden formworks assembly and safe dismantling following OSH guidelines." },
          6: { competency: "Apply concrete mixing ratios (sand, gravel, water) and vertical column casting." },
          7: { competency: "Discuss tiles classification (ceramic, mosaic, granites) and surface preps." },
          8: { competency: "Demonstrate use of tiles spacing pins, tile cutters, and notch trowels on backing boards." },
          9: { competency: "Apply procedures in floor and wall tile installation and grouting safely." },
          10: { competency: "Compute masonry structural service fees and mortar volumes material costs." }
        }
      },
      {
        id: "plumbing",
        name: "Residential Plumbing",
        weeks: {
          1: { competency: "Discuss residential drainage and municipal water plumbing systems and layout features." },
          2: { competency: "Draft floor layouts outlining water supply pipings and fixtures routing." },
          3: { competency: "Draft fixtures symbols, pipings, and signs on water layout drawings." },
          4: { competency: "Label floor plans, pipe diameters, and OSH guidelines on blueprints." },
          5: { competency: "Demonstrate safe use of pipe threaders, cutters, wrench grips, and PVC cements." },
          6: { competency: "Demonstrate preventive maintenance and clearing pipe clogs using plumbing rods." },
          7: { competency: "Apply procedures in joining PVC and metal pipes with fittings safely." },
          8: { competency: "Apply pipeline pressure tests to detect leaks following OSH standards." },
          9: { competency: "Apply troubleshooting, valve replacement, and thread patch services safely." },
          10: { competency: "Apply pipe repairing procedures. Compute hourly plumber service fees and joint costs." }
        }
      },
      {
        id: "welding",
        name: "Shielded Metal Arc Welding (SMAW)",
        weeks: {
          1: { competency: "Discuss arc welding processes (SMAW, MIG, TIG). Demonstrate setting up arc welding machine with safety precautions." },
          2: { competency: "Assemble welding positioners, secure clamps, jigs, and fixtures with safety adjustments." },
          3: { competency: "Differentiate types of weld joints (butt, tee, lap). Discuss AWS and ASME welding codes." },
          4: { competency: "Distinguish welding electrodes. Identify primary plate welding positions (flat, horizontal)." },
          5: { competency: "Apply oxygen-fuel cutting and edge beveled preparations safely." },
          6: { competency: "Distinguish welding defects (porosity, slag, undercut) and inspect welding seams." },
          7: { competency: "Apply methods of striking and holding an electric arc with safety helmet." },
          8: { competency: "Apply weld beads in flat (1F) and horizontal (2F) plate positions safely." },
          9: { competency: "Apply surface welding repairs, grinding, and crack weld filling with safety." },
          10: { competency: "Compute cost of electrodes, electricity, and custom structural metals costings." }
        }
      }
    ]
  }
];
