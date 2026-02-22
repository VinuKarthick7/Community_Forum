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
            {/* Left branding panel */}
            <div style={styles.brand}>
                <div style={styles.brandInner}>
                    <div style={styles.brandLogo}>
                        <img src="/ips-logo.png" alt="IPS" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }} />
                        <span style={styles.brandName}>IPS Forum</span>
                    </div>
                    <h2 style={styles.brandTagline}>
                        Join your college<br />community today.
                    </h2>
                    <p style={styles.brandDesc}>
                        Ask questions, share projects, find internship opportunities,
                        and collaborate with fellow students across all departments.
                    </p>
                    <div style={styles.brandStats}>
                        {[['🎓', 'Students'], ['💬', 'Discussions'], ['🏆', 'Hackathons']].map(([icon, label]) => (
                            <div key={label} style={styles.brandStat}>
                                <span style={styles.brandStatIcon}>{icon}</span>
                                <span style={styles.brandStatLabel}>{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right form panel */}
            <div style={styles.formPanel}>
                <div style={styles.formCard}>
                    <h1 style={styles.title}>Create your account</h1>
                    <p style={styles.sub}>
                        Already have an account? <Link to="/login" style={styles.link}>Sign in</Link>
                    </p>

                    {error && <div className="alert alert-error">{error}</div>}

                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input name="name" placeholder="Rahul Sharma" value={form.name} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Email address</label>
                            <input name="email" type="email" placeholder="you@college.edu" value={form.email} onChange={handleChange} required />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                            <div className="form-group">
                                <label>Password</label>
                                <input name="password" type="password" placeholder="Min 6 chars" value={form.password} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Confirm</label>
                                <input name="confirm" type="password" placeholder="Re-enter" value={form.confirm} onChange={handleChange} required />
                            </div>
                        </div>
                        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.72rem 1.2rem' }} disabled={loading}>
                            {loading ? 'Creating account…' : 'Create Account'}
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
    brandStats: { display: 'flex', gap: '2rem' },
    brandStat: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' },
    brandStatIcon: { fontSize: '1.5rem' },
    brandStatLabel: { fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)', fontWeight: 600 },
    formPanel: {
        flex: 1, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '2rem',
    },
    formCard: { width: '100%', maxWidth: 440 },
    title: { fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.35rem', color: 'var(--text-primary)' },
    sub: { color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem' },
    form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    link: { color: 'var(--accent)', fontWeight: 600 },
};
