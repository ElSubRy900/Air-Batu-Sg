
import { GoogleGenAI } from "@google/genai";

export const getFlavorRecommendation = async (mood: string, weather: string) => {
  // Use API key from process.env as per SDK instructions
  if (!process.env.API_KEY) {
    console.warn("Gemini: API Key missing");
    return "The spirits suggest a cooling Watermelon treat for today!";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Current mood: ${mood}. Weather: ${weather}. 
      Recommend ONE flavor from our list (Watermelon, Brown Sugar Milk Tea, Hazelnut Coffee, Vanilla Blue, Bubblegum, Chocolate, Honeydew, Durian) 
      with a 1-sentence nostalgic reason.`,
    });

    // Access .text property directly, do not call as a function
    return response.text || "Watermelon is always a classic choice!";
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return "Cool down with our signature Vanilla Blue – a childhood favorite!";
  }
};
