import { redirect } from 'next/navigation';
import clientPromise from '@/lib/mongodb';

interface RedirectPageProps {
  params: {
    shortCode: string;
  };
}

export default async function RedirectPage({ params }: RedirectPageProps) {
  const awaitedParams = await params;
  const { shortCode } = awaitedParams;

  if (!shortCode) {
    redirect('/');
  }

  const client = await clientPromise;
  const db = client.db('urlShortener');
  const collection = db.collection('urlMappings');

  const mapping = await collection.findOne({ shortCode });

  if (!mapping?.originalUrl) {
    redirect('/');
  }

  await collection.updateOne(
    { shortCode },
    { $inc: { clickCount: 1 }, $set: { lastClicked: new Date() } }
  );

  redirect(mapping.originalUrl);
}
