import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTheme } from '../../context/ThemeContext';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import {
    faPaperPlane,
    faInbox,
    faStar,
    faFile,
    faTrash,
    faSignOut,
    faPen,
    faSpinner,
    faTrashCan,
    faStar as faStarSolid,
    faEnvelopeOpen
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { getInbox, getStarred, getTrash, getDrafts, markAsRead, toggleStar, moveToTrash } from '../../api/emailApi';
import type { InboxItem, EmailDetail } from '../../api/emailApi';
import ComposeModal from '../../components/mail/ComposeModal';
import styles from './Inbox.module.css';

// Secciones disponibles en el sidebar
type Section = 'inbox' | 'starred' | 'trash' | 'drafts';

const Inbox = () => {
    const { currentUser, logout, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [emails, setEmails] = useState<InboxItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCompose, setShowCompose] = useState(false);
    const [section, setSection] = useState<Section>('inbox');

    useEffect(() => {
        if (authLoading || !currentUser) return;

        setLoading(true);
        setEmails([]); // limpia la lista al cambiar de sección

        // Cada sección llama a su propio endpoint
        // Drafts adapta EmailDetail al shape de InboxItem para reutilizar el mismo listado
        const fetchers: Record<Section, () => Promise<InboxItem[]>> = {
            inbox: () => getInbox(currentUser.idUser),
            starred: () => getStarred(currentUser.idUser),
            trash: () => getTrash(currentUser.idUser),
            drafts: () => getDrafts(currentUser.idUser).then((drafts: EmailDetail[]) =>
                drafts.map(d => ({
                    idRecipient: d.idEmail,
                    emailId: d.idEmail,
                    subject: d.subject,
                    senderName: currentUser.fullName,
                    senderEmail: currentUser.email,
                    isRead: true,
                    isStarred: false,
                    isArchived: false,
                    isTrashed: false,
                    sentAt: d.createdAt,
                }))
            ),
        };

        fetchers[section]()
            .then(setEmails)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [currentUser, authLoading, section]); // ← section como dependencia

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

    const getInitials = (name: string) =>
        name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' });
    };

    const titles: Record<Section, string> = {
        inbox: 'Bandeja de entrada',
        starred: 'Destacados',
        trash: 'Papelera',
        drafts: 'Borradores',
    };

    const navItems = [
        { key: 'inbox' as Section, icon: faInbox, label: 'Bandeja' },
        { key: 'starred' as Section, icon: faStarSolid, label: 'Destacados' },
        { key: 'drafts' as Section, icon: faFile, label: 'Borradores' },
        { key: 'trash' as Section, icon: faTrash, label: 'Papelera' },
    ];

    const { theme, toggleTheme } = useTheme();

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
                    {navItems.map(({ key, icon, label }) => (
                        <button
                            key={key}
                            className={`${styles.navItem} ${section === key ? styles.navItemActive : ''}`}
                            onClick={() => setSection(key)}
                        >
                            <FontAwesomeIcon icon={icon} /> {label}
                        </button>
                    ))}
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
                        <span className={styles.toolbarTitle}>{titles[section]}</span>
                        {section === 'inbox' && unreadCount > 0 && (
                            <span className={styles.unreadBadge}>{unreadCount} nuevos</span>
                        )}
                    </div>
                    <button
                        onClick={toggleTheme}
                        className={styles.themeBtn}
                        title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
                    >
                        <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} />
                    </button>
                </div>

                {loading ? (
                    <div className={styles.loadingState}>
                        <FontAwesomeIcon icon={faSpinner} className={styles.spinner} />
                        Cargando correos...
                    </div>
                ) : emails.length === 0 ? (
                    <div className={styles.emptyState}>
                        <FontAwesomeIcon icon={faEnvelopeOpen} />
                        <p>No hay correos en esta sección</p>
                    </div>
                ) : (
                    <ul className={styles.emailList}>
                        {emails.map(email => (
                            <li
                                key={email.idRecipient}
                                className={`${styles.emailItem} ${!email.isRead ? styles.emailUnread : ''}`}
                                onClick={() => {
                                    if (section !== 'drafts') {
                                        handleMarkAsRead(email.idRecipient);
                                    }
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
                                    {/* Star solo en inbox y starred */}
                                    {(section === 'inbox' || section === 'starred') && (
                                        <button
                                            className={`${styles.actionBtn} ${email.isStarred ? styles.starActive : ''}`}
                                            onClick={(e) => handleToggleStar(e, email.idRecipient)}
                                            title="Destacar"
                                        >
                                            <FontAwesomeIcon icon={faStar} />
                                        </button>
                                    )}
                                    {/* Trash solo en inbox y starred */}
                                    {(section === 'inbox' || section === 'starred') && (
                                        <button
                                            className={styles.actionBtn}
                                            onClick={(e) => handleMoveToTrash(e, email.idRecipient)}
                                            title="Eliminar"
                                        >
                                            <FontAwesomeIcon icon={faTrashCan} />
                                        </button>
                                    )}
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