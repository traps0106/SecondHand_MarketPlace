
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import dns from 'node:dns';

dotenv.config();

// Use Google's public DNS
dns.setServers(['8.8.8.8', '8.8.4.4']);

const client = new MongoClient(process.env.MONGO_URI);

let db;

export async function connectDB() {
    try {
        await client.connect();

        db = client.db(process.env.DB_NAME);

        console.log('MongoDB connected successfully yoooooooo');

        return db;
    } catch (error) {
        console.error('MongoDB connection failed:', error);
        throw error;
    }
}

export function getDB() {
    if (!db) {
        throw new Error('Database is not connected');
    }

    return db;
}
