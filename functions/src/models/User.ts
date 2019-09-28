import * as admin from 'firebase-admin';

export interface IUser {
  id?: string;
  email: string;
  name?: string;
  current_trip_id?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

const db = admin.firestore();

function getCollection() {
  return db.collection('user');
}

async function findBy(key: string, value: string): Promise<IUser> {
  const snapshot = await getCollection()
    .where(key, '==', value)
    .limit(1)
    .get();
  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    return { ...doc.data(), id: doc.id } as IUser;
  }
  throw new Error('Cannot find a user with ' + key + ' ' + value);
}

export async function findByEmail(email: string): Promise<IUser> {
  return findBy('email', email);
}

export async function findByName(name: string): Promise<IUser> {
  return findBy('name', name);
}

export function create(params: { email: string; name: string }) {
  return {
    ...params,
    created_at: new Date(),
    updated_at: new Date()
  };
}

export async function save(user: IUser) {
  if (user.id) {
    await getCollection()
      .doc(user.id)
      .update({
        ...user,
        updated_at: new Date()
      });
  } else {
    await getCollection().add({
      ...user,
      created_at: new Date(),
      updated_at: new Date()
    });
  }
}

export async function findOrCreateUser(params: {
  name: string;
  email: string;
}) {
  try {
    console.log('try creating user', params);
    return await findByEmail(params.email);
  } catch (err) {
    console.log('catch creating user', params);
    const userToSave = create(params);
    console.log('USER TO SAVE', userToSave);
    await save(userToSave);
    const user = await findByEmail(params.email);
    console.log('USER : ', user);
    return user;
  }
}
