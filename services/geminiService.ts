import { GoogleGenAI, Type, Modality } from "@google/genai";
import { TravelStyle, Itinerary, TransportMode } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// System instruction helper
const getSystemInstruction = (style: TravelStyle, transport: TransportMode) => `
Eres un profesor de turismo y guía experto, muy "cool", amable y empático. 
Te especializas en crear experiencias de viaje estilo "${style}".
Tu tono es relajado pero profesional, usas términos modernos pero entendibles.
Preferencia de transporte del usuario: ${transport}. Intenta priorizar este medio en tus sugerencias logísticas cuando sea posible.

IMPORTANTE:
1. Usas Google Search y Google Maps para encontrar datos reales y actualizados.
2. Si el usuario pide un itinerario, DEBES incluir al final de tu respuesta un bloque JSON (y solo el JSON) dentro de marcadores \`\`\`json ... \`\`\` con la siguiente estructura:
{
  "title": "Titulo del viaje",
  "summary": "Resumen corto",
  "steps": [
    { "time": "09:00 AM", "title": "Actividad", "description": "Detalle breve", "location": "Nombre del lugar para Maps" }
  ]
}
3. Responde siempre en Español.
4. Sé conciso pero inspirador.
`;

export const sendMessageToGemini = async (
  prompt: string,
  history: any[],
  style: TravelStyle,
  transport: TransportMode,
  location?: { lat: number; lng: number }
) => {
  try {
    const model = 'gemini-2.5-flash';
    
    // Tools configuration
    const tools: any[] = [{ googleSearch: {} }, { googleMaps: {} }];
    const toolConfig: any = {};

    if (location) {
        toolConfig.retrievalConfig = {
            latLng: {
                latitude: location.lat,
                longitude: location.lng
            }
        };
    }

    const chat = ai.chats.create({
      model: model,
      history: history,
      config: {
        systemInstruction: getSystemInstruction(style, transport),
        tools: tools,
        toolConfig: Object.keys(toolConfig).length > 0 ? toolConfig : undefined,
      },
    });

    const result = await chat.sendMessage({ message: prompt });
    
    // Extract grounding metadata if available
    const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const links: { uri: string; title: string }[] = [];
    
    if (groundingChunks) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web?.uri) {
          links.push({ uri: chunk.web.uri, title: chunk.web.title || 'Fuente Web' });
        }
        if (chunk.maps?.uri) {
             links.push({ uri: chunk.maps.uri, title: chunk.maps.title || 'Ubicación Maps' });
        }
      });
    }

    return {
      text: result.text,
      links: links
    };

  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw error;
  }
};

export const generateHeroImage = async (prompt: string): Promise<string | null> => {
  try {
    // Using gemini-2.5-flash-image for standard generation or gemini-3-pro-image-preview for HD if needed
    // The prompt explicitly asks for "hero ken burns", so high quality is good.
    // However, per instructions, for general usage use gemini-2.5-flash-image.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `Cinematic, glossy, high resolution travel photography of: ${prompt}. beautiful lighting, 8k, photorealistic` }]
      },
      config: {
         imageConfig: {
            aspectRatio: "16:9",
         }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    return null;
  }
};

export const generateSpeech = async (text: string): Promise<ArrayBuffer | null> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' }, // Kore has a nice tone
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            const binaryString = atob(base64Audio);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes.buffer;
        }
        return null;
    } catch (e) {
        console.error("TTS Error", e);
        return null;
    }
}