"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
const db = admin.firestore();
function getCollection() {
    return db.collection('user');
}
exports.getCollection = getCollection;
async function findByEmail(email) {
    const snapshot = await getCollection().where('email', '==', email).limit(1).get();
    if (!snapshot.empty) {
        return snapshot.docs[0].data();
    }
    return null;
}
exports.findByEmail = findByEmail;
async function create(params) {
    return Object.assign(Object.assign({}, params), { created_at: new Date(), updated_at: new Date() });
}
exports.create = create;
async function save(user) {
    if (user.id) {
        await getCollection().doc(user.id).update(Object.assign(Object.assign({}, user), { updated_at: new Date() }));
    }
    else {
        await getCollection().add(Object.assign(Object.assign({}, user), { created_at: new Date(), updated_at: new Date() }));
    }
}
exports.save = save;
async function findOrCreateUser(params) {
    let user = await findByEmail(params.email);
    if (user) {
        return user;
    }
    else {
        const userToSave = await create(params);
        await save(userToSave);
        user = await findByEmail(params.email);
        return user;
    }
}
exports.findOrCreateUser = findOrCreateUser;
//# sourceMappingURL=User.js.map