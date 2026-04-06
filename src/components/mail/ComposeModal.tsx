import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPaperPlane, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { sendEmail } from '../../api/emailApi';
import { getAllUsers } from '../../api/userApi';
import type { EmailDetail } from '../../api/emailApi';
import type { UserResponse } from '../../types/user.types';

interface Props {
    onClose: () => void;
    onSent: (email: EmailDetail) => void;
    replyThreadId?: string;
}

const ComposeModal = ({ onClose, onSent, replyThreadId }: Props) => {
    const { currentUser } = useAuth();
    const [form, setForm] = useState({ toEmail: '', subject: '', body: '' });
    const [error, setError] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const [suggestions, setSuggestions] = useState<UserResponse[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // Busca usuarios mientras el usuario escribe el email
    const handleToChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setForm(prev => ({ ...prev, toEmail: value }));
        setSelectedUser(null); // resetea selección si edita manualmente

        if (value.length >= 2) {
            try {
                const users = await getAllUsers();
                setSuggestions(
                    users.filter(u =>
                        u.email.toLowerCase().includes(value.toLowerCase()) &&
                        u.idUser !== currentUser?.idUser // excluye al remitente
                    )
                );
            } catch {
                setSuggestions([]);
            }
        } else {
            setSuggestions([]);
        }
    };

    const handleSelectUser = (user: UserResponse) => {
        setSelectedUser(user);
        setForm(prev => ({ ...prev, toEmail: user.email }));
        setSuggestions([]);
    };

    const handleSend = async () => {
        if (!form.toEmail.trim() || !form.subject.trim() || !form.body.trim()) {
            setError('Todos los campos son requeridos.');
            return;
        }
        if (!currentUser) return;

        // Resuelve el UUID del destinatario desde el email ingresado
        let recipientId = selectedUser?.idUser;
        if (!recipientId) {
            try {
                const users = await getAllUsers();
                const found = users.find(u => u.email === form.toEmail);
                if (!found) { setError('No existe un usuario con ese email.'); return; }
                recipientId = found.idUser;
            } catch {
                setError('Error buscando el destinatario.');
                return;
            }
        }

        setSending(true);
        setError(null);

        try {
            const result = await sendEmail(currentUser.idUser, {
                to: [recipientId],
                subject: form.subject,
                body: form.body,
                threadId: replyThreadId ?? null,
            });
            onSent(result);
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message ?? 'Error al enviar el correo');
        } finally {
            setSending(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', bottom: 24, right: 24,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            width: 440, zIndex: 1000,
            boxShadow: 'var(--shadow-md)',
            overflow: 'visible'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 18px',
                background: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0'
            }}>
                <span style={{
                    fontFamily: 'var(--font-display)', fontSize: 14,
                    fontWeight: 700, color: 'var(--text-primary)'
                }}>
                    Nuevo correo
                </span>
                <button onClick={onClose} style={{
                    background: 'transparent', color: 'var(--text-muted)',
                    fontSize: 14, padding: 4, borderRadius: 4,
                    transition: 'color 180ms ease', border: 'none', cursor: 'pointer'
                }}>
                    <FontAwesomeIcon icon={faTimes} />
                </button>
            </div>

            {/* Campos */}
            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>

                {/* Campo To con autocompletado */}
                <div style={{ position: 'relative' }}>
                    <input
                        name="toEmail"
                        placeholder="Para (email del destinatario)"
                        value={form.toEmail}
                        onChange={handleToChange}
                        style={inputStyle}
                    />
                    {suggestions.length > 0 && (
                        <div style={{
                            position: 'absolute', top: '100%', left: 0, right: 0,
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)',
                            zIndex: 100, marginTop: 4,
                            boxShadow: 'var(--shadow-md)'
                        }}>
                            {suggestions.map(u => (
                                <div
                                    key={u.idUser}
                                    onClick={() => handleSelectUser(u)}
                                    style={{
                                        padding: '9px 14px', cursor: 'pointer',
                                        fontSize: 13, color: 'var(--text-secondary)',
                                        transition: 'background 180ms'
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <strong style={{ color: 'var(--text-primary)' }}>{u.fullName}</strong>
                                    {' — '}{u.email}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <input
                    name="subject"
                    placeholder="Asunto"
                    value={form.subject}
                    onChange={handleChange}
                    style={inputStyle}
                />

                <textarea
                    name="body"
                    placeholder="Escribe tu mensaje..."
                    value={form.body}
                    onChange={handleChange}
                    rows={7}
                    style={{ ...inputStyle, resize: 'vertical' }}
                />

                {error && (
                    <p style={{ color: 'var(--error)', fontSize: 13, margin: 0 }}>{error}</p>
                )}

                <button
                    onClick={handleSend}
                    disabled={sending}
                    style={{
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: 8,
                        padding: '10px 20px',
                        background: 'var(--accent)', color: '#0a0a0f',
                        fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700,
                        borderRadius: 'var(--radius-md)', border: 'none',
                        opacity: sending ? 0.7 : 1,
                        cursor: sending ? 'not-allowed' : 'pointer',
                        transition: 'all 180ms ease'
                    }}
                >
                    <FontAwesomeIcon icon={sending ? faSpinner : faPaperPlane} spin={sending} />
                    {sending ? 'Enviando...' : 'Enviar'}
                </button>
            </div>
        </div>
    );
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    fontSize: 13,
    padding: '9px 12px',
    fontFamily: 'var(--font-body)',
    boxSizing: 'border-box',
    outline: 'none'
};

export default ComposeModal;