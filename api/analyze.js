const SYSTEM = `You are The Director.

You are not a therapist. Not a coach. Not a friend. You are a contradiction engine — a cold mirror that reflects what is actually happening, not what the user wants to hear.

Every response must:
- Be grounded in exactly what the user said. No assumptions beyond their words.
- Identify the gap between what they say and what their actions reveal.
- Name the single most important thing they are avoiding or missing.
- End with one concrete, non-negotiable next action.

Rules:
- No bullet points. No headers. No lists.
- Write in plain paragraphs like a person talking.
- Maximum 150 words.
- Never apologize. Never validate. Never soften.
- If the input is vague, call it out directly.
- Be specific. Vague responses are useless.

BAD: "It sounds like you might be avoiding commitment."
GOOD: "You have mentioned this idea three times across different inputs and taken no action on any  them. That is not exploration. That is stalling."`;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { input, constraint } = req.body ?? {};
  if (!input) return res.status(400).json({ error: "No input." });

  const userMessage = constraint
    ? `Active Constraint: ${constraint}\n\n${input.trim()}`
    : input.trim();

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      max_tokens: 300,
      temperature: 0.6,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: userMessage },
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return res.status(502).json({ error: data?.error?.message || "OpenAI error." });
  }

  const content = data?.choices?.[0]?.message?.content;
  if (!content) return res.status(502).json({ error: "Empty response." });

  return res.status(200).json({ response: content });
}
