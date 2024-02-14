
import functions from 'firebase-functions';
import vision from '@google-cloud/vision';
import admin from 'firebase-admin';

// Ensure these are the same as the one in ../firebase/messaging
export const FCM_TOKEN_COLLECTION = 'fcmTokens';
export const FCM_TOKEN_KEY = 'fcmToken'; 

// Ensure this is the same as the one in ../firebase/firestore
export const RECEIPT_COLLECTION = 'receipts';

admin.initializeApp();
export const readReceiptDetails = functions.storage.object().onFinalize(async (object) => {
  const imageBucket = `gs://${object.bucket}/${object.name}`;
  const client = new vision.ImageAnnotatorClient();

  const [textDetections] = await client.textDetection(imageBucket);
  const [annotation] = textDetections.textAnnotations;
  const text = annotation ? annotation.description : '';
  
  // Parse text

  // Get user ID
  const re = /(.*)\//;
  const uid = re.exec(object.name)[1];

  // Check whether receipt already exists by checking for existing imageBucket so a document isn't 
  // created for the same receipt
  let doc = await admin.firestore().collection(RECEIPT_COLLECTION).where('imageBucket', '==', imageBucket).get();
  if (doc.empty) {
    const receipt = {
      address: '123 Happy St, Bestcity, World 67890', 
      amount: '23.45',
      date: new Date(),
      imageBucket,
      items: 'best appetizer, best main dish, best dessert',
      isConfirmed: false,
      locationName: 'Best Restaurant',
      uid
    };
    await admin.firestore().collection(RECEIPT_COLLECTION).add(receipt);
  }

  const documentSnapshot = await admin.firestore().collection(FCM_TOKEN_COLLECTION).doc(uid).get();
  const token = documentSnapshot.data()[FCM_TOKEN_KEY];

  const message = 'Your receipt is ready for review and confirmation!';

  const payload = {
    token,
    notification: {
      title: 'Expense Tracker: Your expense has been processed',
      body: message,
    }
  };

  admin.messaging().send(payload).then((response) => {
    // Response is a message ID string.
    functions.logger.log('Successfully sent message: ', response);
  }).catch((error) => {
    functions.logger.log('error: ', error);
  }); 

});