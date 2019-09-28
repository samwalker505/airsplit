import { parse as json2csv } from 'json2csv';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp(functions.config().firebase);

import {
  dialogflow,
  Permission,
  Suggestions
  // Carousel,
  // BasicCard,
  // Image,
} from 'actions-on-google';

import * as User from './models/User';
import * as Transaction from './models/Transaction';
import findByString from './models/Currency';
import * as Trip from './models/Trip';
import * as Currency from './models/Currency';

// Instantiate the Dialogflow client.
const app = dialogflow({ debug: true });

// // Handle the Dialogflow intent named 'Default Welcome Intent'.
app.intent('Default Welcome Intent', conv => {
  const name = conv.user.storage.userName;
  if (!name) {
    // Asks the user's permission to know their name, for personalization.
    conv.ask(
      new Permission({
        context: 'Hi there, to get to know you better',
        permissions: 'NAME'
      })
    );
  } else {
    // conv.context.set({
    //   name: 'user',
    //   lifespan: 99,
    //   parameters: {
    //     name: name
    //   }
    // });

    conv.data.name = name;
    conv.ask(`Hi again, ${name}. Having a fun trip?`);
  }
});

// Handle the Dialogflow intent named 'actions_intent_PERMISSION'. If user
// agreed to PERMISSION prompt, then boolean value 'permissionGranted' is true.
app.intent(
  'actions_intent_PERMISSION',
  async (conv, params, permissionGranted) => {
    if (!permissionGranted) {
      // If the user denied our request, go ahead with the conversation.
      // TODO
      conv.ask(`I need your permission to proceed.`);
    } else {
      // If the user accepted our request, store their name in
      // the 'conv.user.storage' object for the duration of the conversation.

      conv.user.storage.userName = conv.user.name.display;
      const name = conv.user.name.display;
      conv.ask(`Thanks, ${name}.`);
      conv.ask(
        'You can create group by saying Create London trip or Join group by saying Join London trip'
      );
    }
  }
);

// TODO:
app.intent(
  'create_group',
  async (conv, { group_name, name, currency_name }) => {
    // const name = conv.user.storage.userName;
    conv.data.name = name;
    console.log('creating group with: ', name);

    const params = {
      email: name,
      name: name
    };

    console.log('creating user from Actions on google');
    console.log(params);

    const user = await User.findOrCreateUser(params);
    console.log('user created');
    console.log(user);

    let trip_params = {
      currency: currency_name,
      name: group_name,
      email: name
    };
    const trip = await Trip.findOrCreateTrip(trip_params);
    console.log('trip created');
    console.log(trip);
    conv.data.tripName = group_name;
    conv.ask('Your trip "' + group_name + '" is created!');
  }
);

app.intent('join_group', async (conv, { group_name, name }) => {
  // Respond with the user's lucky number and end the conversation.
  //TODO: call join group(group_name, name)
  //      if group not exist then return

  conv.user.storage.name = name;
  console.log('joining group with: ', name);

  const params = {
    email: name,
    name: name
  };

  console.log('creating user from Actions on google');
  console.log(params);

  const user = await User.findOrCreateUser(params);
  console.log('user created');
  console.log(user);

  const tripParam = {
    email: name,
    tripName: group_name
  };
  console.log('Trip param');
  console.log(tripParam);
  try {
    const joinedTrip = await Trip.joinTrip(tripParam);
    console.log('Joined trip: ', joinedTrip);
    conv.user.storage.tripName = group_name;
    conv.ask('Joined Trip "' + group_name + '" as ' + '"' + name + '".');
  } catch (e) {
    console.error('ERROR IN joining trip');
    console.error(e);
    conv.ask('Cannot find Trip "' + group_name + '" !');
  }
});

// app.intent('Forget everything', conv => {
//   conv.ask('User storage: ', conv.user.storage);
//   conv.user.storage = {};
//   conv.ask(`Alright, I forgot your last result.`);
// });

app.intent('split_bill', async (conv, { item, names, amount, currency }) => {
  console.log('SPLITTING BILL');
  console.log(conv.user.storage);
  const storage = conv.user.storage;
  const group_name = storage.tripName; //TODO get trip name from CONTEXT
  const debitor = storage.name; //TODO get user name from STORAGE
  console.log('group name', group_name);
  console.log('debitors', debitor);
  const creditors = names; //list of names
  console.log('CREDITORS: ', creditors);
  let res = '';

  // if (!currency) {
  //   currency = await Trip.findByName(group_name).currency;
  // }

  try {
    const billParam = {
      tripName: group_name,
      creditors: creditors,
      debitor: debitor,
      title: item,
      amount: amount,
      currency: Currency.USD
    };

    console.log('Spliting bill: ', billParam);
    const billRes = await Transaction.splitNewBill(billParam);
    console.log('bill response', billRes);
  } catch (e) {
    res = 'Sorry, ' + e + ' .';
    console.error(res);
    conv.ask(res);
  }

  // res = `Ok, bill $currency, {1} {2} is splited among {3}`
  //   currency,
  //   amount,
  //   item,
  //   names
  // );
  res =
    'Ok, billed amount' +
    amount +
    ' ' +
    currency +
    ' for ' +
    item +
    ' with ' +
    names.toString();
  conv.ask(res);
});

export const dialogflowFirebaseFulfillment = functions.https.onRequest(app);

export const generateCsv = functions.https.onRequest(async (req, res) => {
  const { username: userName, tripname: tripName } = req.query;
  console.log(userName, tripName);
  const payeeNames = (await Trip.getUsersByTripName(tripName)).map(user => user.name);
  console.log('payeeNames', payeeNames);
  const paymentSummary = await Transaction.getPayable({tripName, userName, payeeNames });
  console.log('payment summary', paymentSummary)
  const csv = json2csv(paymentSummary);
  res.setHeader('Content-disposition', 'attachment; filename=report.csv');
  res.set('Content-Type', 'text/csv');
  res.status(200).send(csv);
});
