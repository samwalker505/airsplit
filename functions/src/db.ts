import { firestore } from 'firebase-admin';

const db = firestore();

export default db;

export function collection(table: string) {
  return db.collection(table);
}
