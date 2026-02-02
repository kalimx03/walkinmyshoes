
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTIONS } from "../constants";

// Initialize the Gemini API client directly with the environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  /**
   * High-precision architectural accessibility audit using Gemini 3 Pro reasoning
   */
  async analyzeAccessibility(imageBase64: string): Promise<any> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
          parts: [
            { 
              text: `PERFORM ARCHITECTURAL ACCESSIBILITY AUDIT.
              Analyze the attached image for ADA (Americans with Disabilities Act) and WCAG compliance. 
              Use spatial reasoning to estimate real-world dimensions based on environmental cues.

              SPECIFIC TARGETS & PRECISION AUDIT RULES:
              1. TACTILE PAVING: Identify truncated domes or detectable warning surfaces.
              2. RAMPS: Estimate slope (ADA Max 1:12).
              3. DOORWAYS: Estimate clear width (ADA Min 32").
              4. OPERABLE PARTS: Scan for buttons (elevators, door openers). Height (15"-48").
              5. PROTRUDING OBJECTS: Scan for wall-mounted objects protruding >4".

              For each identified feature or barrier, provide:
              - Precise bounding box coordinates [ymin, xmin, ymax, xmax] (0-1000 scale).
              - Compliance status (COMPLIANT, NON_COMPLIANT, WARNING).
              - Detailed technical description, recommendation, and cost estimate.

              RETURN JSON ONLY.`
            },
            { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }
          ]
        },
        config: {
          systemInstruction: SYSTEM_INSTRUCTIONS,
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingBudget: 24000 },
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              issues: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    status: { type: Type.STRING, enum: ["COMPLIANT", "NON_COMPLIANT", "WARNING"] },
                    description: { type: Type.STRING },
                    recommendation: { type: Type.STRING },
                    costEstimate: { type: Type.STRING },
                    coordinates: {
                      type: Type.ARRAY,
                      items: { type: Type.NUMBER }
                    }
                  },
                  required: ["type", "status", "description", "recommendation", "costEstimate", "coordinates"]
                }
              },
              overallComplianceScore: { type: Type.NUMBER }
            },
            required: ["issues", "overallComplianceScore"]
          }
        }
      });

      const text = response.text;
      if (!text) return { issues: [], overallComplianceScore: 0 };
      
      const parsed = JSON.parse(text.trim());
      // Ensure coordinates are valid and normalized
      if (parsed.issues) {
        parsed.issues = parsed.issues.filter((i: any) => i.coordinates && i.coordinates.length === 4);
      }
      return parsed;
    } catch (error) {
      console.error("Gemini Audit Service Error:", error);
      return { issues: [], overallComplianceScore: 0 };
    }
  },

  /**
   * Edit an image based on a text prompt using Gemini 2.5 Flash Image
   * Enhanced for realistic architectural rendering
   */
  async editImage(imageBase64: string, prompt: string): Promise<string | null> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: imageBase64,
                mimeType: 'image/jpeg',
              },
            },
            {
              text: `YOU ARE AN ARCHITECTURAL VISUALIZATION ENGINE.
              Modification Request: ${prompt}.
              
              INSTRUCTIONS:
              1. Identify the specific spatial barrier in the image.
              2. Render a realistic, physically integrated ADA-compliant solution.
              3. MAINTAIN CONTEXT: Keep the same perspective, floor textures, wall colors, and lighting.
              4. REALISM: If adding a ramp, use materials that match the environment (concrete, steel, tile).
              5. ARCHITECTURAL INTEGRITY: If widening a door, ensure the wall structure looks natural and finished.
              
              GENERATE A PHOTO-REALISTIC VISUAL REMEDIATION.`,
            },
          ],
        },
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (error) {
      console.error("Image Edit Error:", error);
      return null;
    }
  },

  createGuideChat(scenarioContext: string, initialHistory: { role: string, parts: { text: string }[] }[] = []) {
    return ai.chats.create({
      model: 'gemini-3-pro-preview',
      history: initialHistory,
      config: {
        systemInstruction: `${SYSTEM_INSTRUCTIONS}\n\nYou are a specialist interactive guide for ${scenarioContext}.`,
      }
    });
  }
};
