import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPaperPlane, faInbox, faStar, faPaperPlane as faSent,
    faFile, faTrash, faSignOut, faPen, faSpinner,
    faTrashCan, faStar as faStarSolid, faEnvelopeOpen
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { getInbox, markAsRead, toggleStar, moveToTrash } from '../../api/emailApi';
import type { InboxItem } from '../../api/emailApi';
import ComposeModal from '../../components/mail/ComposeModal';
import styles from './Inbox.module.css';

const Inbox = () => {
    const { currentUser, logout, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [emails, setEmails] = useState<InboxItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCompose, setShowCompose] = useState(false);

    useEffect(() => {
        if (authLoading || !currentUser) return;
        setLoading(true);
        getInbox(currentUser.idUser)
            .then(setEmails)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [currentUser, authLoading]);

    const handleMarkAsRead = async (recipientId: string) => {
        await markAsRead(recipientId);
        setEmails(prev => prev.map(e =>
            e.idRecipient === recipientId ? { ...e, isRead: true } : e
        ));
    };

    const handleToggleStar = async (e: React.MouseEvent, recipientId: string) => {
        e.stopPropagation();
        await toggleStar(recipientId);
        setEmails(prev => prev.map(e =>
            e.idRecipient === recipientId ? { ...e, isStarred: !e.isStarred } : e
        ));
    };

    const handleMoveToTrash = async (e: React.MouseEvent, recipientId: string) => {
        e.stopPropagation();
        await moveToTrash(recipientId);
        setEmails(prev => prev.filter(e => e.idRecipient !== recipientId));
    };

    const handleLogout = () => { logout(); navigate('/login'); };

    const unreadCount = emails.filter(e => !e.isRead).length;
    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' });
    };

    return (
        <div className={styles.layout}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarLogo}>
                    <div className={styles.sidebarLogoIcon}>
                        <FontAwesomeIcon icon={faPaperPlane} />
                    </div>
                    <span className={styles.sidebarLogoText}>jtmail</span>
                </div>

                <button className={styles.composeBtn} onClick={() => setShowCompose(true)}>
                    <FontAwesomeIcon icon={faPen} />
                    Redactar
                </button>

                <nav className={styles.nav}>
                    <button className={`${styles.navItem} ${styles.navItemActive}`}>
                        <FontAwesomeIcon icon={faInbox} /> Bandeja
                    </button>
                    <button className={styles.navItem}>
                        <FontAwesomeIcon icon={faStarSolid} /> Destacados
                    </button>
                    <button className={styles.navItem}>
                        <FontAwesomeIcon icon={faSent} /> Enviados
                    </button>
                    <button className={styles.navItem}>
                        <FontAwesomeIcon icon={faFile} /> Borradores
                    </button>
                    <button className={styles.navItem}>
                        <FontAwesomeIcon icon={faTrash} /> Papelera
                    </button>
                </nav>

                <div className={styles.sidebarFooter}>
                    <div className={styles.userInfo}>
                        <div className={styles.avatar}>
                            {currentUser?.fullName ? getInitials(currentUser.fullName) : 'U'}
                        </div>
                        <span className={styles.userEmail}>{currentUser?.email}</span>
                    </div>
                    <button className={styles.logoutBtn} onClick={handleLogout}>
                        <FontAwesomeIcon icon={faSignOut} /> Cerrar sesión
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className={styles.main}>
                <div className={styles.toolbar}>
                    <div>
                        <span className={styles.toolbarTitle}>Bandeja de entrada</span>
                        {unreadCount > 0 && (
                            <span className={styles.unreadBadge}>{unreadCount} nuevos</span>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className={styles.loadingState}>
                        <FontAwesomeIcon icon={faSpinner} className={styles.spinner} />
                        Cargando correos...
                    </div>
                ) : emails.length === 0 ? (
                    <div className={styles.emptyState}>
                        <FontAwesomeIcon icon={faEnvelopeOpen} />
                        <p>Tu bandeja está vacía</p>
                    </div>
                ) : (
                    <ul className={styles.emailList}>
                        {emails.map(email => (
                            <li
                                key={email.idRecipient}
                                className={`${styles.emailItem} ${!email.isRead ? styles.emailUnread : ''}`}
                                onClick={() => {
                                    handleMarkAsRead(email.idRecipient);
                                    navigate(`/email/${email.emailId}`);
                                }}
                            >
                                {!email.isRead && <div className={styles.unreadDot} />}
                                <div className={styles.emailAvatar}>
                                    {getInitials(email.senderName || 'U')}
                                </div>
                                <div className={styles.emailContent}>
                                    <div className={styles.emailMeta}>
                                        <span className={styles.emailSender}>{email.senderName}</span>
                                        <span className={styles.emailDate}>
                                            {email.sentAt ? formatDate(email.sentAt) : ''}
                                        </span>
                                    </div>
                                    <div className={styles.emailSubject}>{email.subject}</div>
                                </div>
                                <div className={styles.emailActions}>
                                    <button
                                        className={`${styles.actionBtn} ${email.isStarred ? styles.starActive : ''}`}
                                        onClick={(e) => handleToggleStar(e, email.idRecipient)}
                                        title="Destacar"
                                    >
                                        <FontAwesomeIcon icon={faStar} />
                                    </button>
                                    <button
                                        className={styles.actionBtn}
                                        onClick={(e) => handleMoveToTrash(e, email.idRecipient)}
                                        title="Eliminar"
                                    >
                                        <FontAwesomeIcon icon={faTrashCan} />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </main>

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