import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            const { data } = await api.post('/auth/login', form);
            login(data);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={styles.logoWrap}>
                    <span style={styles.logoIcon}>⚡</span>
                    <h1 style={styles.title}>Welcome back</h1>
                    <p style={styles.sub}>Login to IPS Tech Forum</p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div className="form-group">
                        <label>Email</label>
                        <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                        {loading ? 'Logging in…' : 'Login →'}
                    </button>
                </form>

                <p style={styles.footer}>
                    Don't have an account? <Link to="/register" style={styles.link}>Sign up</Link>
                </p>
            </div>
        </div>
    );
}

const styles = {
    page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' },
    card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2.5rem', width: '100%', maxWidth: 420, boxShadow: 'var(--shadow)' },
    logoWrap: { textAlign: 'center', marginBottom: '2rem' },
    logoIcon: { fontSize: '2.5rem' },
    title: { fontSize: '1.5rem', fontWeight: 800, marginTop: '0.5rem' },
    sub: { color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' },
    form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    footer: { textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)' },
    link: { color: 'var(--accent-hover)', fontWeight: 600 },
};
