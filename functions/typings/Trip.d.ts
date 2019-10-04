declare interface Trip {
  name: string;
  user_id: string;
  status: TripStatus;
  currency: string;
}

declare interface TripSchema extends Trip, DatabaseObject {}
