import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faTriangleExclamation, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { loginUser } from '../../api/authApi';
import { saveToken } from '../../utils/auth';
import styles from './Login.module.css';

const Login = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
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
            const { token } = await loginUser(form);
            saveToken(token);
            navigate('/inbox');
        } catch (err: any) {
            setError(err.response?.data?.message ?? 'Email o contraseña incorrectos');
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

                <h1 className={styles.title}>Bienvenido</h1>
                <p className={styles.subtitle}>Inicia sesión en tu cuenta</p>

                <form className={styles.form} onSubmit={handleSubmit}>
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
                                placeholder="••••••••"
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
                        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                    </button>
                </form>

                <p className={styles.footer}>
                    ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;