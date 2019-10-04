declare interface Transaction {
  trip_id: string;
  creditor_user_id: string;
  debitor_user_id: string;
  title: string;
  amount: number;
  currency: string;
  remarks: string;
}

declare interface TransactionSchema extends Transaction, DatabaseObject {}
