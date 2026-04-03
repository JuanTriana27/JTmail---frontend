import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInbox, markAsRead, toggleStar, moveToTrash } from '../../api/emailApi';
import type { InboxItem } from '../../api/emailApi';
import ComposeModal from '../../components/mail/ComposeModal';

const Inbox = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [emails, setEmails] = useState<InboxItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCompose, setShowCompose] = useState(false);

    useEffect(() => {
        if (!currentUser) return;

        getInbox(currentUser.idUser)
            .then(setEmails)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [currentUser]);

    const handleMarkAsRead = async (recipientId: string) => {
        await markAsRead(recipientId);
        setEmails(prev =>
            prev.map(e => e.idRecipient === recipientId ? { ...e, isRead: true } : e)
        );
    };

    const handleToggleStar = async (recipientId: string) => {
        await toggleStar(recipientId);
        setEmails(prev =>
            prev.map(e => e.idRecipient === recipientId ? { ...e, isStarred: !e.isStarred } : e)
        );
    };

    const handleMoveToTrash = async (recipientId: string) => {
        await moveToTrash(recipientId);
        setEmails(prev => prev.filter(e => e.idRecipient !== recipientId));
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) return <p>Cargando correos...</p>;

    return (
        <div>
            <div>
                <h2>Inbox — {currentUser?.email}</h2>
                <button onClick={() => setShowCompose(true)}>Redactar</button>
                <button onClick={handleLogout}>Cerrar sesión</button>
            </div>

            {emails.length === 0 && <p>No hay correos en la bandeja.</p>}

            <ul style={{ listStyle: 'none', padding: 0 }}>
                {emails.map(email => (
                    <li
                        key={email.idRecipient}
                        style={{
                            padding: '10px',
                            borderBottom: '1px solid #ccc',
                            fontWeight: email.isRead ? 'normal' : 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        <span onClick={() => {
                            handleMarkAsRead(email.idRecipient);
                            navigate(`/email/${email.emailId}`);
                        }}>
                            {email.senderName} — {email.subject}
                        </span>

                        <span style={{ marginLeft: '10px', color: email.isStarred ? 'gold' : 'gray' }}
                            onClick={() => handleToggleStar(email.idRecipient)}>
                            ★
                        </span>

                        <button
                            style={{ marginLeft: '10px' }}
                            onClick={() => handleMoveToTrash(email.idRecipient)}>
                            🗑
                        </button>
                    </li>
                ))}
            </ul>

            {showCompose && (
                <ComposeModal
                    onClose={() => setShowCompose(false)}
                    onSent={(newEmail: any) => console.log('Enviado:', newEmail)}
                />
            )}
        </div>
    );
};

export default Inbox;