export const demoNotes = [
  {
    _id: "demo-1",
    title: "Operating System Unit 3",
    subjectId: { subjectName: "OS" },
    tags: ["deadlock", "scheduling"],
    extractedText: "Deadlock occurs when processes wait indefinitely for resources held by each other.",
    aiSummary: {
      shortSummary: "Deadlock and scheduling concepts for quick exam revision.",
      keyPoints: ["Mutual exclusion", "Hold and wait", "Circular wait"],
      flashcards: [{ front: "What is deadlock?", back: "A state where processes wait forever for resources." }]
    },
    createdAt: new Date().toISOString()
  },
  {
    _id: "demo-2",
    title: "DBMS Normalization",
    subjectId: { subjectName: "DBMS" },
    tags: ["normalization", "keys"],
    extractedText: "Normalization organizes data to reduce redundancy and improve integrity.",
    aiSummary: {
      shortSummary: "Normalization reduces duplicate data and protects consistency.",
      keyPoints: ["1NF removes repeating groups", "2NF removes partial dependencies", "3NF removes transitive dependencies"],
      flashcards: [{ front: "Why normalize?", back: "To reduce redundancy and anomalies." }]
    },
    createdAt: new Date().toISOString()
  }
];

export const defaultSubjects = ["DBMS", "OS", "CN", "Java", "React", "Machine Learning"];
