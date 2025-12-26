import { GoogleGenAI } from "@google/genai";
import { GenerationSettings, GeneratedImage } from "../types";

// Helper to remove the data URL prefix (e.g., "data:image/png;base64,")
const stripBase64Prefix = (base64Str: string) => {
  return base64Str.split(',')[1] || base64Str;
};

export const generateFashionImages = async (
  settings: GenerationSettings
): Promise<GeneratedImage[]> => {
  // Prioritize User API Key, fall back to Env, or throw error
  const apiKey = settings.apiKey || process.env.API_KEY;

  if (!apiKey) {
    throw new Error("请提供 API Key 或在环境中配置");
  }

  // Initialize Gemini Client
  const ai = new GoogleGenAI({
    apiKey: apiKey,
    // @ts-ignore - Explicitly requested to add httpOptions with baseUrl
    httpOptions: {
      baseUrl: 'https://api.vectorengine.ai'
    }
  });

  if (!settings.productImage) {
    throw new Error("必须上传服装/商品图");
  }

  if (!settings.customModelImage) {
    throw new Error("必须上传模特图片");
  }

  const generatedImages: GeneratedImage[] = [];

  // --- Prompt Construction ---
  const inputs: any[] = [];
  
  // IMAGE 1: The Clothing (Product)
  inputs.push({
    inlineData: {
      data: stripBase64Prefix(settings.productImage.base64),
      mimeType: settings.productImage.mimeType,
    }
  });

  // IMAGE 2: The Model (Person)
  inputs.push({
    inlineData: {
      data: stripBase64Prefix(settings.customModelImage.base64),
      mimeType: settings.customModelImage.mimeType,
    }
  });

  // Basic Prompt
  let promptText = "STRICT VIRTUAL TRY-ON TASK. \n";
  promptText += "REFERENCE IDENTIFICATION:\n";
  promptText += "- IMAGE 1 is the CLOTHING/GARMENT (The Product).\n";
  promptText += "- IMAGE 2 is the MODEL (The Person).\n";

  // Background Logic
  if (settings.sceneImage) {
    inputs.push({
      inlineData: {
        data: stripBase64Prefix(settings.sceneImage.base64),
        mimeType: settings.sceneImage.mimeType,
      }
    });
    promptText += "- IMAGE 3 is the BACKGROUND SCENE.\n";
  }

  promptText += "\nINSTRUCTIONS:\n";
  promptText += "1. DRESS THE MODEL: Take the clothing explicitly shown in IMAGE 1 and put it on the person shown in IMAGE 2.\n";
  promptText += "2. REPLACE OLD CLOTHES: Completely replace whatever the model in IMAGE 2 is currently wearing. The final image must show the model wearing the IMAGE 1 garment.\n";
  promptText += "3. PRESERVE IDENTITY: You MUST keep the face, hair, head shape, and body pose of the model in IMAGE 2 EXACTLY the same. Do not generate a new person. It must look like the same person.\n";
  
  if (settings.sceneImage) {
    promptText += "4. BACKGROUND: Place this newly dressed model into the environment of IMAGE 3. Adjust lighting on the model to match IMAGE 3.\n";
  } else {
    promptText += "4. BACKGROUND: Keep the background simple and commercial (studio grey or white) unless specified otherwise.\n";
  }

  promptText += "\nCONSTRAINTS:\n";
  promptText += "- High fidelity texture for the clothing (from Image 1).\n";
  promptText += "- Photorealistic skin texture for the model (from Image 2).\n";
  promptText += "- Aspect Ratio: 9:16.\n";

  // User Custom Prompt
  if (settings.prompt) {
    promptText += `\nADDITIONAL REQUIREMENTS: ${settings.prompt}`;
  }
  
  inputs.push({ text: promptText });

  // --- Model Selection & Config ---

  const modelName = settings.modelType === 'pro' 
    ? 'gemini-3-pro-image-preview'
    : 'gemini-2.5-flash-image';

  const config: any = {
    temperature: 0.4,
    imageConfig: {
      aspectRatio: "9:16", // Enforce Portrait Ratio
    }
  };

  if (settings.modelType === 'pro') {
    config.imageConfig = {
      ...config.imageConfig,
      imageSize: settings.resolution,
    };
  }

  // Execute Generation
  const promises = Array.from({ length: settings.imageCount }).map(async (_, index) => {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: {
          parts: inputs
        },
        config: config
      });

      const parts = response.candidates?.[0]?.content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData && part.inlineData.data) {
             return {
                id: `gen_${Date.now()}_${index}`,
                url: `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`
             };
          }
        }
      }
      return null;
    } catch (error) {
      console.error(`Generation ${index + 1} failed:`, error);
      throw error;
    }
  });

  const results = await Promise.all(promises);
  return results.filter((img): img is GeneratedImage => img !== null);
};
