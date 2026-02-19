import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirm) return setError('Passwords do not match');
        if (form.password.length < 6) return setError('Password must be at least 6 characters');
        setLoading(true);
        try {
            const { data } = await api.post('/auth/register', {
                name: form.name, email: form.email, password: form.password,
            });
            login(data);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={styles.logoWrap}>
                    <span style={styles.logoIcon}>⚡</span>
                    <h1 style={styles.title}>Join the community</h1>
                    <p style={styles.sub}>Create your IPS Tech Forum account</p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input name="name" placeholder="Rahul Sharma" value={form.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input name="email" type="email" placeholder="you@college.edu" value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input name="password" type="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input name="confirm" type="password" placeholder="Re-enter password" value={form.confirm} onChange={handleChange} required />
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                        {loading ? 'Creating account…' : 'Create Account →'}
                    </button>
                </form>

                <p style={styles.footer}>
                    Already have an account? <Link to="/login" style={styles.link}>Login</Link>
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
