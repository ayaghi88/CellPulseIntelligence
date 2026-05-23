
import { GoogleGenAI, Type } from "@google/genai";
import { IntelligenceReport } from "../types";

export const performPhoneIntelligence = async (phoneNumber: string, timestamp?: string): Promise<IntelligenceReport> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  // Generate a deterministic seed from the phone number digits
  const seed = parseInt(phoneNumber.replace(/\D/g, '').substring(0, 9)) || 42;

  const prompt = `Interrogate target: ${phoneNumber}
  ${timestamp ? `SPECIAL DIRECTIVE: Target specific historical window: ${timestamp}` : ''}
  
  OBJECTIVES:
  1. Identify Carrier & Line Type (focus on Prepaid/VoIP/Text-Free detection).
  2. Map Current Registered Location using global numbering plans.
  3. ${timestamp ? `TEMPORAL TRACE: Search public leaks, breach data, and IP metadata for any location artifacts matching ${timestamp}.` : 'Search for any historical location breadcrumbs in public records.'}
  4. Unmask ownership via public digital artifacts.
  
  OUTPUT STRICT JSON ONLY:
  {
    "phoneNumber": "${phoneNumber}",
    "carrier": "string",
    "lineType": "Mobile" | "Landline" | "VoIP" | "Prepaid" | "Virtual",
    "location": {
      "city": "string", "region": "string", "country": "string",
      "coordinates": { "lat": number, "lng": number },
      "timezone": "string"
    },
    "historicalTrace": {
      "timestamp": "string",
      "estimatedLat": number,
      "estimatedLng": number,
      "confidence": number,
      "sourceType": "Breach_Log" | "IP_Gateway" | "Social_Metadata" | "Carrier_HLR",
      "context": "Forensic reasoning for this specific coordinate"
    },
    "reputation": { "score": number, "riskLevel": "string", "flags": ["string"] },
    "ownership": { "name": "string", "associatedEmails": ["string"], "socialPresence": ["string"] },
    "ipInfo": { "ipAddress": "string", "isp": "string", "location": "string" },
    "communicationLogs": [{ "timestamp": "string", "type": "string", "direction": "string", "metadata": "string" }],
    "summary": "Forensic synthesis of the target profile."
  }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a Senior OSINT Forensic Analyst. Your task is to provide consistent, objective, and evidence-based intelligence synthesis. Do not speculate beyond public records. Ensure your analysis remains deterministic for the same input.",
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        temperature: 0, // Set to 0 for maximum consistency/accuracy
        seed: seed,     // Use derived seed to ensure same results for same input
      }
    });

    const rawText = response.text || '';
    let cleanedJson = rawText.trim();
    const startIndex = cleanedJson.indexOf('{');
    const endIndex = cleanedJson.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1) {
      cleanedJson = cleanedJson.substring(startIndex, endIndex + 1);
    }

    const reportData = JSON.parse(cleanedJson);
    
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
