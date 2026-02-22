import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Check, X, Code, BookOpen, Award, Mail } from 'lucide-react';
import api from '../api/axios';

const FLOAT = [
    { Icon: Code,     x: '15%', y: '20%', delay: 0.3, size: 18 },
    { Icon: BookOpen, x: '80%', y: '25%', delay: 1.0, size: 20 },
    { Icon: Award,    x: '20%', y: '75%', delay: 1.6, size: 16 },
    { Icon: Code,     x: '75%', y: '70%', delay: 2.2, size: 14 },
];

const PW_RULES = [
    { test: (pw) => pw.length >= 6,        label: 'At least 6 characters' },
    { test: (pw) => /[A-Z]/.test(pw),      label: 'One uppercase letter' },
    { test: (pw) => /[0-9]/.test(pw),      label: 'One number' },
];

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);
    const navigate = useNavigate();

    useEffect(() => { setMounted(true); }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const pwStrength = useMemo(() => {
        const passed = PW_RULES.filter((r) => r.test(form.password)).length;
        return passed;
    }, [form.password]);

    const strengthLabel = pwStrength === 0 ? '' : pwStrength === 1 ? 'Weak' : pwStrength === 2 ? 'Fair' : 'Strong';
    const strengthColor = pwStrength <= 1 ? 'var(--danger)' : pwStrength === 2 ? 'var(--warning)' : 'var(--success)';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirm) return setError('Passwords do not match');
        if (form.password.length < 6) return setError('Password must be at least 6 characters');
        if (!/[A-Z]/.test(form.password)) return setError('Password must contain at least one uppercase letter');
        if (!/[0-9]/.test(form.password)) return setError('Password must contain at least one number');
        setLoading(true);
        try {
            const { data } = await api.post('/auth/register', {
                name: form.name, email: form.email, password: form.password,
            });
            setVerificationSent(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            {/* Left branding panel */}
            <div className="auth-brand-panel">
                {FLOAT.map(({ Icon, x, y, delay, size }, i) => (
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
                        Join your college<br />community<br />
                        <span className="auth-brand-highlight">today.</span>
                    </h2>

                    <p className="auth-brand-desc">
                        Ask questions, share projects, find internship opportunities,
                        and collaborate with fellow students across all departments.
                    </p>

                    {/* Testimonial card */}
                    <div className="auth-testimonial">
                        <p className="auth-testimonial-text">
                            "IPS Forum helped me find my hackathon team and land my first internship. Truly a game changer!"
                        </p>
                        <div className="auth-testimonial-author">
                            <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.7rem' }}>R</div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#fff' }}>Rahul S.</div>
                                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)' }}>Computer Science, 3rd Year</div>
                            </div>
                        </div>
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

                    {verificationSent ? (
                        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                            <Mail size={48} style={{ color: 'var(--accent)', marginBottom: '1rem' }} />
                            <h2 className="auth-form-title" style={{ marginBottom: '0.5rem' }}>Check your email</h2>
                            <p className="auth-form-sub" style={{ marginBottom: '1.5rem', lineHeight: 1.6 }}>
                                We've sent a verification link to <strong>{form.email}</strong>.<br />
                                Click the link in the email to activate your account.
                            </p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                                Didn't receive it? Check your spam folder or try again in a few minutes.
                            </p>
                            <Link to="/login" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                Go to Login <ArrowRight size={16} />
                            </Link>
                        </div>
                    ) : (
                    <>
                    <div className="auth-form-header">
                        <h1 className="auth-form-title">Create your account</h1>
                        <p className="auth-form-sub">It only takes a minute to get started</p>
                    </div>

                    {error && (
                        <div className="auth-error" role="alert">
                            <span className="auth-error-dot" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="auth-field">
                            <label className="auth-label">Full Name</label>
                            <div className="auth-input-wrap">
                                <input name="name" placeholder="Rahul Sharma" value={form.name}
                                    onChange={handleChange} className="auth-input" required autoComplete="name" />
                            </div>
                        </div>

                        <div className="auth-field">
                            <label className="auth-label">Email address</label>
                            <div className="auth-input-wrap">
                                <input name="email" type="email" placeholder="you@college.edu" value={form.email}
                                    onChange={handleChange} className="auth-input" required autoComplete="email" />
                            </div>
                        </div>

                        <div className="auth-field">
                            <label className="auth-label">Password</label>
                            <div className="auth-input-wrap auth-pw-wrap">
                                <input name="password" type={showPw ? 'text' : 'password'} placeholder="Create a strong password"
                                    value={form.password} onChange={handleChange} className="auth-input" required autoComplete="new-password" />
                                <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(!showPw)} tabIndex={-1}>
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>

                            {/* Strength bar */}
                            {form.password && (
                                <div className="auth-pw-strength">
                                    <div className="auth-pw-bar-track">
                                        <div className="auth-pw-bar-fill" style={{ width: `${(pwStrength / PW_RULES.length) * 100}%`, background: strengthColor }} />
                                    </div>
                                    <span className="auth-pw-strength-label" style={{ color: strengthColor }}>{strengthLabel}</span>
                                </div>
                            )}

                            {/* Password rules */}
                            {form.password && (
                                <div className="auth-pw-rules">
                                    {PW_RULES.map(({ test, label }) => {
                                        const ok = test(form.password);
                                        return (
                                            <div key={label} className={`auth-pw-rule ${ok ? 'auth-pw-rule-ok' : ''}`}>
                                                {ok ? <Check size={12} /> : <X size={12} />}
                                                {label}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="auth-field">
                            <label className="auth-label">Confirm password</label>
                            <div className="auth-input-wrap auth-pw-wrap">
                                <input name="confirm" type={showConfirm ? 'text' : 'password'} placeholder="Re-enter password"
                                    value={form.confirm} onChange={handleChange} className="auth-input" required autoComplete="new-password" />
                                <button type="button" className="auth-pw-toggle" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}>
                                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {form.confirm && form.password !== form.confirm && (
                                <span className="auth-mismatch">Passwords do not match</span>
                            )}
                        </div>

                        <button className="auth-submit-btn" type="submit" disabled={loading}>
                            {loading ? <span className="auth-spinner" /> : <>Create Account <ArrowRight size={16} /></>}
                        </button>
                    </form>

                    <div className="auth-divider"><span>or</span></div>

                    <p className="auth-switch">
                        Already have an account?{' '}
                        <Link to="/login" className="auth-switch-link">Sign in</Link>
                    </p>
                    </>
                    )}
                </div>

                <p className="auth-footer">
                    By creating an account, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
}
