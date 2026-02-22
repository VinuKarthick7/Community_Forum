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
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            {/* Left branding panel */}
            <div style={styles.brand}>
                <div style={styles.brandInner}>
                    <div style={styles.brandLogo}>
                        <span style={styles.brandIcon}>⚡</span>
                        <span style={styles.brandName}>IPS Forum</span>
                    </div>
                    <h2 style={styles.brandTagline}>
                        Your college community,<br />all in one place.
                    </h2>
                    <p style={styles.brandDesc}>
                        Connect with classmates, share knowledge, discuss projects,
                        and stay updated on campus opportunities.
                    </p>
                    <div style={styles.brandPills}>
                        {['💻 Programming', '🚀 Projects', '💼 Internships', '🎯 Placements', '🏆 Hackathons'].map((t) => (
                            <span key={t} style={styles.brandPill}>{t}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right form panel */}
            <div style={styles.formPanel}>
                <div style={styles.formCard}>
                    <h1 style={styles.title}>Sign in</h1>
                    <p style={styles.sub}>
                        New to IPS Forum? <Link to="/register" style={styles.link}>Create an account</Link>
                    </p>

                    {error && <div className="alert alert-error">{error}</div>}

                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div className="form-group">
                            <label>Email address</label>
                            <input name="email" type="email" placeholder="you@college.edu" value={form.email} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input name="password" type="password" placeholder="Enter your password" value={form.password} onChange={handleChange} required />
                        </div>
                        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.72rem 1.2rem' }} disabled={loading}>
                            {loading ? 'Signing in…' : 'Sign in'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

const styles = {
    page: { minHeight: '100vh', display: 'flex', background: 'var(--bg-base)' },
    brand: {
        flex: '0 0 45%',
        background: 'linear-gradient(145deg, #0A66C2 0%, #004182 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '3rem',
    },
    brandInner: { maxWidth: 400 },
    brandLogo: { display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2.5rem' },
    brandIcon: { fontSize: '2rem' },
    brandName: { fontWeight: 800, fontSize: '1.5rem', color: '#fff' },
    brandTagline: { fontSize: '2rem', fontWeight: 800, color: '#fff', lineHeight: 1.25, marginBottom: '1rem' },
    brandDesc: { fontSize: '0.98rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, marginBottom: '2rem' },
    brandPills: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
    brandPill: {
        padding: '0.35rem 0.75rem', borderRadius: 999,
        background: 'rgba(255,255,255,0.15)', color: '#fff',
        fontSize: '0.82rem', fontWeight: 500, backdropFilter: 'blur(4px)',
        border: '1px solid rgba(255,255,255,0.2)',
    },
    formPanel: {
        flex: 1, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '2rem',
    },
    formCard: { width: '100%', maxWidth: 400 },
    title: { fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.35rem', color: 'var(--text-primary)' },
    sub: { color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem' },
    form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    link: { color: 'var(--accent)', fontWeight: 600 },
};
