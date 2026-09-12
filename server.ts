import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

/**
 * Converts 24kHz 16-bit mono PCM audio data into a standard WAV base64 string
 */
function pcmToWav(pcmBase64: string, sampleRate = 24000): string {
  const pcmBuffer = Buffer.from(pcmBase64, "base64");
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // Subchunk 1 size (16 for PCM)
  header.writeUInt16LE(1, 20); // PCM format = 1
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  const wavBuffer = Buffer.concat([header, pcmBuffer]);
  return wavBuffer.toString("base64");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "25mb" }));

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  /**
   * TTS Endpoint: Convert text to speech using gemini-3.1-flash-tts-preview
   * Model: gemini-3.1-flash-tts-preview
   */
  app.post("/api/tts", async (req, res) => {
    try {
      const { text, voice = "Kore", promptStyle = "cheerful" } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Text string is required for speech synthesis." });
      }

      const ai = getGenAI();

      let styleInstruction = "Read aloud warmly, clearly, and expressively for young children:";
      if (promptStyle === "calm") {
        styleInstruction = "Read aloud gently and soothingly, like a cozy bedtime story for children:";
      } else if (promptStyle === "energetic") {
        styleInstruction = "Read aloud with playful excitement and joyful wonder for children:";
      }

      const promptText = `${styleInstruction}\n\n"${text}"`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: promptText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voice, // 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr'
              },
            },
          },
        },
      });

      const candidate = response.candidates?.[0];
      const pcmData = candidate?.content?.parts?.[0]?.inlineData?.data;

      if (!pcmData) {
        return res.status(500).json({
          error: "No audio data received from Gemini TTS model.",
          details: response.text || "Empty response parts",
        });
      }

      // Convert raw 24kHz PCM to WAV base64
      const wavBase64 = pcmToWav(pcmData, 24000);
      const audioUrl = `data:audio/wav;base64,${wavBase64}`;

      return res.json({
        audioUrl,
        voice,
        format: "audio/wav",
      });
    } catch (err: any) {
      console.error("Error in /api/tts:", err);
      return res.status(500).json({
        error: "Failed to generate speech",
        message: err?.message || String(err),
      });
    }
  });

  /**
   * Image Generation Endpoint: Generate illustration using gemini-3-pro-image-preview
   * Model: gemini-3-pro-image-preview
   * Affordance: imageSize (1K, 2K, 4K), aspectRatio (4:3, 1:1, 16:9, 3:4)
   * Supports Custom Protagonist incorporation!
   */
  app.post("/api/image/generate", async (req, res) => {
    try {
      const {
        prompt,
        imageSize = "1K",
        aspectRatio = "4:3",
        artStyle = "vibrant watercolor storybook",
        protagonistDescription = "",
      } = req.body;

      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "Prompt string is required for image generation." });
      }

      const validSizes = ["1K", "2K", "4K"];
      const resolvedSize = validSizes.includes(imageSize) ? imageSize : "1K";

      const validAspectRatios = ["1:1", "4:3", "3:4", "16:9", "9:16"];
      const resolvedRatio = validAspectRatios.includes(aspectRatio) ? aspectRatio : "4:3";

      let enhancedPrompt = `High quality children's book illustration in a ${artStyle} art style. Whimsical, warm, enchanting, safe and delightful for children, rich colors, soft lighting, clean composition: ${prompt}.`;

      if (protagonistDescription && typeof protagonistDescription === "string" && protagonistDescription.trim().length > 0) {
        enhancedPrompt += ` Featuring the protagonist character: ${protagonistDescription.trim()}. Ensure this exact protagonist with these physical features and clothing is clearly visible and recognized in the illustration.`;
      }

      enhancedPrompt += " No text, no words, no watermarks.";

      const ai = getGenAI();

      let response;
      try {
        response = await ai.models.generateContent({
          model: "gemini-3-pro-image-preview",
          contents: {
            parts: [{ text: enhancedPrompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: resolvedRatio as any,
              imageSize: resolvedSize as any,
            },
          },
        });
      } catch (primaryErr: any) {
        console.warn("Primary gemini-3-pro-image-preview encountered error, attempting fallback:", primaryErr?.message);
        // Graceful fallback to gemini-3.1-flash-image if pro preview has quota / authorization restrictions
        response = await ai.models.generateContent({
          model: "gemini-3.1-flash-image",
          contents: {
            parts: [{ text: enhancedPrompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: resolvedRatio as any,
              imageSize: resolvedSize as any,
            },
          },
        });
      }

      let imageUrl = "";
      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || "image/png";
          imageUrl = `data:${mime};base64,${part.inlineData.data}`;
          break;
        }
      }

      if (!imageUrl) {
        return res.status(500).json({
          error: "No image was returned from the model.",
          details: response.text || "Empty candidates",
        });
      }

      return res.json({
        imageUrl,
        imageSize: resolvedSize,
        aspectRatio: resolvedRatio,
        prompt: enhancedPrompt,
      });
    } catch (err: any) {
      console.error("Error in /api/image/generate:", err);
      return res.status(500).json({
        error: "Failed to generate illustration",
        message: err?.message || String(err),
      });
    }
  });

  /**
   * Story Generation Endpoint: Generate a multi-page kid's story
   * Uses gemini-3.5-flash
   */
  app.post("/api/story/generate", async (req, res) => {
    try {
      const {
        theme = "friendship and discovery",
        character = "a fluffy bunny who dreams of the stars",
        setting = "an enchanted crystal forest",
        targetAge = "5-8",
        pageCount = 4,
        artStyle = "vibrant watercolor storybook",
        customProtagonist = null,
      } = req.body;

      const ai = getGenAI();

      const protagonistNote = customProtagonist?.description
        ? `\nFeatured Custom Protagonist: ${customProtagonist.name} (${customProtagonist.description}). This character MUST be the main hero of the story and prominently featured on each page.`
        : "";

      const prompt = `Create an imaginative, heartwarming, and engaging children's story for age group ${targetAge} years old.
Hero Protagonist: ${character}${protagonistNote}
Setting: ${setting}
Theme/Moral: ${theme}
Total Pages: exactly ${Math.min(Math.max(Number(pageCount) || 4, 3), 6)} pages.

Each page should have:
1. "pageNumber": integer (1 to ${pageCount})
2. "text": 2 to 4 sentences of delightful read-aloud story text that sounds musical and exciting for kids.
3. "illustrationPrompt": a clear, vivid visual description of what should be drawn for this specific page in ${artStyle} style (incorporating the hero protagonist, environment, colors, emotions).
4. "interactiveElements": 2 to 4 interactive objects/characters visible on this page that children can tap. Each element must have:
   - "id": unique string
   - "label": friendly name (e.g., "Songbird", "Magic Flower", "Glow Acorn")
   - "icon": single emoji (e.g., "🐦", "🌸", "⭐", "🐉", "🦋")
   - "x": integer percentage (15 to 85) across the page width
   - "y": integer percentage (15 to 85) down the page height
   - "soundType": one of "chirp", "wiggle", "twinkle", "boing", "giggle", "flutter", "splash", "roar", "chime", "purr"
   - "animation": one of "wiggle", "bounce", "pulse", "sparkle", "float"
   - "soundDescription": playful description like "Sweet bird chirp! ♪" or "Giggle giggle!"`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction:
            "You are a master children's book author and educator. You write enchanting, age-appropriate, positive stories that inspire kindness, curiosity, and courage.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "Catchy, magical title of the storybook.",
              },
              summary: {
                type: Type.STRING,
                description: "One short sentence summarizing the story.",
              },
              artStyle: {
                type: Type.STRING,
                description: "Recommended illustration art style.",
              },
              pages: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    pageNumber: { type: Type.INTEGER },
                    text: { type: Type.STRING },
                    illustrationPrompt: { type: Type.STRING },
                    interactiveElements: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING },
                          label: { type: Type.STRING },
                          icon: { type: Type.STRING },
                          x: { type: Type.INTEGER },
                          y: { type: Type.INTEGER },
                          soundType: { type: Type.STRING },
                          animation: { type: Type.STRING },
                          soundDescription: { type: Type.STRING },
                        },
                        required: ["id", "label", "icon", "x", "y", "soundType", "animation", "soundDescription"],
                      },
                    },
                  },
                  required: ["pageNumber", "text", "illustrationPrompt"],
                },
              },
            },
            required: ["title", "summary", "pages"],
          },
        },
      });

      const rawJson = response.text || "{}";
      const storyData = JSON.parse(rawJson);

      return res.json(storyData);
    } catch (err: any) {
      console.error("Error in /api/story/generate:", err);
      return res.status(500).json({
        error: "Failed to create story",
        message: err?.message || String(err),
      });
    }
  });

  /**
   * Gemini Chatbot Endpoint:
   * Multi-turn chat interface with role selection and model dispatch:
   * - gemini-3.1-pro-preview for particularly complex tasks (e.g., deep story questions, complex philosophy/explanations, moral dilemmas)
   * - gemini-3.5-flash for general tasks (e.g., standard friendly chat, storytelling ideas, character chatting)
   * - gemini-3.1-flash-lite for tasks that should happen fast (e.g., quick definitions, rhyming words, fast riddles)
   */
  app.post("/api/chat", async (req, res) => {
    try {
      const {
        messages = [],
        companionId = "barnaby", // 'barnaby' | 'pip' | 'dash'
        taskComplexity = "general", // 'complex' | 'general' | 'fast'
        currentStoryContext = "",
      } = req.body;

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "Messages array is required." });
      }

      // Determine model based on task complexity & companion persona
      let model = "gemini-3.5-flash"; // general tasks
      if (taskComplexity === "complex" || companionId === "barnaby_complex") {
        model = "gemini-3.1-pro-preview"; // complex tasks
      } else if (taskComplexity === "fast" || companionId === "dash") {
        model = "gemini-3.1-flash-lite"; // fast tasks
      } else {
        model = "gemini-3.5-flash"; // general tasks
      }

      // Role definitions & System Instructions
      const companionRoles: Record<string, { name: string; instruction: string }> = {
        barnaby: {
          name: "Barnaby the Wise Story Owl",
          instruction: `You are Barnaby, a cozy, scholarly, and kind-hearted spectacles-wearing owl living inside a magic storybook.
You love helping kids understand stories deeply. You explain tricky vocabulary words using simple metaphors, discuss what characters feel, and encourage kids to ponder lessons of kindness, patience, and empathy.
Keep your tone warm, encouraging, gentle, and age-appropriate (ages 4-10). Use fun owl expressions like 'Hoo-hoo!' occasionally. If asked complex questions, give thoughtful, imaginative explanations.`,
        },
        pip: {
          name: "Pip the Story Sprite",
          instruction: `You are Pip, a bubbly, cheerful little story sprite made of glowing stardust and laughter!
You love sparking kids' creativity! You help kids brainstorm what should happen next in the story, imagine silly plot twists, invent funny animal sounds, and celebrate their wild ideas.
Keep your replies upbeat, playful, warm, and brief (2-4 sentences). Use sparkle sounds like *twinkle!* or *whoosh!* sparingly to delight kids.`,
        },
        dash: {
          name: "Dash the Quick Bunny",
          instruction: `You are Dash, an energetic, lightning-fast bunny who loves words, rhyming games, quick riddles, and speedy fun facts!
You give super snappy, exciting, fun answers instantly. When kids ask for a rhyme, riddle, or quick fact, give it right away with high enthusiasm and warmth! Keep responses concise and punchy.`,
        },
      };

      const selectedRole = companionRoles[companionId] || companionRoles.barnaby;
      const contextPrefix = currentStoryContext
        ? `\nCurrent Story Context:\n"""${currentStoryContext}"""\n`
        : "";

      const systemInstruction = `${selectedRole.instruction}${contextPrefix}
Remember to always speak directly to the child. Never break character, never use scary or negative language. Celebrate reading and learning!`;

      // Build contents array for Gemini
      // messages is [{ role: 'user' | 'model', content: string }]
      const contents = messages.map((m: any) => ({
        role: m.role === "assistant" ? "model" : m.role === "model" ? "model" : "user",
        parts: [{ text: m.content || m.text || "" }],
      }));

      const ai = getGenAI();

      let response;
      try {
        response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
          },
        });
      } catch (modelErr: any) {
        console.warn(`Model ${model} failed, falling back to gemini-3.8-flash:`, modelErr?.message);
        response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents,
          config: {
            systemInstruction,
          },
        });
        model = "gemini-3.8-flash";
      }

      const replyText = response.text || "I'm right here with you! Tell me more!";

      return res.json({
        reply: replyText,
        modelUsed: model,
        companion: selectedRole.name,
      });
    } catch (err: any) {
      console.error("Error in /api/chat:", err);
      return res.status(500).json({
        error: "Failed to communicate with companion",
        message: err?.message || String(err),
      });
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
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Storybook server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
