
import { GoogleGenAI } from "@google/genai";
import { Mission, Vehicle } from "../types";

export const analyzeFleetStatus = async (missions: Mission[], vehicles: Vehicle[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Agisci come un esperto di logistica della Protezione Civile.
    Analizza i seguenti dati della flotta e delle missioni recenti:
    
    MEZZI: ${JSON.stringify(vehicles)}
    MISSIONI RECENTI: ${JSON.stringify(missions.slice(-10))}

    Fornisci un breve riassunto (massimo 3 punti) in italiano che evidenzi:
    1. Eventuali criticità urgenti (scadenze passate o anomalie segnalate).
    2. Consigli per la manutenzione basati sui KM percorsi.
    3. Una valutazione generale dell'operatività.
    Ritorna il testo in formato Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Impossibile analizzare i dati al momento.";
  }
};
