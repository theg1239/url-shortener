import { redirect } from 'next/navigation';
import clientPromise from '@/lib/mongodb';

interface RedirectPageProps {
  params: Promise<{
    shortCode: string;
  }>;
}

export default async function RedirectPage({ params }: RedirectPageProps) {
  const { shortCode } = await params;

  if (!shortCode) {
    redirect('/');
  }

  let mapping;
  try {
    const client = await clientPromise;
    const db = client.db('urlShortener');
    const collection = db.collection('urlMappings');

    mapping = await collection.findOne({ shortCode });
  } catch (error) {
    console.error('Database error:', error);
    // Redirect to homepage on database errors
    redirect('/');
  }

  if (mapping?.originalUrl) {
    try {
      const client = await clientPromise;
      const db = client.db('urlShortener');
      const collection = db.collection('urlMappings');

      await collection.updateOne(
        { shortCode },
        { $inc: { clickCount: 1 }, $set: { lastClicked: new Date() } }
      );

      redirect(mapping.originalUrl);
    } catch (error) {
      console.error('Update error:', error);
      redirect('/');
    }
  } else {
    redirect('/');
  }
}
