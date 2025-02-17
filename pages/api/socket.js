import { Server } from 'socket.io';
import { connectToMongo } from '../../lib/mongodb';
import { getSession } from 'next-auth/react';

let io;
let changeStream;

export default async function handler(req, res) {
    if (!res.socket.server.io) {
        io = new Server(res.socket.server);
        res.socket.server.io = io;

        // Connect to MongoDB
        const db = await connectToMongo();
        const collection = db.collection("documents");

        // Watch for changes in MongoDB
        changeStream = collection.watch();
        changeStream.on('change', (change) => {
            io.emit('document-change', change.fullDocument);
        });

        io.on('connection', (socket) => {
            console.log('A user connected');

            socket.on('join-document', async (docId) => {
                socket.join(docId);
                const document = await collection.findOne({ _id: docId });
                socket.emit('load-document', document?.content || '');
            });

            socket.on('edit-document', async (docId, content) => {
                const session = await getSession({ req });
                if (!session) {
                    socket.emit('unauthorized');
                    return;
                }

                await collection.updateOne({ _id: docId }, { $set: { content } });
                io.to(docId).emit('document-change', content);
            });

            socket.on('disconnect', () => {
                console.log('User disconnected');
            });
        });
    }

    res.end();
}
