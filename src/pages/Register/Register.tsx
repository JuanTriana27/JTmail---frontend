import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faUser, faTriangleExclamation, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { registerUser } from '../../api/userApi';
import type { CreateUserRequest } from '../../types/user.types';
import styles from './Register.module.css';

const Register = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState<CreateUserRequest>({ email: '', fullName: '', password: '' });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await registerUser(form);
            navigate('/login');
        } catch (err: any) {
            const backendError = err.response?.data;
            if (backendError?.details?.length > 0) {
                setError(backendError.details.join(' · '));
            } else {
                setError(backendError?.message ?? 'Error al registrar usuario');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.card}>
                <div className={styles.logo}>
                    <div className={styles.logoIcon}>
                        <FontAwesomeIcon icon={faPaperPlane} />
                    </div>
                    <span className={styles.logoText}>jtmail</span>
                </div>

                <h1 className={styles.title}>Crear cuenta</h1>
                <p className={styles.subtitle}>Únete a jtmail hoy</p>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.field}>
                        <label className={styles.label}>Nombre completo</label>
                        <div className={styles.inputWrapper}>
                            <input
                                className={styles.input}
                                name="fullName"
                                type="text"
                                value={form.fullName}
                                onChange={handleChange}
                                placeholder="Juan Torres"
                            />
                            <FontAwesomeIcon icon={faUser} className={styles.inputIcon} />
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Email</label>
                        <div className={styles.inputWrapper}>
                            <input
                                className={styles.input}
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="juan@jtmail.co"
                            />
                            <FontAwesomeIcon icon={faEnvelope} className={styles.inputIcon} />
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Contraseña</label>
                        <div className={styles.inputWrapper}>
                            <input
                                className={styles.input}
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Mínimo 8 caracteres"
                            />
                            <FontAwesomeIcon icon={faLock} className={styles.inputIcon} />
                        </div>
                    </div>

                    {error && (
                        <div className={styles.error}>
                            <FontAwesomeIcon icon={faTriangleExclamation} />
                            {error}
                        </div>
                    )}

                    <button className={styles.submitBtn} type="submit" disabled={loading}>
                        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                    </button>
                </form>

                <p className={styles.footer}>
                    ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;