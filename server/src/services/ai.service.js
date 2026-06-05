import OpenAI from 'openai';

export async function generateStudySummary(text) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      shortSummary: 'OpenAI is not configured yet.',
      detailedSummary: text?.slice(0, 500) || '',
      keyPoints: [],
      importantDefinitions: [],
      examRevisionNotes: [],
      flashcards: [],
      vivaQuestions: []
    };
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: 'Create JSON study material with shortSummary, detailedSummary, keyPoints, importantDefinitions, examRevisionNotes, flashcards, and vivaQuestions.'
      },
      { role: 'user', content: text }
    ]
  });

  return JSON.parse(response.choices[0].message.content);
}
