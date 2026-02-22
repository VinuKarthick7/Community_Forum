import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react';
import api from '../api/axios';

export default function VerifyEmail() {
    const { token } = useParams();
    const [status, setStatus] = useState('loading'); // loading | success | error
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) { setStatus('error'); setMessage('No verification token provided.'); return; }

        api.get(`/auth/verify/${token}`)
            .then(({ data }) => { setStatus('success'); setMessage(data.message); })
            .catch((err) => { setStatus('error'); setMessage(err.response?.data?.message || 'Verification failed.'); });
    }, [token]);

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                {status === 'loading' && (
                    <>
                        <Loader2 size={48} style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
                        <h2 style={styles.title}>Verifying your email…</h2>
                        <p style={styles.subtitle}>Please wait a moment.</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <CheckCircle2 size={48} style={{ color: '#059642' }} />
                        <h2 style={styles.title}>Email Verified!</h2>
                        <p style={styles.subtitle}>{message}</p>
                        <Link to="/login" className="btn btn-primary" style={{ marginTop: '1.25rem' }}>
                            Go to Login
                        </Link>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <XCircle size={48} style={{ color: 'var(--danger)' }} />
                        <h2 style={styles.title}>Verification Failed</h2>
                        <p style={styles.subtitle}>{message}</p>
                        <Link to="/login" className="btn btn-ghost" style={{ marginTop: '1.25rem' }}>
                            Back to Login
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem', background: 'var(--bg-primary)',
    },
    card: {
        textAlign: 'center', maxWidth: 420, width: '100%',
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '2.5rem 2rem',
        boxShadow: 'var(--shadow-md)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
    },
    title: { fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 },
    subtitle: { fontSize: '0.92rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 },
};
