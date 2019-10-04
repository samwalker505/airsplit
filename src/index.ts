import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

admin.initializeApp(functions.config().firebase);

import { parse as json2csv } from 'json2csv';
import dialogflow from './dialogflow';
import * as Trip from './models/Trip';
import * as Transaction from './models/Transaction';

export const dialogflowFirebaseFulfillment = functions.https.onRequest(
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  dialogflow
);

// eslint-disable-next-line @typescript-eslint/no-misused-promises
export const generateCsv = functions.https.onRequest(async (req, res) => {
  const { username: userName, tripname: tripName } = req.query;
  console.log(userName, tripName);
  const payeeNames = (await Trip.getUsersByTripName(tripName)).map(
    user => user.name
  );
  console.log('payeeNames', payeeNames);
  const paymentSummary = await Transaction.getPayable(
    tripName,
    userName,
    payeeNames
  );
  console.log('payment summary', paymentSummary);
  const csv = json2csv(paymentSummary);
  res.setHeader('Content-disposition', 'attachment; filename=report.csv');
  res.set('Content-Type', 'text/csv');
  res.status(200).send(csv);
});
