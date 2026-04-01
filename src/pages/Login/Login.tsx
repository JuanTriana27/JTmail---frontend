import { useState } from 'react';
import { Link } from 'react-router-dom';

// Por ahora solo UI — la conexión real va cuando JWT esté listo en el backend
const Login = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [message, setMessage] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Placeholder hasta que el endpoint /auth/login exista
        setMessage('Login pendiente — JWT en construcción');
    };

    return (
        <div>
            <h2>Iniciar sesión</h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email</label>
                    <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="juan@jtmail.co"
                    />
                </div>

                <div>
                    <label>Contraseña</label>
                    <input
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                    />
                </div>

                {message && <p style={{ color: 'orange' }}>{message}</p>}

                <button type="submit">Entrar</button>
            </form>

            <p>
                ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
            </p>
        </div>
    );
};

export default Login;