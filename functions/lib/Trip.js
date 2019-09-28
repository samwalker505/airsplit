"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
const User = require("./User");
const db = admin.firestore();
function getCollection() {
    return db.collection('trip');
}
exports.getCollection = getCollection;
async function findByName(name) {
    const snapshot = await getCollection().where('name', '==', name).limit(1).get();
    if (!snapshot.empty) {
        return snapshot.docs[0].data();
    }
    return null;
}
exports.findByName = findByName;
async function create(params) {
    return Object.assign(Object.assign({}, params), { status: 'active', created_at: new Date(), updated_at: new Date() });
}
exports.create = create;
async function save(trip) {
    if (trip.id) {
        await getCollection().doc(trip.id).update(Object.assign(Object.assign({}, trip), { updated_at: new Date() }));
    }
    else {
        await getCollection().add(Object.assign(Object.assign({}, trip), { created_at: new Date(), updated_at: new Date() }));
    }
}
exports.save = save;
async function findOrCreateTrip(params) {
    const { email, name, currency, } = params;
    const user = await User.findByEmail(email);
    if (!user) {
        throw new Error('ERR_ENTITY_NOT_FOUND');
    }
    if (findByName(name)) {
        throw new Error('ERR_DUPLICATE_KEY');
    }
    const tripToSave = await create({
        user_id: user.id,
        name,
        currency
    });
    await save(tripToSave);
    return findByName(name);
}
exports.findOrCreateTrip = findOrCreateTrip;
//# sourceMappingURL=Trip.js.map