import { GoogleGenAI, Type } from "@google/genai";
import { HistoryResult, ContentPlan, GeneratedPoster } from "../types";

const apiKey = process.env.API_KEY;

// Initialize the client once if key is present (handled safely in calls)
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * Step 1: Search for historical facts about the location using Google Search Grounding.
 */
export const fetchLocationHistory = async (location: string): Promise<HistoryResult> => {
  if (!ai) throw new Error("API Key not found");

  const model = "gemini-2.5-flash"; // Using Flash for text/reasoning with tools
  
  const prompt = `
    부산의 장소 '${location}'에 대한 역사적 사실을 검색해줘.
    결과는 반드시 다음 JSON 형식으로만 답변해줘. 마크다운 코드 블록(json) 안에 작성해줘.
    {
      "summary": "역사적 배경과 주요 사건을 2-3문장으로 요약",
      "facts": ["주요 역사적 사실 1", "주요 역사적 사실 2", "주요 역사적 사실 3"]
    }
    반드시 정확한 역사적 사실에 기반해야 해. 다른 설명은 추가하지 마.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType: "application/json", // Removed: Incompatible with googleSearch tool
      },
    });

    const text = response.text || "{}";
    
    // Extract grounding URLs if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sourceUrls = groundingChunks
      .map((chunk: any) => chunk.web?.uri)
      .filter((uri: string) => !!uri);

    // Parse JSON safely (removing markdown code blocks if present)
    let jsonStr = text;
    const codeBlockMatch = text.match(/```json([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1];
    } else {
      // Fallback: try to find the first { and last }
      const firstOpen = text.indexOf('{');
      const lastClose = text.lastIndexOf('}');
      if (firstOpen !== -1 && lastClose !== -1) {
        jsonStr = text.substring(firstOpen, lastClose + 1);
      }
    }
    
    const parsed = JSON.parse(jsonStr);

    return {
      location,
      summary: parsed.summary,
      facts: parsed.facts,
      sourceUrls: Array.from(new Set(sourceUrls)), // Dedup
    };
  } catch (error) {
    console.error("History fetch error:", error);
    throw new Error("역사 정보를 가져오는 데 실패했습니다.");
  }
};

/**
 * Step 2: Plan cultural content based on history and emotion.
 */
export const planCulturalContent = async (
  location: string,
  history: HistoryResult,
  emotion: string,
  contentType: string
): Promise<ContentPlan> => {
  if (!ai) throw new Error("API Key not found");

  const model = "gemini-2.5-flash";

  const prompt = `
    당신은 2030 세대의 트렌드를 주도하는 힙한 감성의 문화 콘텐츠 에디터입니다.
    
    [입력 정보]
    - 장소: ${location}
    - 역사적 사실 요약: ${history.summary}
    - 사용자 감정 키워드: ${emotion}
    - 희망하는 콘텐츠 형태: ${contentType}

    [목표]
    위 정보를 바탕으로 사용자의 감정('${emotion}')을 깊이 위로하고 공감할 수 있는 '${contentType}' 형태의 문화 콘텐츠를 기획해주세요.
    
    [출력 형식 (JSON)]
    {
      "contentType": "제안하는 콘텐츠 형태 (예: ${contentType})",
      "title": "콘텐츠 제목 (영하고 힙한 감성으로, 예: '00의 밤, 그리고 우리')",
      "concept": "기획 의도 및 핵심 아이디어",
      "storyline": "스토리 개요 및 등장인물/소재 (구체적으로)",
      "empathyPoint": "이 콘텐츠가 어떻게 사용자의 감정을 위로하는지 설명",
      "socialPostText": "인스타그램에 올릴 감성 멘트. 딱딱하지 않고 '영(Young)'하고 '힙(Hip)'한 어조를 사용하세요. 줄바꿈을 자주 사용하여 호흡을 짤막하게 가져가고, ☁️✨🌊🎞️🌿 같은 감성 이모지를 문장 끝이나 중간에 감각적으로 배치하세요. 역사적인 사실은 은유적으로 녹여내고, 독자의 감성을 자극하여 '저장'을 부르는 문구를 작성하세요. (해시태그 제외)",
      "hashtags": ["해시태그1", "해시태그2", "해시태그3", "부산여행", "감성글귀", "위로", "힙플"]
    }
    
    어조는 트렌디하고 감각적이어야 하며, 촌스럽지 않은 세련된 위로를 건네주세요.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            contentType: { type: Type.STRING },
            title: { type: Type.STRING },
            concept: { type: Type.STRING },
            storyline: { type: Type.STRING },
            empathyPoint: { type: Type.STRING },
            socialPostText: { type: Type.STRING },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["contentType", "title", "concept", "storyline", "empathyPoint", "socialPostText", "hashtags"]
        }
      },
    });

    const text = response.text || "{}";
    return JSON.parse(text) as ContentPlan;
  } catch (error) {
    console.error("Planning error:", error);
    throw new Error("콘텐츠 기획에 실패했습니다.");
  }
};

/**
 * Step 3: Generate a poster image using Nano Banana (gemini-2.5-flash-image).
 */
export const generatePosterImage = async (
  plan: ContentPlan,
  location: string,
  emotion: string
): Promise<GeneratedPoster> => {
  if (!ai) throw new Error("API Key not found");

  // Using gemini-2.5-flash-image (Nano Banana) for generation
  const model = "gemini-2.5-flash-image";

  const isWebtoon = plan.contentType.includes("웹툰");

  let prompt = "";

  if (isWebtoon) {
    // Prompt for 4-cut Webtoon/Manhwa style with NO TEXT and HIPSTER aesthetic
    prompt = `
      Create a single image containing a 4-panel comic strip (4-cut webtoon layout).
      The panels should sequentially depict the following story: "${plan.storyline}".
      
      Setting: ${location} in Busan, South Korea.
      Emotion: ${emotion}.
      
      Style: Modern, Hipster aesthetic Korean Webtoon (Manhwa). Ethereal, Dreamy, and Highly Instagrammable.
      
      Visuals:
      - Panel 1: Establishing shot of the location (${location}) with a dreamy, sentimental atmosphere.
      - Panel 2: A character expressing the emotion, drawn in a modern, stylish way.
      - Panel 3: A symbolic moment related to the history, depicted abstractly and artistically.
      - Panel 4: A peaceful, healing conclusion.
      
      Colors: Soft, pastel, translucent, sparkling, young and hip color palette.
      Format: A 2x2 grid or a vertical strip of 4 panels within one image.
      
      CRITICAL: ABSOLUTELY NO SPEECH BUBBLES, NO DIALOGUE, NO TEXT inside the panels. Pure visual storytelling.
    `;
  } else {
    // Prompt for Ethereal Watercolor (Young & Hip)
    prompt = `
      A trendy and ethereal watercolor illustration of ${location} in Busan, South Korea.
      Theme: "${plan.title}" - capturing the emotion of "${emotion}".
      
      Style: High-end, sophisticated watercolor art with a modern, hipster aesthetic. Use wet-on-wet techniques for dreamy, translucent effects.
      Color Palette: Vibrant yet soft, pastel tones mixed with deep, emotional hues. 'Young and Hip' vibe.
      Atmosphere: Magical, sparkling, serene, highly Instagrammable. Cinematic lighting with soft bloom.
      
      Composition: Clean, artistic, negative space for aesthetic balance.
      No text overlay on the image. High resolution, detailed.
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [{ text: prompt }],
      },
    });

    let imageUrl = "";

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          // Determine mime type, default to png if not specified
          const mimeType = part.inlineData.mimeType || "image/png";
          imageUrl = `data:${mimeType};base64,${base64EncodeString}`;
          break;
        }
      }
    }

    if (!imageUrl) {
      throw new Error("이미지가 생성되지 않았습니다.");
    }

    return { imageUrl };
  } catch (error) {
    console.error("Image generation error:", error);
    throw new Error("이미지 생성에 실패했습니다.");
  }
};
