import OpenAI from "openai";

function cleanExtractedText(extractedText) {
  return extractedText
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[|]/g, " ")
    .replace(/[^\S\r\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function uniqueItems(items) {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}

function looksLikeDatabaseSchema(text) {
  const lower = text.toLowerCase();
  return ["schema", "er diagram", "pk", "fk", "varchar", "timestamp", "database"].some((word) => lower.includes(word));
}

function extractSchemaTables(text) {
  const knownTables = [
    "users",
    "resumes",
    "resume_templates",
    "resume_sections",
    "notifications",
    "ai_requests"
  ];
  const underscoreTables = (text.match(/\b[a-z][a-z0-9]+_[a-z0-9_]+\b/gi) || [])
    .filter((item) => !item.toLowerCase().endsWith("_id"));
  const detected = uniqueItems([...knownTables.filter((table) => text.toLowerCase().includes(table)), ...underscoreTables]);
  return detected.slice(0, 8);
}

function schemaFallbackSummary(text, reason) {
  const tables = extractSchemaTables(text);
  const tableList = tables.length ? tables.join(", ") : "users, resumes, templates, sections, notifications, and AI requests";

  return {
    shortSummary: `This image appears to show a ResumeAI database ER diagram. Main detected entities: ${tableList}.`,
    detailedSummary: [
      "The uploaded image is not a paragraph-style handwritten note; it is a database schema/ER diagram. Tesseract OCR extracts visible labels and fields, but it cannot perfectly preserve boxes, arrows, and relationships from the image.",
      `Probable tables/entities detected: ${tableList}.`,
      "The schema seems to model users creating resumes from templates, resumes having multiple sections, users receiving notifications, and users making AI requests.",
      reason
    ].join("\n\n"),
    keyPoints: [
      `Detected entities: ${tableList}.`,
      "users is likely the parent table for resumes, notifications, and AI requests.",
      "resumes likely belongs to a user and may reference resume_templates.",
      "resume_sections likely belongs to resumes and stores section-wise resume content.",
      "PK means primary key; FK means foreign key used to connect tables."
    ],
    importantDefinitions: [
      "ER Diagram: A visual representation of database entities and relationships.",
      "Primary Key (PK): A unique identifier for each row in a table.",
      "Foreign Key (FK): A field that links one table to another table.",
      reason
    ],
    examRevisionNotes: [
      "Explain the schema as entity-based: users, resumes, templates, sections, notifications, and AI requests.",
      "Mention one-to-many relationships: one user can have many resumes, notifications, and AI requests.",
      "Mention template usage: one template can be used by many resumes.",
      "Mention resume sections: one resume can contain many sections."
    ],
    flashcards: [
      { front: "What is the purpose of the users table?", back: "It stores account details such as email, password, name, role, and plan." },
      { front: "How are resumes connected to users?", back: "A resume has a user_id foreign key, so each resume belongs to one user." },
      { front: "Why does resume_sections exist?", back: "It stores different parts of a resume, such as experience, education, skills, or projects." },
      { front: "What does ai_requests store?", back: "It stores prompts sent by users and AI responses generated for resume help." }
    ],
    vivaQuestions: [
      "Explain the main entities in this ResumeAI ER diagram.",
      "What is the difference between a primary key and a foreign key?",
      "How would you explain the relationship between users and resumes?",
      "Why is resume section data stored in a separate table?"
    ]
  };
}

function fallbackSummary(extractedText, reason = "Configure OPENAI_API_KEY to generate live AI summaries.") {
  const text = cleanExtractedText(extractedText);
  if (looksLikeDatabaseSchema(text)) {
    return schemaFallbackSummary(text, reason);
  }

  const sentences = text.split(/[.!?\n]/).map((item) => item.trim()).filter(Boolean);
  return {
    shortSummary: sentences.slice(0, 2).join(". ") || "No summary available yet.",
    detailedSummary: text,
    keyPoints: sentences.slice(0, 5),
    importantDefinitions: [reason],
    examRevisionNotes: sentences.slice(0, 4),
    flashcards: sentences.slice(0, 4).map((sentence, index) => ({
      front: `What is key idea ${index + 1}?`,
      back: sentence
    })),
    vivaQuestions: sentences.slice(0, 3).map((sentence) => `Explain: ${sentence}`)
  };
}

export async function generateSummary(extractedText) {
  if (!process.env.OPENAI_API_KEY) {
    return fallbackSummary(extractedText);
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "Return JSON with shortSummary, detailedSummary, keyPoints, importantDefinitions, examRevisionNotes, flashcards, and vivaQuestions for student revision."
        },
        { role: "user", content: extractedText }
      ]
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    return fallbackSummary(extractedText, `OpenAI summary generation failed: ${error.message}`);
  }
}
