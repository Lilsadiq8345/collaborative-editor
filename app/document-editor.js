// app/document-editor.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { io } from 'socket.io-client';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import the Quill styles

// Socket.IO client setup
const socket = io('http://localhost:3000'); // Ensure this matches your server URL

export default function DocumentEditor() {
    const router = useRouter();
    const { docId } = router.query; // Assuming the document ID is passed in the URL

    const [documentContent, setDocumentContent] = useState('');
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!docId) return;

        // Fetch document content from MongoDB when the document ID is available
        const fetchDocument = async () => {
            const response = await fetch(`/api/document/${docId}`);
            const data = await response.json();
            setDocumentContent(data.content);
        };

        fetchDocument();

        // Set up the socket connection to listen for document changes
        socket.on('document-change', (newContent) => {
            setDocumentContent(newContent);
        });

        return () => {
            socket.off('document-change');
        };
    }, [docId]);

    // Handle content changes in the editor
    const handleEditorChange = (content) => {
        setDocumentContent(content);
        socket.emit('edit-document', docId, content); // Broadcast change to other users
    };

    return (
        <div>
            <h1>Collaborative Document Editor</h1>
            <div>
                {isConnected ? (
                    <ReactQuill value={documentContent} onChange={handleEditorChange} />
                ) : (
                    <p>Connecting...</p>
                )}
            </div>
        </div>
    );
}
