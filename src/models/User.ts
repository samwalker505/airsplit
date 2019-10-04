import { collection } from '../db';

async function findBy(key: string, value: string): Promise<UserSchema> {
  const snapshot = await collection('user')
    .where(key, '==', value)
    .limit(1)
    .get();
  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    return { ...doc.data(), id: doc.id } as UserSchema;
  }
  throw new Error('Cannot find a user with ' + key + ' ' + value);
}

export async function findByEmail(email: string): Promise<UserSchema> {
  return findBy('email', email);
}

export async function findByName(name: string): Promise<UserSchema> {
  return findBy('name', name);
}

export async function create(user: User) {
  const newUser = { ...user, created_at: new Date(), updated_at: new Date() };
  return await collection('user').add(newUser);
}

export async function update(user: UserSchema) {
  return await collection('user')
    .doc(user.id)
    .update({ ...user, updated_at: new Date() });
}

export async function findOrCreateUser(params: {
  name: string;
  email: string;
}) {
  try {
    console.log('Try creating user ' + params);
    return await findByEmail(params.email);
  } catch (err) {
    console.log('Catch creating user', params);
    const userToSave = {
      ...params,
      created_at: new Date(),
      updated_at: new Date()
    };
    console.log('User to save ' + userToSave);
    await create(userToSave);
    const user = await findByEmail(params.email);
    console.log('User ' + user);
    return user;
  }
}
