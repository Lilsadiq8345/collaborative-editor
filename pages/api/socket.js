import { Server } from 'socket.io';
import { MongoClient } from 'mongodb';
import { getSession } from 'next-auth/react';

let io;

const connectToMongo = async () => {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    return client.db();
};

export const config = {
    api: {
        bodyParser: false,
        externalResolver: true,
    },
};

export default async (req, res) => {
    if (!io) {
        const server = res.socket.server;
        io = new Server(server);

        io.on('connection', (socket) => {
            console.log('A user connected');

            // Listen for document edit requests
            socket.on('edit-document', async (docId, content) => {
                const session = await getSession({ req });
                if (!session) {
                    socket.emit('unauthorized');
                    return;
                }

                // Connect to MongoDB and update the document
                const db = await connectToMongo();
                const collection = db.collection('documents');
                await collection.updateOne({ _id: docId }, { $set: { content } });

                // Broadcast the updated content to other users
                io.emit('document-change', content);
            });
        });
    }

    return res.status(200).json({ message: 'Socket.IO Server is running' });
};
