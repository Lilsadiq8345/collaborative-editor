import { connectToMongo } from '../../lib/mongo';
import { cacheDocument } from '../../lib/redis';

export default async function handler(req, res) {
    const { id } = req.query;
    const db = await connectToMongo();
    const collection = db.collection('documents');

    if (req.method === 'GET') {
        const document = await collection.findOne({ _id: id });
        if (document) {
            return res.json(document);
        }
        return res.status(404).json({ message: 'Document not found' });
    }

    if (req.method === 'PUT') {
        const { content } = req.body;
        await collection.updateOne({ _id: id }, { $set: { content } });
        await cacheDocument(id, content); // Cache the document after saving
        return res.status(200).json({ message: 'Document updated' });
    }
}
