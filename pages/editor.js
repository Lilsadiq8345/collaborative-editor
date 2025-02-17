import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import io from 'socket.io-client';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const socket = io();

export default function Editor({ docId }) {
    const { data: session } = useSession();
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        socket.on('document-change', (doc) => {
            if (doc.docId === docId) {
                setContent(doc.content);
            }
        });

        const fetchDocument = async () => {
            const res = await fetch(`/api/documents/${docId}`);
            const document = await res.json();
            setContent(document.content);
            setLoading(false);
        };

        fetchDocument();

        return () => {
            socket.off('document-change');
        };
    }, [docId]);

    const handleChange = (value) => {
        setContent(value);
        socket.emit('edit-document', docId, value);
    };

    const saveDocument = async () => {
        const res = await fetch(`/api/documents/${docId}`, {
            method: 'PUT',
            body: JSON.stringify({ content }),
        });
        await res.json();
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h1>Document Editor</h1>
            <ReactQuill value={content} onChange={handleChange} />
            <button onClick={saveDocument}>Save</button>
        </div>
    );
}
