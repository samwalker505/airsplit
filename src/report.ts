import { parse as json2csv } from 'json2csv';
import * as functions from 'firebase-functions';

import * as Trip from './models/Trip';
import * as Transaction from './models/Transaction';

export default async function report(
  req: functions.https.Request,
  res: functions.Response
) {
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
}
