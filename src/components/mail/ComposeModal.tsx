import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { sendEmail } from '../../api/emailApi';
import type { EmailDetail } from '../../api/emailApi';

interface Props {
    onClose: () => void;
    onSent: (email: EmailDetail) => void;
    replyThreadId?: string;
}

const ComposeModal = ({ onClose, onSent, replyThreadId }: Props) => {
    const { currentUser } = useAuth();
    const [form, setForm] = useState({ to: '', subject: '', body: '' });
    const [error, setError] = useState<string | null>(null);
    const [sending, setSending] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSend = async () => {
        if (!form.to.trim() || !form.subject.trim() || !form.body.trim()) {
            setError('Todos los campos son requeridos.');
            return;
        }

        if (!currentUser) return;

        setSending(true);
        setError(null);

        try {
            const result = await sendEmail(currentUser.idUser, {
                to: [form.to],
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
            position: 'fixed', bottom: 20, right: 20,
            background: 'white', border: '1px solid #ccc',
            padding: '20px', width: '400px', zIndex: 1000
        }}>
            <div>
                <strong>Nuevo correo</strong>
                <button onClick={onClose} style={{ float: 'right' }}>✕</button>
            </div>

            <div>
                <input
                    name="to"
                    placeholder="ID del destinatario"
                    value={form.to}
                    onChange={handleChange}
                    style={{ width: '100%', marginTop: '8px' }}
                />
                <input
                    name="subject"
                    placeholder="Asunto"
                    value={form.subject}
                    onChange={handleChange}
                    style={{ width: '100%', marginTop: '8px' }}
                />
                <textarea
                    name="body"
                    placeholder="Escribe tu mensaje..."
                    value={form.body}
                    onChange={handleChange}
                    rows={6}
                    style={{ width: '100%', marginTop: '8px' }}
                />
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <button onClick={handleSend} disabled={sending}>
                {sending ? 'Enviando...' : 'Enviar'}
            </button>
        </div>
    );
};

export default ComposeModal;