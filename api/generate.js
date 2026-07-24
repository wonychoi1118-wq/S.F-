import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { menuText } = req.body;

  if (!menuText) {
    return res.status(400).json({ error: '급식 메뉴 텍스트가 필요합니다.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: '서버에 GEMINI_API_KEY가 설정되어 있지 않습니다.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      다음은 오늘의 학교 급식 메뉴 텍스트입니다.
      메뉴 뒤나 괄호 안에 표기된 식단 알레르기 유발물질 번호(숫자)들을 모두 추출해 주세요.

      [급식 메뉴]
      ${menuText}

      응답은 오직 숫자를 요소로 가지는 JSON 배열 형식으로만 출력해 주세요.
      예시: [1, 5, 12, 18]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const resultText = response.text;
    const detectedNumbers = JSON.parse(resultText);

    return res.status(200).json({ numbers: detectedNumbers });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ error: 'Gemini API 처리 중 오류가 발생했습니다.' });
  }
}