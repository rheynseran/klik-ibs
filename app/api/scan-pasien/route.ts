import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Menyesuaikan persis dengan penulisan di Vercel: Gemini_API_Key
const genAI = new GoogleGenerativeAI(process.env.Gemini_API_Key || '');

export async function POST(request: Request) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: 'Gambar tidak ditemukan' }, { status: 400 });
    }

    const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '');
    const mimeTypeMatch = image.match(/^data:(image\/[a-z]+);base64,/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Analisis gambar dokumen medis/pasien ini. Ekstrak informasi penting dan berikan hasilnya dalam format JSON murni tanpa teks tambahan dengan struktur berikut:
    {
      "namaPasien": "...",
      "noRm": "...",
      "diagnosa": "...",
      "jenisOperasi": "..."
    }`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      },
    ]);

    const responseText = result.response.text();
    const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanedText);

    return NextResponse.json({ success: true, data: parsedData });

  } catch (error: unknown) {
    console.error('Error processing scan:', error);
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat memproses gambar dengan AI';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}