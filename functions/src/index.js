import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp(functions.config().firebase);

import {
  dialogflow,
  Permission,
  Suggestions
  // Carousel,
  // BasicCard,
  // Image,
} from "actions-on-google";

import * as User from "./models/User";
import * as Trip from "./models/Trip";

// Instantiate the Dialogflow client.
const app = dialogflow({ debug: true });

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript

export const createUser = functions.https.onRequest(async (req, res) => {
  const params = {
    email: "samwalker505@gmail.com",
    name: "Sam"
  };
  const user = await User.findOrCreateUser(params);
  res.json(user);
});

export const createTrip = functions.https.onRequest(async (req, res) => {
  const params = {
    email: "samwalker505@gmail.com",
    name: "Chisino"
  };
  const trip = await Trip.findOrCreateTrip(params);
  res.json(trip);
});

export const joinTrip = functions.https.onRequest(async (req, res) => {
  const params = {
    userName: 'Sam',
    tripName: 'Chisino'
  };
  const trip = await Trip.joinTrip(params);
  res.json(trip);
});

// // Handle the Dialogflow intent named 'Default Welcome Intent'.
app.intent("Default Welcome Intent", conv => {
  const name = conv.user.storage.userName;
  if (!name) {
    // Asks the user's permission to know their name, for personalization.
    conv.ask(
      new Permission({
        context: "Hi there, to get to know you better",
        permissions: "NAME"
      })
    );
  } else {
    conv.ask(`Hi again, ${name}. Having a fun trip?`);
  }
});

// Handle the Dialogflow intent named 'actions_intent_PERMISSION'. If user
// agreed to PERMISSION prompt, then boolean value 'permissionGranted' is true.
app.intent("actions_intent_PERMISSION", (conv, params, permissionGranted) => {
  if (!permissionGranted) {
    // If the user denied our request, go ahead with the conversation.
    conv.ask(`OK, no worries. Want to create or join trip?`);
    conv.ask(new Suggestions("Create", "Join"));
  } else {
    // If the user accepted our request, store their name in
    // the 'conv.user.storage' object for the duration of the conversation.
    conv.user.storage.userName = conv.user.name.display;
    conv.ask(
      `Thanks, ${conv.user.storage.userName}. Want to create or join trip?`
    );
    conv.ask(new Suggestions("Create", "Join"));
  }
});

export const dialogflowFirebaseFulfillment = functions.https.onRequest(app);

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
