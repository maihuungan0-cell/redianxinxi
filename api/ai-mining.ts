import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { searchTerm } = req.body;

  if (!searchTerm) {
    return res.status(400).json({ error: 'Search term is required' });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'DEEPSEEK_API_KEY is not configured on the server.' });
  }

  try {
    const prompt = `你是一个专业的爆款文案专家和SEO专家。
请针对关键词 "${searchTerm}" 进行深度挖掘。
要求返回 JSON 格式数据，包含以下字段：
1. titles: 5个具有爆款潜力的标题（针对小红书、抖音、微博等平台）。
2. keywords: 5个相关的长尾热词或搜索词。
3. strategy: 一段简短的爆款运营策略建议（100字以内）。

请直接返回 JSON，不要包含任何 Markdown 代码块标记。`;

    const response = await axios.post(
      'https://api.deepseek.com/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that outputs JSON.' },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        stream: false,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    const result = response.data.choices[0].message.content;
    
    // Attempt to parse to ensure it's valid JSON
    const parsed = JSON.parse(result.replace(/```json\n?|\n?```/g, '').trim());
    
    res.status(200).json(parsed);
  } catch (error: any) {
    console.error('DeepSeek API Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'AI 挖掘失败，请稍后再试。', details: error.response?.data || error.message });
  }
}
