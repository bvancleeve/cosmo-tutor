// server.js — Cosmo App Server
// Serves the frontend and proxies Anthropic API calls securely

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Your Anthropic API key — set this as an environment variable
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!ANTHROPIC_API_KEY) {
  console.warn("⚠️  ANTHROPIC_API_KEY not set! Chat will not work.");
  console.warn("   Set it with: export ANTHROPIC_API_KEY=sk-ant-...");
}

app.use(express.json({ limit: "10mb" }));

// Serve the frontend
app.use(express.static(path.join(__dirname, "public")));

// API proxy endpoint — keeps your API key secret on the server
app.post("/api/chat", async (req, res) => {
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: { message: "API key not configured" } });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Anthropic API error:", err);
    res.status(500).json({ error: { message: "Failed to reach AI service" } });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Cosmo is running at http://localhost:${PORT}`);
  console.log(`   API key: ${ANTHROPIC_API_KEY ? "✅ configured" : "❌ missing"}`);
});
