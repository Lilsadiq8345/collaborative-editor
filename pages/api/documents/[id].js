import { connectToMongo } from '../../../lib/mongodb';

export default async function handler(req, res) {
    const { id } = req.query;
    const db = await connectToMongo();
    const document = await db.collection("documents").findOne({ _id: id });

    if (!document) {
        return res.status(404).json({ message: "Document not found" });
    }

    res.json(document);
}
