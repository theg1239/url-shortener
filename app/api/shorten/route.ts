export const config = {
    runtime: 'nodejs',
  };
  
  import { NextResponse } from 'next/server';
  import clientPromise from '@/lib/mongodb';
  import { nanoid } from 'nanoid';
  
  export async function POST(request: Request) {
    console.time('Function Execution');
    try {
      const expectedPassword = process.env.SHORTEN_PASSWORD;
      if (!expectedPassword) {
        console.error('SHORTEN_PASSWORD is not defined');
        return NextResponse.json(
          { error: 'Server misconfiguration: SHORTEN_PASSWORD is not defined' },
          { status: 500 }
        );
      }

      // Read JSON body safely
      let body: any = {};
      try {
        body = await request.json();
      } catch (e) {
        body = {};
      }

      // Accept password either in the JSON body or via header `x-shorten-password`
      const providedPassword = (body && (body.password ?? undefined)) ?? request.headers.get('x-shorten-password');

      if (!providedPassword || providedPassword !== expectedPassword) {
        console.warn('Unauthorized attempt to shorten URL');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { originalUrl } = body;
      if (!originalUrl) {
        return NextResponse.json({ error: 'originalUrl is required' }, { status: 400 });
      }

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
        return NextResponse.json(
          { error: 'Short code collision. Please try again.' },
          { status: 500 }
        );
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
      if (!baseUrl) {
        throw new Error('NEXT_PUBLIC_BASE_URL is not defined');
      }
      const shortUrl = `${baseUrl}/${shortCode}`;

      console.log('Short URL:', shortUrl);

      console.timeEnd('Function Execution');
      return NextResponse.json({ shortUrl }, { status: 200 });
    } catch (error) {
      console.error('Error in POST /api/shorten:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
  