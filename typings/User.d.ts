declare interface User {
  name: string;
  email: string;
  current_trip_id?: string | null;
}

declare interface UserSchema extends User, DatabaseObject {}
