import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || process.env.Gemini_API_Key || process.env.GOOGLE_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export async function POST(request: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key Gemini belum disetel di Environment Variables Vercel.' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'File gambar tidak ditemukan dalam request.' }, { status: 400 });
    }

    // Batasi ukuran file maksimal 4 MB agar tidak melebihi limit Vercel
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Ukuran foto terlalu besar (maksimal 4MB). Coba gunakan gambar yang lebih kecil.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');
    const mimeType = file.type || 'image/jpeg';

    const promptText = `Analisis gambar dokumen medis/pasien ini. Ekstrak informasi penting dan berikan hasilnya dalam format JSON murni TANPA markdown block (tanpa \`\`\`json) dengan struktur kunci persis seperti ini:
    {
      "nama": "...",
      "no_mr": "...",
      "diagnosa": "...",
      "jenis_operasi": "..."
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: promptText },
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
          ],
        },
      ],
    });

    const responseText = response.text || '';
    const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanedText);

    return NextResponse.json({ success: true, data: parsedData });

  } catch (error: any) {
    console.error('Error detail API scan:', error);
    return NextResponse.json(
      { error: error?.message || 'Terjadi kesalahan internal saat memproses gambar dengan AI' },
      { status: 500 }
    );
  }
}