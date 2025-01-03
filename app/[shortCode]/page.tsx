import { redirect } from 'next/navigation';
import clientPromise from '@/lib/mongodb';

interface RedirectPageProps {
  params: {
    shortCode: string;
  };
}

export default async function RedirectPage({ params }: RedirectPageProps) {
  const { shortCode } = params;

  console.log('Received shortCode:', shortCode);

  if (!shortCode) {
    console.log('No shortCode provided. Redirecting to homepage.');
    redirect('/');
  }

  let mapping;
  try {
    const client = await clientPromise;
    const db = client.db('urlShortener');
    const collection = db.collection('urlMappings');

    mapping = await collection.findOne({ shortCode });

    console.log('Found mapping:', mapping); 

    if (mapping?.originalUrl) {
      await collection.updateOne(
        { shortCode },
        { $inc: { clickCount: 1 }, $set: { lastClicked: new Date() } }
      );

      console.log('Click count updated. Redirecting to:', mapping.originalUrl);
    }
  } catch (error) {
    console.error('Error in RedirectPage:', error);
    redirect('/');
  }

  if (mapping?.originalUrl) {
    redirect(mapping.originalUrl);
  } else {
    console.log('No mapping found. Redirecting to homepage.');
    redirect('/');
  }
}
