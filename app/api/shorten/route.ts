export const config = {
    runtime: 'nodejs',
  };
  
  import { NextResponse } from 'next/server';
  import clientPromise from '@/lib/mongodb';
  
  export async function POST(request: Request) {
    try {
      const client = await clientPromise;
      const db = client.db('urlShortener');
      const collection = db.collection('urlMappings');
  
      const { originalUrl } = await request.json();
      const shortCode = generateShortCode();
  
      await collection.insertOne({
        shortCode,
        originalUrl,
        clickCount: 0,
        createdAt: new Date(),
      });
  
      return NextResponse.json({ shortCode });
    } catch (error) {
      console.error('Error in shorten API:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
  
  function generateShortCode(length = 6): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }
  