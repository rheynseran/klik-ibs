import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Menggunakan penulisan API Key yang sesuai dengan Vercel Anda
const genAI = new GoogleGenerativeAI(process.env.Gemini_API_Key || '');

export async function POST(request: Request) {
  try {
    // 1. Tangkap FormData yang dikirim oleh Frontend
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'Gambar tidak ditemukan' }, { status: 400 });
    }

    // 2. Ubah File menjadi Buffer lalu ke Base64 agar bisa dibaca Gemini
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');
    const mimeType = file.type || 'image/jpeg';

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // 3. Sesuaikan kunci JSON agar cocok persis dengan pemetaan di frontend
    const prompt = `Analisis gambar dokumen medis/pasien ini. Ekstrak informasi penting dan berikan hasilnya dalam format JSON murni tanpa teks tambahan dengan struktur kunci berikut:
    {
      "nama": "...",
      "no_mr": "...",
      "diagnosa": "...",
      "jenis_operasi": "..."
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