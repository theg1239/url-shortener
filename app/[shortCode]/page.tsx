import { redirect } from 'next/navigation';
import clientPromise from '@/lib/mongodb';

interface RedirectPageProps {
  params: {
    shortCode: string;
  };
}

export default async function RedirectPage({ params }: RedirectPageProps) {
  const { shortCode } = params;

  if (!shortCode) {
    redirect('/');
    return null; // Prevent further code execution
  }

  try {
    const client = await clientPromise;
    const db = client.db('urlShortener');
    const collection = db.collection('urlMappings');

    // Fetch mapping for the given shortCode
    const mapping = await collection.findOne({ shortCode });

    if (!mapping?.originalUrl) {
      redirect('/');
      return null; // Prevent further code execution
    }

    // Update click count and lastClicked timestamp
    await collection.updateOne(
      { shortCode },
      { $inc: { clickCount: 1 }, $set: { lastClicked: new Date() } }
    );

    // Redirect to the original URL
    redirect(mapping.originalUrl);
    return null; // Prevent further code execution
  } catch (error) {
    console.error('Error handling shortCode:', error);
    redirect('/');
    return null; // Prevent further code execution
  }
}
