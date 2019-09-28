import * as admin from 'firebase-admin';

export interface IUser {
    id?: string;
    email: string;
    name?: string;
    created_at?: Date;
    updated_at?: Date;
}

const db = admin.firestore();

export function getCollection() {
    return db.collection('user')
}

export async function findByEmail(email: string) {
    const snapshot = await getCollection().where('email', '==', email).limit(1).get();
    if (!snapshot.empty) {
        return snapshot.docs[0].data() as IUser;
    }
    return null;
}

export async function create(params: {
    email: string;
    name: string;
}) {
    return {
        ...params,
        created_at: new Date(),
        updated_at: new Date(),
    }
}

export async function save(user: IUser) {
    if (user.id) {
        await getCollection().doc(user.id).update({
            ...user, 
            updated_at: new Date()
        })
    } else {
        await getCollection().add({
            ...user,
            created_at: new Date(),
            updated_at: new Date(),
        })
    }
}

export async function findOrCreateUser(params: {
    name: string,
    email: string,
}) {
    let user: IUser | null = await findByEmail(params.email);
    if (user) {
        return user;
    } else {
        const userToSave = await create(params);
        await save(userToSave)
        user = await findByEmail(params.email);
        return user;
    }
}