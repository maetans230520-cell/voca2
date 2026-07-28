export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    const { word } = req.body;
    if (!word) return res.status(400).json({ error: 'Word is required' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'API Key missing' });

    try {
        const prompt = `당신은 영어 선생님입니다. 사용자가 입력한 텍스트: "${word}"
이 텍스트가 실제 존재하는 의미 있는 영단어인지 확인하세요.
존재하지 않는 단어거나 무의미한 텍스트라면 아래 JSON 형식으로 반환:
{ "exists": false }

존재하는 단어라면 아래 JSON 형식으로 반환. 다른 설명은 절대 금지.
{
  "exists": true,
  "word": "${word}",
  "phonetic": "발음 기호 (예: [səˌrenˈdipədē])",
  "meaning": "가장 많이 쓰이는 한국어 뜻 1~2개",
  "synonyms": ["유의어1", "유의어2"],
  "example": "이 단어가 쓰인 짧은 영어 문장",
  "exampleBlanked": "example 문장에서 해당 단어부분만 '_____' 로 치환한 문장",
  "exampleMeaning": "해당 영어 문장의 한국어 해석"
}`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            })
        });

        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        res.status(200).json(JSON.parse(data.candidates[0].content.parts[0].text));
    } catch (error) {
        res.status(500).json({ error: 'Process failed' });
    }
}