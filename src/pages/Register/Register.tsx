import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../../api/userApi';
import type { CreateUserRequest } from '../../types/user.types';

const Register = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState<CreateUserRequest>({
        email: '',
        fullName: '',
        password: '',
    });

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
            // Registro exitoso — redirige al login
            navigate('/login');
        } catch (err: any) {
            // El backend devuelve ErrorResponse con message y details
            const backendError = err.response?.data;
            if (backendError?.details?.length > 0) {
                setError(backendError.details.join(' | '));
            } else {
                setError(backendError?.message ?? 'Error al registrar usuario');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Crear cuenta</h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nombre completo</label>
                    <input
                        name="fullName"
                        type="text"
                        value={form.fullName}
                        onChange={handleChange}
                        placeholder="Juan Torres"
                    />
                </div>

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
                        placeholder="Mínimo 8 caracteres"
                    />
                </div>

                {/* Muestra errores del backend directamente */}
                {error && <p style={{ color: 'red' }}>{error}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? 'Registrando...' : 'Crear cuenta'}
                </button>
            </form>

            <p>
                ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
            </p>
        </div>
    );
};

export default Register;