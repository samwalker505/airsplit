declare interface TripHistory {
  user_id: string;
  trip_id: string;
}

declare interface TripHistorySchema extends TripHistory, DatabaseObject {}
