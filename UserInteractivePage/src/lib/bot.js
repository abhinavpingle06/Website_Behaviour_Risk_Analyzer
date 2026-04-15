import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

export async function botAnalysis(scanResult){
    const prompt = `
    You are a cybersecurity expert.

    Analyze this:
    ${JSON.stringify(scanResult)}

    Explain risks in simple terms.
    `;

    const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt
    });
    return response.text
}
