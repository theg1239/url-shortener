import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { nanoid } from 'nanoid';

export async function POST(request: Request) {
  try {
    const { originalUrl } = await request.json();

    try {
      new URL(originalUrl);
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const shortCode = nanoid(7);

    const client = await clientPromise;
    const db = client.db('urlShortener');
    const collection = db.collection('urlMappings');

    const existing = await collection.findOne({ shortCode });
    if (existing) {
      return NextResponse.json({ error: 'Short code collision. Please try again.' }, { status: 500 });
    }

    await collection.insertOne({
      shortCode,
      originalUrl,
      createdAt: new Date(),
      clickCount: 0,
      lastClicked: null,
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const shortUrl = `${baseUrl}/${shortCode}`;

    return NextResponse.json({ shortUrl }, { status: 200 });
  } catch (error) {
    console.error('Error in POST /api/shorten:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
