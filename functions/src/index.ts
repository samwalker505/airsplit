import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp(functions.config().firebase);

import * as User from './models/User';
import * as Trip from './models/Trip';
import { Currency } from './models/Currency';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript

export const createUser = functions.https.onRequest(async (req, res) => {
  const params = {
    email: 'samwalker505@gmail.com',
    name: 'Sam'
  };
  const user = await User.findOrCreateUser(params);
  res.json(user);
});

export const createTrip = functions.https.onRequest(async (req, res) => {
  const params = {
    email: 'samwalker505@gmail.com',
    name: 'Chisino',
    currency: 'HKD' as Currency
  };
  const trip = await Trip.findOrCreateTrip(params);
  res.json(trip);
});

export const joinTrip = functions.https.onRequest(async (req, res) => {
  const params = {
    userName: 'Sam',
    email: 'samwalker505@gmail.com',
    tripName: 'Chisino'
  };
  const trip = await Trip.joinTrip(params);
  return trip;
});

// export const testDb = functions.https.onRequest(async (req, res) => {
//   const docRef = db.collection('testUser');
//   await docRef.add({
//     first: 'Billy',
//     last: 'Lovelace',
//     born: 1815
//   });
//   res.json({
//       status: 'ok'
//   })
// })
