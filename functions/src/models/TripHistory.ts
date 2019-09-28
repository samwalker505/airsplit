import * as admin from 'firebase-admin';
export interface ITripHistory {
    id?: string;
    user_id: string;
    trip_id: string;
}
  
const db = admin.firestore();

export function getCollection() {
    return db.collection('trip_history');
}

export async function save(tripHistory: ITripHistory) {
    if (tripHistory.id) {
      await getCollection()
        .doc(tripHistory.id)
        .update({
          ...tripHistory,
          updated_at: new Date()
        });
    } else {
      await getCollection().add({
        ...tripHistory,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
  }
  