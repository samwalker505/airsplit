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

export const joinTrip = functions.https.onRequest(async (req, res) => {
    const params = {
        userName: 'Sam',
        email: 'samwalker505@gmail.com',
        tripName: 'Chisino',
    }
    const joinedTrip = await Trip.joinTrip(params);
    return res.json(joinedTrip);
})
