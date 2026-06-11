import { GoogleGenAI } from '@google/genai';
import type { GeminiAnalysis, ForecastResult, RegionStats } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;

const ai = new GoogleGenAI({ apiKey: API_KEY });

// ─── Image Analysis ──────────────────────────────────────────────────────────

export async function analyzeImageWithGemini(
  imageBase64: string,
  mimeType: string
): Promise<GeminiAnalysis> {
  const model = ai.models;

  const response = await model.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType,
              data: imageBase64,
            },
          },
          {
            text: `Проанализируй изображение. Определи:
1. Есть ли на фото несанкционированная свалка.
2. Вероятность от 0 до 100.
3. Типы мусора.
4. Уровень загрязнения: low, medium, high.
5. Есть ли опасные отходы.

Верни ТОЛЬКО валидный JSON без пояснений и markdown:
{
  "dump_detected": true,
  "confidence": 92,
  "waste_types": ["plastic", "construction"],
  "pollution_level": "high",
  "hazardous_waste": false
}`,
          },
        ],
      },
    ],
  });

  const text = response.text ?? '';
  const cleaned = text.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(cleaned) as GeminiAnalysis;
  return parsed;
}

// ─── Forecast Analysis ───────────────────────────────────────────────────────

export async function getForecastFromGemini(
  regions: RegionStats[]
): Promise<ForecastResult[]> {
  const statsJson = JSON.stringify(
    regions.map((r) => ({
      region: r.name,
      total_reports: r.total,
      recent_30d: r.recent,
      avg_pollution: r.avgPollution,
      risk_score: r.riskScore,
    })),
    null,
    2
  );

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Ты экологический аналитик по Казахстану.

На основе статистики по регионам оцени вероятность появления новых несанкционированных свалок.

Статистика:
${statsJson}

Для КАЖДОГО региона верни JSON массив (без пояснений, только JSON):
[
  {
    "region": "Астана",
    "risk": 75,
    "summary": "Краткое объяснение на русском языке (1-2 предложения)"
  }
]`,
          },
        ],
      },
    ],
  });

  const text = response.text ?? '[]';
  const cleaned = text.replace(/```json|```/g, '').trim();

  try {
    const arr = JSON.parse(cleaned) as Array<{
      region: string;
      risk: number;
      summary: string;
    }>;
    return arr.map((item) => ({ risk: item.risk, summary: item.summary }));
  } catch {
    return regions.map(() => ({ risk: 50, summary: 'Данные недоступны' }));
  }
}

// ─── Single region forecast ──────────────────────────────────────────────────

export async function getSingleForecast(
  stats: RegionStats
): Promise<ForecastResult> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Ты экологический аналитик.
Регион: ${stats.name}
Всего обращений: ${stats.total}
За последние 30 дней: ${stats.recent}
Средний уровень загрязнения (0-2): ${stats.avgPollution.toFixed(2)}
Расчётный риск-балл: ${stats.riskScore}

Оцени вероятность появления новых несанкционированных свалок.
Верни ТОЛЬКО JSON без пояснений:
{"risk": 0, "summary": ""}`,
          },
        ],
      },
    ],
  });

  const text = response.text ?? '{}';
  const cleaned = text.replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(cleaned) as ForecastResult;
  } catch {
    return { risk: stats.riskScore, summary: 'Анализ недоступен.' };
  }
}
