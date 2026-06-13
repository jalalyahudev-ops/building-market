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

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API routes
  app.post("/api/categorize-product", async (req, res) => {
    try {
      const { name, description, imageBase64 } = req.body;
      
      if (!name && !imageBase64) {
        return res.status(400).json({ error: "Product name or image is required" });
      }

      let prompt = `Based on the provided details (and image if available), categorize this product for a construction materials marketplace.
Return a generated name (if a name was not provided or is very short, otherwise use the provided name but improve it if needed), a generated description (if not provided, or enhanced if provided), a broad category, a more specific subcategory, and 3-5 relevant string tags for search.
Important: Try to map the product to one of our primary categories if appropriate: "Lumber & Composites", "Plumbing & Valves", "Electrical & Wiring", or "Masonry & Cement". If it does not fit these, you can create a new broad category like "Tools", "Safety Equipment", etc.`;

      if (name) prompt += `\n\nProvided Name: "${name}"`;
      if (description) prompt += `\nProvided Description: "${description}"`;

      const parts: any[] = [{ text: prompt }];

      if (imageBase64) {
        const mimeType = imageBase64.split(';')[0].split(':')[1];
        const base64Data = imageBase64.split(',')[1];
        parts.push({
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: parts,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: {
                type: Type.STRING,
                description: "The product name (generated from image or improved from provided name)"
              },
              description: {
                type: Type.STRING,
                description: "A detailed product description generated from image or improved from provided description"
              },
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
            required: ["name", "description", "category"]
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
