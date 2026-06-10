import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import 'dotenv/config';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.post("/api/categorize-product", async (req, res) => {
    try {
      const { name, description } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Product name is required" });
      }

      const prompt = `Based on the product name "${name}" and description "${description || ''}", categorize this product for a construction materials marketplace.
Return a broad category, a more specific subcategory, and 3-5 relevant string tags for search.
Important: Try to map the product to one of our primary categories if appropriate: "Lumber & Composites", "Plumbing & Valves", "Electrical & Wiring", or "Masonry & Cement". If it does not fit these, you can create a new broad category like "Tools", "Safety Equipment", etc.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: {
                type: Type.STRING,
                description: "A broad category (e.g., 'Lumber', 'Plumbing', 'Electrical', 'Tools', 'Masonry')"
              },
              subcategory: {
                type: Type.STRING,
                description: "A more specific subcategory"
              },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "An array of 3-5 relevant string tags for search"
              }
            },
            required: ["category"]
          }
        }
      });

      const text = response.text || "{}";
      const result = JSON.parse(text);
      res.json(result);
    } catch (error: any) {
      console.error("Error categorizing product:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      
      const systemInstruction = "You are a helpful AI Shopping Assistant for a construction materials marketplace. You help buyers find products, choose the right materials for their projects, and understand differences between items. Keep answers helpful and concise.";
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: messages,
        config: {
          systemInstruction,
        }
      });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Error in AI chat:", error);
      res.status(500).json({ error: error.message });
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
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
