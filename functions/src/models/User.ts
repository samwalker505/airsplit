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
  return db.collection('user');
}

export async function findBy(key: string, value: string) {
  const snapshot = await getCollection()
    .where(key, '==', value)
    .limit(1)
    .get();
  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    return { ...doc.data(), id: doc.id } as IUser;
  }
  return null;
}

export async function findByEmail(email: string) {
  return findBy('email', email);
}

export async function findByName(name: string) {
  return findBy('name', name);
}

export async function create(params: { email: string; name: string }) {
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
  let user: IUser | null = await findByEmail(params.email);
  if (user) {
    return user;
  } else {
    const userToSave = await create(params);
    await save(userToSave);
    user = await findByEmail(params.email);
    return user;
  }
}
