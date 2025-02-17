import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGO_URI);
let db;

export async function connectToMongo() {
    if (!db) {
        await client.connect();
        db = client.db("collaborative_editor");
    }
    return db;
}
