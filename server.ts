import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Text-to-Speech proxying
  app.get("/api/tts", async (req, res) => {
    try {
      const text = (req.query.text as string) || "";
      const engine = (req.query.engine as string) || "cloud-google";
      const voiceId = (req.query.voiceId as string) || "21m00Tcm4TlvDq8ikWAM";
      const clientKey = (req.query.key as string) || "";

      if (!text) {
        return res.status(400).json({ error: "Text parameter is required" });
      }

      // ElevenLabs API key priority:
      // 1. Client key passed from setting
      // 2. Server env config (ELEVENLABS_API_KEY)
      const elevenlabsKey = clientKey || process.env.ELEVENLABS_API_KEY || "";

      if (engine === "cloud-elevenlabs" && elevenlabsKey) {
        try {
          const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?optimize_streaming_latency=3`,
            {
              method: "POST",
              headers: {
                "xi-api-key": elevenlabsKey,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                text: text,
                model_id: "eleven_multilingual_v2",
                voice_settings: {
                  stability: 0.75,
                  similarity_boost: 0.75,
                },
              }),
            }
          );

          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            res.setHeader("Content-Type", "audio/mpeg");
            return res.send(Buffer.from(arrayBuffer));
          } else {
            const errorMsg = await response.text();
            console.error(
              `ElevenLabs TTS response error (status ${response.status}):`,
              errorMsg
            );
            // Fallback to Google TTS on failure
          }
        } catch (elevenErr) {
          console.error("ElevenLabs synthesis error:", elevenErr);
          // Fallback to Google TTS on fetch failure
        }
      }

      // Default Free Google Translate TTS Fallback
      const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=id&client=tw-ob&q=${encodeURIComponent(
        text
      )}`;
      const response = await fetch(googleTtsUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        res.setHeader("Content-Type", "audio/mpeg");
        return res.send(Buffer.from(arrayBuffer));
      } else {
        throw new Error(`Google TTS returned failure code ${response.status}`);
      }
    } catch (e: any) {
      console.error("TTS Proxy error:", e);
      return res
        .status(500)
        .json({ error: "TTS Generation Failed", detail: e.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
