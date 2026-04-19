const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyDummyKeyForNow");

/**
 * Analyzes patient symptoms to determine urgency and recommend specialization.
 */
async function analyzeSymptoms(symptoms) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
            You are a clinical triage assistant for 'HealthSync Indigo'. 
            Analyze the following patient symptoms and return a JSON object with:
            1. 'urgency': One of ['low', 'medium', 'high', 'emergency'].
            2. 'priority_score': An integer from 0-100 (100 being most critical).
            3. 'recommended_specialization': A common medical specialization like 'Cardiology', 'Dermatology', 'Pediatrics', 'General Medicine', 'Neurology', etc.
            4. 'short_summary': A brief 1-sentence clinical summary.

            Patient Symptoms: "${symptoms}"

            JSON Response:
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Extract JSON from response (handling potential markdown wrapping)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        
        throw new Error("Invalid AI response format");
    } catch (error) {
        console.error("AI Analysis Error:", error.message);
        // Fallback logic
        return {
            urgency: 'low',
            priority_score: 10,
            recommended_specialization: 'General Medicine',
            short_summary: 'Preliminary analysis unavailable. Reverting to general consultation.'
        };
    }
}

/**
 * Predicts peak hours based on historical appointment counts.
 */
async function predictPeakHours(history) {
    // This would ideally be a more complex AI call, but for now we'll use a rule-based simulation
    // that mimics "intelligence" for the portfolio.
    return {
        is_peak: history.current_count > 10,
        recommendation: history.current_count > 10 ? "High demand detected. Recommending alternative facilities for non-urgent cases." : "Normal load. Procedural efficiency optimized.",
        load_score: Math.min(100, (history.current_count / 20) * 100)
    };
}

module.exports = {
    analyzeSymptoms,
    predictPeakHours
};
