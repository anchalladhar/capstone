

import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, setDoc, where } from 'firebase/firestore'; 
import { db } from './firebase';
import { getDownloadURL } from './storage';

// Name of receipt collection in Firestore
const RECEIPT_COLLECTION = 'receipts';

/* 
 Adds receipt to Firestore with given receipt information:
 - address: address at which purchase was made
 - amount: amount of expense
 - date: date of purchase
 - imageBucket: bucket at which receipt image is stored in Firebase Storage
 - items: items purchased
 - locationName: name of location
 - uid: user ID who the expense is for
*/
export function addReceipt(uid, date, locationName, address, items, amount, imageBucket) {
  addDoc(collection(db, RECEIPT_COLLECTION), { uid, date, locationName, address, items, amount, imageBucket });
}

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
 export async function getReceiptsMvp(uid) {
  const receipts = query(collection(db, RECEIPT_COLLECTION), where("uid", "==", uid), orderBy("date", "desc"));
  return await processReceipts(receipts);
}

export async function getReceiptsOcr(uid, isConfirmed) {
  let receipts;
  if (isConfirmed) {
    // When getting receipts that are confirmed, need to also get receipts where there is no "isConfirmed" field
    receipts = query(collection(db, RECEIPT_COLLECTION), where("uid", "==", uid), orderBy("date", "desc"));    

    // Filter out the receipts where isConfirmed is false (hence leaving the ones without the isConfirmed field or isConfirmed as true)
    const snapshot = await getDocs(receipts);

    let allReceipts = [];
    for (const documentSnapshot of snapshot.docs) {
      const receipt = documentSnapshot.data();
      if (receipt['isConfirmed'] == null || receipt['isConfirmed']) {
        allReceipts.push({
          ...receipt, 
          date: receipt['date'].toDate(), 
          id: documentSnapshot.id,
          imageUrl: await getDownloadURL(receipt['imageBucket']),
          imageBucket: receipt['imageBucket'],
        });
      }
    }
    return allReceipts; 
  } else {
    // When getting receipts that aren't confirmed, can just get receipts where isConfirmed is false
    receipts = query(collection(db, RECEIPT_COLLECTION), where("uid", "==", uid), where("isConfirmed", "==", isConfirmed), orderBy("date", "desc"));
  }

  return processReceipts(receipts);
}

async function processReceipts(receipts) {
  const snapshot = await getDocs(receipts);

  let allReceipts = [];
  for (const documentSnapshot of snapshot.docs) {
    const receipt = documentSnapshot.data();
    allReceipts.push({
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