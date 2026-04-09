import { MongoClient } from "mongodb";
import { configDotenv } from "dotenv";

configDotenv();
const url = process.env.MONGODB_URL
console.log(url)
const client = new MongoClient(url);

const dbName = 'solana-wallet';

export async function storeUser(user) {
    console.log("saving user")
    await client.connect();
    console.log('Connected successfully to server');
    const db = client.db(dbName);
    const collection = db.collection('users');
    return collection.insertOne(user);
}

export async function getUserById(id) {
    console.log("saving user")
    await client.connect();
    console.log('Connected successfully to server');
    const db = client.db(dbName);
    const collection = db.collection('users');
    return collection.findOne({
        _id: Buffer.from(id, "base64url")
    });
}

export async function updateUser(id, key, verificationJSON, passKey) {
    console.log("saving user")
    await client.connect();
    console.log('Connected successfully to server');
    const db = client.db(dbName);
    const collection = db.collection('users');

    return collection.updateOne({
        _id: id
    }, {
        $set: {
            verificationJSON,
            key,
            passKey
        }
    });

}


export async function updateOptionsForUser(id, options) {
    console.log("saving user")
    await client.connect();
    console.log('Connected successfully to server');
    const db = client.db(dbName);
    const collection = db.collection('users');

    return collection.updateOne({
        _id: id
    }, {
        $set: {
            options
        }
    });

}