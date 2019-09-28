import * as admin from 'firebase-admin';
import * as User from './User';
import * as errors from '../errors';

export type Currency  = 'HKD' | 'JPY' | 'RMB' | 'USD';
type TripStatus = 'active' | 'archived';

export interface ITrip {
    id?: string;
    name: string;
    user_id: string;
    status: TripStatus;
    currency: Currency | null;
    created_at?: Date;
    updated_at?: Date;
}

export interface ITripHistory {
    user_id: string;
    trip_id: string;
}

const db = admin.firestore();

export function getCollection() {
    return db.collection('trip')
}

export async function findByName(name: string) {
    const snapshot = await getCollection().where('name', '==', name).limit(1).get();
    if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return  {...doc.data(), id: doc.id } as ITrip;
    }
    return null;
}

export function create(params: {
    user_id: string;
    name: string;
    currency?: Currency;
}){
    return {
        ...params,
        currency: params.currency || null,
        status: 'active' as TripStatus,
        created_at: new Date(),
        updated_at: new Date(),
    }
}

export async function save(trip: ITrip) {
    if (trip.id) {
        await getCollection().doc(trip.id).update({
            ...trip, 
            updated_at: new Date()
        })
    } else {
        await getCollection().add({
            ...trip,
            created_at: new Date(),
            updated_at: new Date(),
        })
    }
}

export async function findOrCreateTrip(params: {
    email: string,
    name: string,
    currency?: Currency
}) {
    const {
        email, 
        name,
        currency,
    } = params;
    const user = await User.findByEmail(email)
    if (!user) {
        throw new Error(errors.ERR_ENTITY_NOT_FOUND);
    }
    if (await findByName(name)) {
        throw new Error(errors.ERR_DUPLICATE_KEY);
    }
    const tripToSave: ITrip = create({
        user_id: user.id!,
        name,
        currency
    })

    await save(tripToSave);
    return findByName(name);
}

export async function joinTrip({ email, tripName }: {
    email: string,
    tripName: string,
}) {
    const [ user, trip ] = [
        await User.findByEmail(email),
        await findByName(tripName),
    ];

    if (!user || !trip) {
        throw new Error(errors.ERR_ENTITY_NOT_FOUND);
    }

    user.current_trip_id = trip.id;
    await User.save(user);
    return trip;
}

