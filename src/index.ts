import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

admin.initializeApp(functions.config().firebase);

// for dev
// admin.initializeApp({
//   credential: admin.credential.applicationDefault(),
// });

import df from './dialogflow';
import report from './report';

/* eslint-disable @typescript-eslint/no-misused-promises */
export const dialogflowFirebaseFulfillment = functions.https.onRequest(df);

export const app = functions.https.onRequest(report);
/* eslint-enable @typescript-eslint/no-misused-promises */
