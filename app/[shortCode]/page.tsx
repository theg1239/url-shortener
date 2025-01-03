import { redirect } from 'next/navigation';
import clientPromise from '@/lib/mongodb';

interface PageParams {
  shortCode: string;
}

interface PageProps {
  params: PageParams;
}

export default async function RedirectPage({ params }: PageProps) {
  const { shortCode } = params;

  if (!shortCode) {
    redirect('/');
  }

  try {
    const client = await clientPromise;
    const db = client.db('urlShortener');
    const collection = db.collection('urlMappings');

    const mapping = await collection.findOne({ shortCode });

    if (mapping && mapping.originalUrl) {
      await collection.updateOne(
        { shortCode },
        { $inc: { clickCount: 1 }, $set: { lastClicked: new Date() } }
      );

      redirect(mapping.originalUrl);
    } else {
      redirect('/');
    }
  } catch (error) {
    console.error('Error in RedirectPage:', error);
    redirect('/');
  }
}

export const runtime = 'edge';
