import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { io } from 'socket.io-client';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useSession, signIn } from 'next-auth/react';

// Connect to WebSocket server
const socket = io('http://localhost:3000');

export default function DocumentEditor() {
    const { data: session } = useSession();
    const router = useRouter();
    const { id: docId } = router.query;

    const [documentContent, setDocumentContent] = useState('');

    useEffect(() => {
        if (!session) {
            signIn();
            return;
        }

        if (!docId) return;

        socket.emit('join-document', docId);

        socket.on('load-document', (content) => {
            setDocumentContent(content);
        });

        socket.on('document-change', (newContent) => {
            setDocumentContent(newContent);
        });

        return () => {
            socket.off('load-document');
            socket.off('document-change');
        };
    }, [docId, session]);

    const handleEditorChange = (content) => {
        setDocumentContent(content);
        socket.emit('edit-document', docId, content);
    };

    return (
        <div>
            <h1>Real-Time Collaborative Editor</h1>
            <ReactQuill value={documentContent} onChange={handleEditorChange} />
        </div>
    );
}
