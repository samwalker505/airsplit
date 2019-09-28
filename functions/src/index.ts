import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp(functions.config().firebase);

import * as User from './models/User';
import * as Trip from './models/Trip';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript

export const createUser = functions.https.onRequest(async (req, res) => {
    const params = {
        email: 'samwalker505@gmail.com',
        name: 'Sam'
    }
    const user = await User.findOrCreateUser(params);
    res.json(user);
});

export const createTrip = functions.https.onRequest(async (req, res) => {
    const params = {
        email: 'samwalker505@gmail.com',
        name: 'Chisino',
        currency: 'HKD' as Trip.Currency,
    }
    const trip = await Trip.findOrCreateTrip(params);
    res.json(trip);
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

