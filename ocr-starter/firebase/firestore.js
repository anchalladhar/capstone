

import { collection, deleteDoc, doc, getDocs, orderBy, query, setDoc, where } from 'firebase/firestore'; 
import { db } from './firebase';
import { getDownloadURL } from './storage';

// Name of receipt collection in Firestore
const RECEIPT_COLLECTION = 'receipts';

/* 
 Gets @isConfirmed receipts list for given @uid.
 Each receipt contains:
 - address: address of purchase location
 - amount: amount of expense
 - date: receipt date
 - id: document ID of receipt
 - imageURL: download URL of receipt image
 - imageBucket: Firebase Storage bucket of receipt image
 - isConfirmed: whether the user has already confirmed the receipt
 - items: items purchased
 - locationName: name of purchase location
 - uid: user id of which the receipt is for
 */
export async function getReceipts(uid, isConfirmed) {
  const receipts = query(collection(db, RECEIPT_COLLECTION), where("uid", "==", uid), where("isConfirmed", "==", isConfirmed), orderBy("date", "desc"));
  const snapshot = await getDocs(receipts);

  let allReceipts = [];
  for (const documentSnapshot of snapshot.docs) {
    const receipt = documentSnapshot.data();
    await allReceipts.push({
      ...receipt, 
      date: receipt['date'].toDate(), 
      id: documentSnapshot.id,
      imageUrl: await getDownloadURL(receipt['imageBucket']),
      imageBucket: receipt['imageBucket'],
    });
  }
  return allReceipts;
}

// Updates receipt with @docId with given information.
export function updateReceipt(docId, uid, date, locationName, address, items, amount, imageBucket, isConfirmed) {
  setDoc(doc(db, RECEIPT_COLLECTION, docId), { uid, date, locationName, address, items, amount, imageBucket, isConfirmed });
}

// Deletes receipt with given @id.
export function deleteReceipt(id) {
  deleteDoc(doc(db, RECEIPT_COLLECTION, id));
}