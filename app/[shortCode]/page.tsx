export const config = {
  runtime: 'nodejs',
};

import { redirect } from 'next/navigation';
import clientPromise from '@/lib/mongodb';

interface RedirectPageProps {
  params: Promise<{
    shortCode: string;
  }>;
}

export default async function RedirectPage({ params }: RedirectPageProps) {
  try {
    const { shortCode } = await params;

    if (!shortCode) {
      console.warn('No shortCode provided. Redirecting to homepage.');
      redirect('/');
    }

    console.time('DB Connection');
    const client = await clientPromise;
    const db = client.db('urlShortener');
    const collection = db.collection('urlMappings');
    console.timeEnd('DB Connection');

    console.time('Find Mapping');
    const mapping = await collection.findOne({ shortCode });
    console.timeEnd('Find Mapping');

    if (mapping?.originalUrl) {
      console.time('Update Click Count');
      await collection.updateOne(
        { shortCode },
        { $inc: { clickCount: 1 }, $set: { lastClicked: new Date() } }
      );
      console.timeEnd('Update Click Count');

      console.log(`Redirecting to: ${mapping.originalUrl}`);
      redirect(mapping.originalUrl);
    } else {
      console.warn(`No mapping found for shortCode: ${shortCode}. Redirecting to homepage.`);
      redirect('/');
    }
  } catch (error) {
    console.error('Error in RedirectPage:', error);
    redirect('/');
  }
}
