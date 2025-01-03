import { redirect } from 'next/navigation';
import clientPromise from '@/lib/mongodb';

interface PageProps {
  params: {
    shortCode: string;
  };
}

export default async function RedirectPage({ params }: PageProps) {
  const { shortCode } = params;

  if (!shortCode) {
    redirect('/');
  }

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
}
