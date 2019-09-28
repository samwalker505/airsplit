"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);
const actions_on_google_1 = require("actions-on-google");
const User = require("./models/User");
const Trip = require("./models/Trip");
// Instantiate the Dialogflow client.
const app = actions_on_google_1.dialogflow({ debug: true });
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
exports.createUser = functions.https.onRequest(async (req, res) => {
    const params = {
        email: "samwalker505@gmail.com",
        name: "Sam"
    };
    const user = await User.findOrCreateUser(params);
    res.json(user);
});
exports.createTrip = functions.https.onRequest(async (req, res) => {
    const params = {
        email: "samwalker505@gmail.com",
        name: "Chisino"
    };
    const trip = await Trip.findOrCreateTrip(params);
    res.json(trip);
});
// // Handle the Dialogflow intent named 'Default Welcome Intent'.
app.intent("Default Welcome Intent", conv => {
    const name = conv.user.storage.userName;
    if (!name) {
        // Asks the user's permission to know their name, for personalization.
        conv.ask(new actions_on_google_1.Permission({
            context: "Hi there, to get to know you better",
            permissions: "NAME"
        }));
    }
    else {
        conv.ask(`Hi again, ${name}. Having a fun trip?`);
    }
});
// Handle the Dialogflow intent named 'actions_intent_PERMISSION'. If user
// agreed to PERMISSION prompt, then boolean value 'permissionGranted' is true.
app.intent("actions_intent_PERMISSION", (conv, params, permissionGranted) => {
    if (!permissionGranted) {
        // If the user denied our request, go ahead with the conversation.
        conv.ask(`OK, no worries. Want to create or join trip?`);
        conv.ask(new actions_on_google_1.Suggestions("Create", "Join"));
    }
    else {
        // If the user accepted our request, store their name in
        // the 'conv.user.storage' object for the duration of the conversation.
        conv.user.storage.userName = conv.user.name.display;
        conv.ask(`Thanks, ${conv.user.storage.userName}. Want to create or join trip?`);
        conv.ask(new actions_on_google_1.Suggestions("Create", "Join"));
    }
});
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
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
//# sourceMappingURL=index.js.map