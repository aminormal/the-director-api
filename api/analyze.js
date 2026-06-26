const SYSTEM = `You are The Director. A Contradiction Engine. Respond ONLY as a JSON object: {"evidence":"...","pattern":"...","cost":"...","constraint":"..."}`;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { input } = req.body ?? {};
  if (!input) return res.status(400).json({ error: "No input." });

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

  if (!response.ok) {
    return res.status(502).json({ error: data?.error?.message || "OpenAI error.", detail: data });
  }

  const content = data?.choices?.[0]?.message?.content;
  if (!content) return res.status(502).json({ error: "Empty response.", detail: data });

  const parsed = JSON.parse(content);
  return res.status(200).json(parsed);
}
