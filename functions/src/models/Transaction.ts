import * as admin from 'firebase-admin';
import { Currency } from './Currency';

export interface ITransaction {
  id?: string;
  trip_id: string;
  creditor_user_id: string;
  debitor_user_id: string;
  title: string;
  amount: number;
  currency: Currency;
  remarks: string;
  created_at?: Date;
  updated_at?: Date;
}

const db = admin.firestore();

function getCollection() {
  return db.collection('transaction');
}

async function saveCreation(transaction: ITransaction) {
  return await getCollection().add({
    ...transaction,
    created_at: new Date(),
    updated_at: new Date()
  });
}

async function saveUpdate(transaction: ITransaction) {
  if (!transaction.id) throw new Error('Id is null for transaction');
  return await getCollection()
    .doc(transaction.id)
    .update({ ...transaction, updated_at: new Date() });
}
