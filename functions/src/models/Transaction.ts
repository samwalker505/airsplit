import * as admin from 'firebase-admin';
import { Currency } from './Currency';
import * as Trip from './Trip';
import * as User from './User';

export interface ITransaction {
  id?: string;
  trip_id: string;
  creditor_user_id: string;
  debitor_user_id: string;
  title: string;
  amount: number;
  currency: Currency;
  remarks?: string;
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

export async function saveUpdate(transaction: ITransaction) {
  if (!transaction.id) throw new Error('Id is null for transaction');
  return await getCollection()
    .doc(transaction.id)
    .update({ ...transaction, updated_at: new Date() });
}

export interface Bill {
  tripName: string;
  creditors: string[];
  debitor: string;
  title: string;
  amount: number;
  currency?: Currency;
  remarks?: string;
}

export async function splitNewBill(bill: Bill) {
  if (!bill.title) throw new Error("Bill doesn't have a title");
  if (!bill.tripName) {
    throw new Error('No trip name is specified.');
  }
  const trip = await Trip.findByName(bill.tripName);
  if (!trip.id) {
    throw new Error('Trip ' + bill.tripName + ' has a null id');
  }

  if (!bill.debitor) throw new Error('No payer is specified');
  const debitor = await User.findByName(bill.debitor);
  if (!debitor.id) {
    throw new Error('User ' + debitor.name + ' has a null id');
  }

  if (!bill.creditors.length) throw new Error('No users are specified');
  const creditors = await Promise.all(
    bill.creditors.map(name => User.findByName(name))
  );
  const creditorIds = creditors.map(creditor => {
    if (!creditor.id) {
      throw new Error('User ' + creditor.name + ' has a null id');
    }
    return creditor.id;
  });

  if (bill.currency && Object.keys(Currency).includes(bill.currency)) {
    throw new Error('Currency ' + bill.currency + ' is not valid');
  }
  const currency = bill.currency || trip.currency;

  if (!bill.amount) throw new Error("Bill doesn't have an amount");
  const amount = bill.amount / creditorIds.length;

  return await Promise.all(
    creditorIds.map(id =>
      saveCreation({
        trip_id: trip.id as string,
        creditor_user_id: id,
        debitor_user_id: debitor.id as string,
        title: bill.title,
        amount: amount,
        currency: currency,
        remarks: ''
      })
    )
  );
}
