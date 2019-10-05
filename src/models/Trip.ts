import { collection } from '../db';
import * as User from './User';
import * as TripHistory from './TripHistory';
import * as errors from '../errors';

export async function findByName(name: string): Promise<TripSchema> {
  const snapshot = await collection('trip')
    .where('name', '==', name)
    .limit(1)
    .get();
  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    return { ...doc.data(), id: doc.id } as TripSchema;
  }
  throw new Error('Cannot find a trip with name ' + name);
}

export async function create(trip: Trip) {
  return await collection('trip').add({
    ...trip,
    created_at: new Date(),
    updated_at: new Date()
  });
}

export async function update(trip: TripSchema) {
  return await collection('trip')
    .doc(trip.id)
    .update({ ...trip, updated_at: new Date() });
}

export async function findOrCreateTrip(params: {
  email: string;
  name: string;
  currency: string;
}) {
  const { email, name, currency } = params;
  const user = await User.findByEmail(email);
  try {
    return await findByName(name);
  } catch {
    await create({
      user_id: user.id,
      name,
      currency: currency || 'USD',
      status: 'active' as TripStatus
    });
    return findByName(name);
  }
}

export async function joinTrip({
  email,
  tripName
}: {
  email: string;
  tripName: string;
}) {
  const [user, trip] = [
    await User.findByEmail(email),
    await findByName(tripName)
  ];
  user.current_trip_id = trip.id;
  await User.update(user);
  return trip;
}

export async function getUsersByTripName(tripName: string) {
  const trip = await findByName(tripName);
  const snapshot = await collection('user')
    .where('current_trip_id', '==', trip.id)
    .get();
  if (snapshot.empty) {
    throw new Error(errors.ERR_ENTITY_NOT_FOUND);
  }
  const users = snapshot.docs.map(
    doc => ({ ...doc.data(), id: doc.id } as UserSchema)
  );
  return users;
}

export async function endTrip({ tripName }: { tripName: string }) {
  const trip = await findByName(tripName);
  trip.status = 'archived';
  const users = await getUsersByTripName(tripName);
  users.forEach(user => (user.current_trip_id = null));
  const tripHistories = users.map(
    user => ({ user_id: user.id, trip_id: trip.id } as TripHistory)
  );
  await Promise.all(tripHistories.map(TripHistory.create));
  return { trip, tripHistories };
}
