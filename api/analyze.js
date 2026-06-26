const SYSTEM = `You are The Director. A Contradiction Engine.

Your job: identify what is objectively present, what cycle is repeating, what it is costing, and what the single most important constraint is.

RULES:
- Never diagnose. Never insult. Never validate emotionally.
- Never agree or disagree automatically.
- Ground every observation in the user's own words.
- Be specific. One vague sentence disqualifies the whole response.
- Challenge assumptions through evidence, not argument.

Respond ONLY as a JSON object, no markdown, no preamble:
{
  "evidence": "...",
  "pattern": "...",
  "cost": "...",
  "constraint": "..."
}`;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { input } = req.body ?? {};
  if (!input || input.trim().length < 10) return res.status(400).json({ error: "Input too short." });

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        max_tokens: 800,
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: input.trim() },
        ],
      }),
    });

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(500).json({ error: e.message || "Server error." });
  }
}
