import axios from 'axios';

import { collection } from '../db';
import * as Trip from './Trip';
import * as User from './User';

async function create(transaction: Transaction) {
  return await collection('transaction').add({
    ...transaction,
    created_at: new Date(),
    updated_at: new Date()
  });
}

export async function update(transaction: TransactionSchema) {
  if (!transaction.id) throw new Error('Id is null for transaction');
  return await collection('transaction')
    .doc(transaction.id)
    .update({ ...transaction, updated_at: new Date() });
}

export async function findByCounterParties(
  creditorId: string,
  debitorId: string
): Promise<Transaction[]> {
  console.log('debitorId: ', debitorId);
  console.log('creditorId: ', creditorId);
  const snapshot = await collection('transaction')
    .where('creditor_user_id', '==', creditorId)
    .where('debitor_user_id', '==', debitorId)
    .limit(1)
    .get();
  if (!snapshot.empty) {
    return snapshot.docs.map(
      doc => ({ id: doc.id, ...doc.data() } as TransactionSchema)
    );
  }
  return [];
}

export interface Bill {
  tripName: string;
  creditors: string[];
  debitor: string;
  title: string;
  amount: number;
  currency?: string;
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

  if (bill.currency) {
    throw new Error('Currency ' + bill.currency + ' is not valid');
  }
  const currency = bill.currency || trip.currency;

  if (!bill.amount) throw new Error("Bill doesn't have an amount");
  const amount = bill.amount / creditorIds.length;

  return await Promise.all(
    creditorIds.map(id =>
      create({
        trip_id: trip.id,
        creditor_user_id: id,
        debitor_user_id: debitor.id,
        title: bill.title,
        amount: amount,
        currency: currency,
        remarks: ''
      })
    )
  );
}

export interface PaymentSummary {
  payerName: string;
  payeeName: string;
  total: number;
  base: string;
  breakdown: { [currency: string]: number };
}

async function getPaymentSummary(
  tripName: string,
  payerName: string,
  payeeName: string,
  currency?: string
): Promise<PaymentSummary> {
  if (!tripName) {
    throw new Error('No trip name is specified.');
  }
  const trip = await Trip.findByName(tripName);
  if (!trip.id) {
    throw new Error('Trip ' + tripName + ' has a null id');
  }

  const payer = await User.findByName(payerName);
  if (!payer.id) {
    throw new Error('User ' + payer.name + ' does not have an id');
  }

  const payee = await User.findByName(payeeName);
  if (!payee.id) throw new Error('User ' + payee.name + ' does not have an id');

  const transactions = await findByCounterParties(payer.id, payee.id);

  const baseCurrency = currency || trip.currency;
  const currencies = transactions
    .map(tx => tx.currency)
    .filter((value, i, self) => self.indexOf(value) === i);
  currencies.push(baseCurrency);

  const url = `https://api.exchangeratesapi.io/latest?base=${baseCurrency}&symbols=${currencies.join(
    ','
  )}`
  console.log(url);
  const { data: { rates } } = await axios.get(url);
  console.log(JSON.stringify(rates));

  const breakdown: { [currency: string]: number } = transactions.reduce(
    (acc, cur) => {
      const total = acc[cur.currency] || 0;
      return { ...acc, [cur.currency]: total + cur.amount };
    },
    {} as { [currency: string]: number }
  );

  console.log(JSON.stringify(transactions));

  console.log(JSON.stringify(breakdown));

  return {
    payerName,
    payeeName,
    total: Object.entries(breakdown)
      .map(([key, value]) => (value * rates[key]) / rates[baseCurrency])
      .reduce((acc, cur) => acc + cur, 0),
    base: baseCurrency,
    breakdown
  };
}

export async function getReceivable(
  tripName: string,
  payeeName: string,
  payerNames: string[],
  currency?: string
) {
  return Promise.all(
    payerNames.map(payerName =>
      getPaymentSummary(tripName, payerName, payeeName, currency)
    )
  );
}

export async function getPayable(
  tripName: string,
  payerName: string,
  payeeNames: string[],
  currency?: string
) {
  return Promise.all(
    payeeNames.map(payeeName =>
      getPaymentSummary(tripName, payerName, payeeName, currency)
    )
  );
}
