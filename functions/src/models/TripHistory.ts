import { collection } from '../db';

export async function create(tripHistory: TripHistory) {
  await collection('trip_history').add({
    ...tripHistory,
    created_at: new Date(),
    updated_at: new Date()
  });
}

export async function update(tripHistory: TripHistorySchema) {
  await collection('trip_history')
    .doc(tripHistory.id)
    .update({ ...tripHistory, updated_at: new Date() });
}
