import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { getEmailById } from '../../api/emailApi';
import type { EmailDetail } from '../../api/emailApi';
import styles from './EmailView.module.css';

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

    const getInitials = (name: string) =>
        name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    if (loading) return (
        <div className={styles.loading}>
            <FontAwesomeIcon icon={faSpinner} className={styles.spinner} />
            Cargando correo...
        </div>
    );

    if (!email) return (
        <div className={styles.loading}>Correo no encontrado.</div>
    );

    return (
        <div className={styles.wrapper}>
            <div className={styles.topbar}>
                <button className={styles.backBtn} onClick={() => navigate('/inbox')}>
                    <FontAwesomeIcon icon={faArrowLeft} />
                    Volver al inbox
                </button>
            </div>

            <div className={styles.content}>
                <h1 className={styles.subject}>{email.subject}</h1>

                <div className={styles.meta}>
                    <div className={styles.senderAvatar}>
                        {getInitials(email.senderName || 'U')}
                    </div>
                    <div className={styles.senderInfo}>
                        <div className={styles.senderName}>{email.senderName}</div>
                        <div className={styles.senderDate}>
                            {new Date(email.sentAt).toLocaleString('es-CO', {
                                weekday: 'long', year: 'numeric',
                                month: 'long', day: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                            })}
                        </div>
                    </div>
                </div>

                <hr className={styles.divider} />
                <p className={styles.body}>{email.body}</p>
            </div>
        </div>
    );
};

export default EmailView;