import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEmailById } from '../../api/emailApi';
import type { EmailDetail } from '../../api/emailApi';

const EmailView = () => {
    const { emailId } = useParams<{ emailId: string }>();
    const navigate = useNavigate();
    const [email, setEmail] = useState<EmailDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!emailId) return;
        getEmailById(emailId)
            .then(setEmail)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [emailId]);

    if (loading) return <p>Cargando correo...</p>;
    if (!email) return <p>Correo no encontrado.</p>;

    return (
        <div style={{ padding: '20px' }}>
            <button onClick={() => navigate('/inbox')}>← Volver</button>

            <h2>{email.subject}</h2>
            <p><strong>De:</strong> {email.senderName}</p>
            <p><strong>Fecha:</strong> {new Date(email.sentAt).toLocaleString()}</p>
            <hr />
            <p style={{ whiteSpace: 'pre-wrap' }}>{email.body}</p>
        </div>
    );
};

export default EmailView;