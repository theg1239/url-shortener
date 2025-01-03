import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { nanoid } from 'nanoid';

export const runtime = 'edge';

export async function POST(request: Request) {
  console.time('Function Execution');
  try {
    const { originalUrl } = await request.json();

    try {
      new URL(originalUrl);
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const shortCode = nanoid(7);

    console.time('DB Connection');
    const client = await clientPromise;
    const db = client.db('urlShortener');
    const collection = db.collection('urlMappings');
    console.timeEnd('DB Connection');

    console.time('Check Collision');
    const existing = await collection.findOne({ shortCode });
    console.timeEnd('Check Collision');
    if (existing) {
      return NextResponse.json({ error: 'Short code collision. Please try again.' }, { status: 500 });
    }

    console.time('Insert Record');
    await collection.insertOne({
      shortCode,
      originalUrl,
      createdAt: new Date(),
      clickCount: 0,
      lastClicked: null,
    });
    console.timeEnd('Insert Record');

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const shortUrl = `${baseUrl}/${shortCode}`;

    console.timeEnd('Function Execution');
    return NextResponse.json({ shortUrl }, { status: 200 });
  } catch (error) {
    console.error('Error in POST /api/shorten:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
