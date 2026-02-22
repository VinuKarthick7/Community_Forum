import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, ArrowUp, FileText, Medal } from 'lucide-react';
import api from '../api/axios';

export default function Leaderboard() {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/users/leaderboard')
            .then(({ data }) => setLeaders(data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const medalColor = (i) => {
        if (i === 0) return '#F59E0B';
        if (i === 1) return '#9CA3AF';
        if (i === 2) return '#CD7C2F';
        return 'var(--text-muted)';
    };

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <div style={styles.header}>
                    <Trophy size={28} color="var(--accent)" />
                    <div>
                        <h1 style={styles.title}>Leaderboard</h1>
                        <p style={styles.sub}>Top contributors ranked by upvotes received</p>
                    </div>
                </div>

                {loading ? (
                    <div className="spinner" style={{ margin: '4rem auto' }} />
                ) : leaders.length === 0 ? (
                    <div style={styles.empty}>No data yet. Start contributing!</div>
                ) : (
                    <div style={styles.list}>
                        {leaders.map((entry, i) => (
                            <div key={entry.user._id} style={styles.row} className="leaderboard-row">
                                <div style={{ ...styles.rank, color: medalColor(i) }}>
                                    {i < 3 ? <Medal size={20} color={medalColor(i)} /> : `#${i + 1}`}
                                </div>
                                <Link to={`/users/${entry.user._id}`} style={styles.nameLink}>
                                    <div className="avatar" style={i === 0 ? styles.goldAvatar : {}}>
                                        {entry.user.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={styles.name}>{entry.user.name}</div>
                                        <div style={styles.role}>{entry.user.role}</div>
                                    </div>
                                </Link>
                                <div style={styles.stats} className="leaderboard-stats">
                                    <span style={styles.stat}>
                                        <ArrowUp size={13} />
                                        {entry.totalUpvotes}
                                    </span>
                                    <span style={styles.stat}>
                                        <FileText size={13} />
                                        {entry.postCount}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    page: { maxWidth: 1128, margin: '0 auto', padding: 'clamp(1rem, 4vw, 2rem) clamp(0.5rem, 4vw, 1.5rem)' },
    container: { maxWidth: 640, margin: '0 auto' },
    header: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' },
    title: { fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' },
    sub: { color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 },
    empty: { textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' },
    list: { display: 'flex', flexDirection: 'column', gap: '0.65rem' },
    row: {
        display: 'flex', alignItems: 'center', gap: '1rem',
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: 'clamp(0.65rem, 2vw, 0.85rem) clamp(0.75rem, 3vw, 1.25rem)',
        boxShadow: 'var(--shadow-xs)',
    },
    rank: { minWidth: 28, textAlign: 'center', fontWeight: 700, fontSize: '0.9rem' },
    nameLink: {
        display: 'flex', alignItems: 'center', gap: '0.65rem',
        textDecoration: 'none', flex: 1,
    },
    goldAvatar: { border: '2px solid #F59E0B', boxShadow: '0 0 0 2px rgba(245,158,11,0.2)' },
    name: { fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' },
    role: { fontSize: '0.73rem', color: 'var(--text-muted)', textTransform: 'capitalize' },
    stats: { display: 'flex', gap: '0.75rem', marginLeft: 'auto', flexShrink: 0, flexWrap: 'wrap' },
    stat: {
        display: 'flex', alignItems: 'center', gap: '0.3rem',
        fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600,
    },
};
