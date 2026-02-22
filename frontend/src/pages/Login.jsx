import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, MessageSquare, Users, TrendingUp, Shield, Mail } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const FLOATING_ICONS = [
    { Icon: MessageSquare, x: '12%', y: '18%', delay: 0,   size: 18 },
    { Icon: Users,         x: '78%', y: '22%', delay: 1.2, size: 20 },
    { Icon: TrendingUp,    x: '22%', y: '72%', delay: 0.6, size: 16 },
    { Icon: Shield,        x: '82%', y: '68%', delay: 1.8, size: 22 },
    { Icon: MessageSquare, x: '55%', y: '85%', delay: 2.4, size: 14 },
];

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [needsVerification, setNeedsVerification] = useState(false);
    const [verifyEmail, setVerifyEmail] = useState('');
    const [resending, setResending] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => { setMounted(true); }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true); setNeedsVerification(false);
        try {
            const { data } = await api.post('/auth/login', form);
            login(data);
            navigate('/');
        } catch (err) {
            const res = err.response?.data;
            if (res?.needsVerification) {
                setNeedsVerification(true);
                setVerifyEmail(res.email);
            }
            setError(res?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        setResending(true);
        try {
            await api.post('/auth/resend-verification', { email: verifyEmail });
            setError('');
            setNeedsVerification(false);
            alert('Verification email sent! Check your inbox.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend verification email.');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="auth-page">
            {/* Left branding panel */}
            <div className="auth-brand-panel">
                {FLOATING_ICONS.map(({ Icon, x, y, delay, size }, i) => (
                    <span key={i} className="auth-floating-icon" style={{ left: x, top: y, animationDelay: `${delay}s` }}>
                        <Icon size={size} />
                    </span>
                ))}
                <div className="auth-deco-circle auth-deco-1" />
                <div className="auth-deco-circle auth-deco-2" />

                <div className="auth-brand-inner">
                    <div className="auth-brand-logo">
                        <img src="/ips-logo.png" alt="IPS" className="auth-logo-img" />
                        <span className="auth-brand-name">IPS Forum</span>
                    </div>

                    <h2 className="auth-brand-tagline">
                        Your college<br />community,<br />
                        <span className="auth-brand-highlight">all in one place.</span>
                    </h2>

                    <p className="auth-brand-desc">
                        Connect with classmates, share knowledge, discuss projects,
                        and stay updated on campus opportunities.
                    </p>

                    <div className="auth-social-proof">
                        {[
                            { num: '500+', label: 'Students' },
                            { num: '1.2K', label: 'Discussions' },
                            { num: '50+',  label: 'Topics' },
                        ].map(({ num, label }) => (
                            <div key={label} className="auth-proof-stat">
                                <span className="auth-proof-num">{num}</span>
                                <span className="auth-proof-label">{label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="auth-brand-pills">
                        {['Programming', 'Projects', 'Internships', 'Placements', 'Hackathons'].map((t) => (
                            <span key={t} className="auth-pill">{t}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right form panel */}
            <div className="auth-form-panel">
                <div className={`auth-form-card ${mounted ? 'auth-form-visible' : ''}`}>
                    <div className="auth-mobile-logo">
                        <img src="/ips-logo.png" alt="IPS Forum" className="auth-mobile-logo-img" />
                        <span className="auth-mobile-logo-name">IPS Forum</span>
                        <span className="auth-mobile-logo-tagline">Your college community</span>
                    </div>

                    <div className="auth-form-header">
                        <h1 className="auth-form-title">Welcome back</h1>
                        <p className="auth-form-sub">Sign in to continue to your community</p>
                    </div>

                    {error && (
                        <div className="auth-error" role="alert">
                            <span className="auth-error-dot" />
                            {error}
                            {needsVerification && (
                                <button
                                    type="button"
                                    disabled={resending}
                                    onClick={handleResendVerification}
                                    style={{
                                        display: 'block', marginTop: '0.5rem', background: 'none',
                                        border: 'none', color: 'var(--accent)', cursor: 'pointer',
                                        fontWeight: 600, fontSize: '0.85rem', padding: 0,
                                        textDecoration: 'underline',
                                    }}
                                >
                                    {resending ? 'Sending…' : 'Resend verification email'}
                                </button>
                            )}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="auth-field">
                            <label className="auth-label">Email address</label>
                            <div className="auth-input-wrap">
                                <input name="email" type="email" placeholder="you@college.edu"
                                    value={form.email} onChange={handleChange} className="auth-input" required autoComplete="email" />
                            </div>
                        </div>

                        <div className="auth-field">
                            <label className="auth-label">Password</label>
                            <div className="auth-input-wrap auth-pw-wrap">
                                <input name="password" type={showPw ? 'text' : 'password'} placeholder="Enter your password"
                                    value={form.password} onChange={handleChange} className="auth-input" required autoComplete="current-password" />
                                <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(!showPw)} tabIndex={-1}>
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button className="auth-submit-btn" type="submit" disabled={loading}>
                            {loading ? <span className="auth-spinner" /> : <>Sign in <ArrowRight size={16} /></>}
                        </button>
                    </form>

                    <div className="auth-divider"><span>or</span></div>

                    <p className="auth-switch">
                        Don't have an account?{' '}
                        <Link to="/register" className="auth-switch-link">Create one for free</Link>
                    </p>
                </div>

                <p className="auth-footer">
                    By signing in, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
}
