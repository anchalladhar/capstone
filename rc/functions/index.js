

import functions, { logger } from 'firebase-functions';
import vision from '@google-cloud/vision';
import admin from 'firebase-admin';

export const RECEIPT_COLLECTION = 'receipts';

admin.initializeApp();
export const processImage = functions.https.onCall(async (data, context) => {
  const imageBucket = data.bucket;
  const client = new vision.ImageAnnotatorClient();

  const [textDetections] = await client.textDetection(imageBucket);
  const [annotation] = textDetections.textAnnotations;
  const text = annotation ? annotation.description : '';
  logger.log(text);
  
  // Parse text

  // Going to hardcode returned text for relevant fields
  const receipt = {
    address: '123 Happy St, Bestcity, World 67890', 
    amount: '23.45',
    date: new Date(),
    imageBucket,
    items: 'best appetizer, best main dish, best dessert',
    isConfirmed: false,
    locationName: 'Best Restaurant',
    uid: data.uid
  };

  admin.firestore().collection(RECEIPT_COLLECTION).add(receipt);
});