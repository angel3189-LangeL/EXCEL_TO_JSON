
import { GoogleGenAI } from "@google/genai";

/**
 * Generates descriptive insights for the parsed data using Gemini
 */
export async function generateDataInsights(data: any[], fileName: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Sample data to avoid token limits but give enough context
  const sample = data.slice(0, 10);
  const prompt = `
    Analiza esta muestra de datos convertidos de un archivo Excel llamado "${fileName}".
    Proporciona un resumen ejecutivo breve de lo que parecen contener estos datos.
    Muestra: ${JSON.stringify(sample)}
    
    Por favor responde en Español. Estructura la respuesta con:
    1. Propósito aparente de los datos.
    2. Estadísticas rápidas (si es posible, basadas en la muestra).
    3. Sugerencia de limpieza o mejora estructural.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "No se pudieron generar insights en este momento.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error al conectar con la inteligencia artificial.";
  }
}
