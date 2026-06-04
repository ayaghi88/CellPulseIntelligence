
import { GoogleGenAI, Type } from "@google/genai";
import { IntelligenceReport } from "../types";

export const performPhoneIntelligence = async (phoneNumber: string, timestamp?: string): Promise<IntelligenceReport> => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
  
  // Generate a deterministic seed from the phone number digits
  const seed = parseInt(phoneNumber.replace(/\D/g, '').substring(0, 9)) || 42;

  const prompt = `Interrogate target: ${phoneNumber}
  ${timestamp ? `SPECIAL DIRECTIVE: Target specific historical window: ${timestamp}` : ''}
  
  OBJECTIVES:
  1. Identify Carrier & Line Type (focus on Prepaid/VoIP/Text-Free detection).
  2. Map Current Registered Location using global numbering plans.
  3. ${timestamp ? `TEMPORAL TRACE: Search public leaks, breach data, and IP metadata for any location artifacts matching ${timestamp}.` : 'Search for any historical location breadcrumbs in public records.'}
  4. Unmask ownership via public digital artifacts, determining name on account, linked emails, and connected platforms or websites.
  5. Identify potential IP information, ISP, and geographic locations tied to digital registry entries.
  6. Provide a forensic analysis overview of the target profile.
  7. IMPORTANT: Return realistic but safe information. Do not expose actual private personal data or confidential passwords. Ensure all JSON fields are complete and syntactically correct.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a Senior OSINT Forensic Analyst. Your task is to provide consistent, objective, and evidence-based intelligence synthesis. Do not speculate beyond public records. Ensure your analysis remains deterministic for the same input.",
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            phoneNumber: { type: Type.STRING },
            carrier: { type: Type.STRING },
            lineType: {
              type: Type.STRING,
              description: "Must be 'Mobile', 'Landline', 'VoIP', 'Prepaid', or 'Virtual'",
            },
            location: {
              type: Type.OBJECT,
              properties: {
                city: { type: Type.STRING },
                region: { type: Type.STRING },
                country: { type: Type.STRING },
                coordinates: {
                  type: Type.OBJECT,
                  properties: {
                    lat: { type: Type.NUMBER },
                    lng: { type: Type.NUMBER },
                  },
                  required: ["lat", "lng"],
                },
                timezone: { type: Type.STRING },
              },
              required: ["city", "region", "country", "coordinates", "timezone"],
            },
            historicalTrace: {
              type: Type.OBJECT,
              properties: {
                timestamp: { type: Type.STRING },
                estimatedLat: { type: Type.NUMBER },
                estimatedLng: { type: Type.NUMBER },
                confidence: { type: Type.NUMBER },
                sourceType: { type: Type.STRING, description: "e.g., 'Breach_Log', 'IP_Gateway', 'Social_Metadata', or 'Carrier_HLR'" },
                context: { type: Type.STRING },
              },
              required: ["timestamp", "estimatedLat", "estimatedLng", "confidence", "sourceType", "context"],
            },
            reputation: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.INTEGER, description: "Reputation score from 0 to 100" },
                riskLevel: {
                  type: Type.STRING,
                  description: "Must be 'Low', 'Medium', 'High', or 'Critical'",
                },
                flags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ["score", "riskLevel", "flags"],
            },
            ownership: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Full name associated with the line in public registries" },
                associatedEmails: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Digital web handles or email prefixes correlated with the footprint"
                },
                socialPresence: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Websites, social networks, or registries where this line/alias appears"
                },
              },
              required: ["name", "associatedEmails", "socialPresence"],
            },
            ipInfo: {
              type: Type.OBJECT,
              properties: {
                ipAddress: { type: Type.STRING, description: "Correlated target or gateway IP Address" },
                isp: { type: Type.STRING },
                location: { type: Type.STRING },
              },
              required: ["ipAddress", "isp", "location"],
            },
            communicationLogs: {
              type: Type.ARRAY,
              description: "Pattern-mapped simulation sequence of typical recent routing connections",
              items: {
                type: Type.OBJECT,
                properties: {
                  timestamp: { type: Type.STRING },
                  type: {
                    type: Type.STRING,
                    description: "Must be 'SMS' or 'Call'",
                  },
                  direction: {
                    type: Type.STRING,
                    description: "Must be 'Incoming' or 'Outgoing'",
                  },
                  metadata: { type: Type.STRING },
                },
                required: ["timestamp", "type", "direction"],
              },
            },
            summary: { type: Type.STRING },
          },
          required: [
            "phoneNumber",
            "carrier",
            "lineType",
            "location",
            "reputation",
            "ownership",
            "summary"
          ],
        },
        temperature: 0, // Set to 0 for maximum consistency/accuracy
        seed: seed,     // Use derived seed to ensure same results for same input
      }
    });

    const rawText = response.text || '';
    const reportData = JSON.parse(rawText.trim());
    
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.filter(chunk => chunk.web)
      ?.map(chunk => ({
        title: chunk.web!.title,
        url: chunk.web!.uri
      })) || [];

    return { ...reportData, sources };
  } catch (error: any) {
    console.error("Forensic interrogation failed:", error);
    throw new Error(error.message || "Target signal lost during interrogation.");
  }
};
