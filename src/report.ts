
import express from 'express';
import consolidate from 'consolidate';
import * as Transaction from './models/Transaction';

const app = express();

app.engine('pug', consolidate.pug);
app.set('views', `${__dirname}/../views`);
app.set('view engine', 'pug');

app.get('/', async (req, res, next) => {
  const { username: userName, tripname: tripName } = req.query;
  try {
    console.log(userName, tripName);
    const transactions = await Transaction.getPayableTransactions({
      tripName,
      userName,
    });
  
    return res.render('index', { transactions, tripName, userName });
  } catch (err) {

    next(err);  
  }
})

app.use((err: any, req: any, res: any, next: any) => {
  res.status(500)
  res.render('error', { error: err })
})

export default app;
