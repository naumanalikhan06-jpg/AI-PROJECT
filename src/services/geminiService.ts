import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getTutorResponse(query: string, context: string = "General Learning") {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are "Aura", an advanced Agentic AI Tutor in a professional VR environment. 
      Topic: ${context}.
      User Query: ${query}.
      
      Your response should:
      1. Be professional, encouraging, and highly educational.
      2. Use a "thinking" structure: briefly state your plan/reasoning before the final answer.
      3. Keep the total response under 150 words.
      4. Use Markdown for clarity.`,
    });
    return response.text || "I am processing your request. Please stand by.";
  } catch (error) {
    console.error("Error fetching tutor response:", error);
    return "System error: Unable to connect to the neural network. Please try again.";
  }
}

export async function generateTutorVoice(text: string) {
  try {
    // Clean markdown for better TTS
    const cleanText = text.replace(/[#*`]/g, '');
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read this as Aura, a professional AI tutor: ${cleanText}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      // The Gemini TTS model returns raw PCM data (16-bit, 24000Hz, mono).
      // We need to wrap it in a WAV header so the browser's <audio> element can play it.
      const pcmData = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0));
      const wavHeader = createWavHeader(pcmData.length, 24000);
      const wavData = new Uint8Array(wavHeader.length + pcmData.length);
      wavData.set(wavHeader);
      wavData.set(pcmData, wavHeader.length);
      
      const blob = new Blob([wavData], { type: 'audio/wav' });
      return URL.createObjectURL(blob);
    }
    return null;
  } catch (error) {
    console.error("Error generating voice:", error);
    return null;
  }
}

function createWavHeader(dataLength: number, sampleRate: number) {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // File length
  view.setUint32(4, 36 + dataLength, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // Format chunk identifier
  writeString(view, 12, 'fmt ');
  // Format chunk length
  view.setUint32(16, 16, true);
  // Sample format (1 is PCM)
  view.setUint16(20, 1, true);
  // Channel count
  view.setUint16(22, 1, true);
  // Sample rate
  view.setUint32(24, sampleRate, true);
  // Byte rate (sampleRate * channels * bitsPerSample / 8)
  view.setUint32(28, sampleRate * 2, true);
  // Block align (channels * bitsPerSample / 8)
  view.setUint16(32, 2, true);
  // Bits per sample
  view.setUint16(34, 16, true);
  // Data chunk identifier
  writeString(view, 36, 'data');
  // Data chunk length
  view.setUint32(40, dataLength, true);

  return new Uint8Array(header);
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
