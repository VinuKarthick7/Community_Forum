import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import PostCard from '../components/PostCard';

export default function UserProfile() {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [stats, setStats] = useState({ totalUpvotes: 0, totalComments: 0 });
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            api.get(`/users/${id}`),
            api.get(`/users/${id}/posts`),
        ])
            .then(([userRes, postsRes]) => {
                setProfile(userRes.data);
                setPosts(postsRes.data.posts);
                setStats({
                    totalUpvotes:  postsRes.data.totalUpvotes,
                    totalComments: postsRes.data.totalComments,
                });
            })
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false));
    }, [id]);

    const joinDate = profile
        ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
        : '';

    if (loading) return <div className="spinner" style={{ marginTop: '5rem' }} />;

    if (notFound) {
        return (
            <div className="empty-state" style={{ marginTop: '5rem' }}>
                <div style={{ fontSize: '3rem' }}>👤</div>
                <h3>User not found</h3>
                <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
                    Back to Feed
                </Link>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            {/* Profile card */}
            <div style={styles.profileCard} className="profile-card">
                <div style={styles.avatarLg}>
                    {profile.name?.charAt(0)?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                    <h1 style={styles.name}>{profile.name}</h1>
                    <div style={styles.meta}>
                        <span style={styles.roleBadge}>{profile.role}</span>
                        <span style={styles.join}>Joined {joinDate}</span>
                    </div>
                    {profile.bio && (
                        <p style={styles.bio}>{profile.bio}</p>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div style={styles.statsRow} className="profile-stats-row">
                {[
                    { label: 'Posts',          value: posts.length       },
                    { label: 'Upvotes earned', value: stats.totalUpvotes  },
                    { label: 'Replies earned', value: stats.totalComments },
                ].map(({ label, value }) => (
                    <div key={label} style={styles.statCard}>
                        <div style={styles.statNum}>{value}</div>
                        <div style={styles.statLabel}>{label}</div>
                    </div>
                ))}
            </div>

            {/* Posts */}
            <h2 style={styles.sectionTitle}>Posts by {profile.name}</h2>
            {posts.length === 0 ? (
                <div className="empty-state">
                    <div style={{ fontSize: '2rem' }}>📝</div>
                    <h3>No posts yet</h3>
                </div>
            ) : (
                posts.map((post) => <PostCard key={post._id} post={post} />)
            )}
        </div>
    );
}

const styles = {
    page: { maxWidth: 900, margin: '0 auto', padding: 'clamp(1rem, 4vw, 2rem) clamp(0.5rem, 4vw, 1.5rem)' },
    profileCard: {
        display: 'flex', alignItems: 'center', gap: '1.5rem',
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: 'clamp(1rem, 4vw, 2rem)',
        marginBottom: '1.5rem', flexWrap: 'wrap',
    },
    avatarLg: {
        width: 72, height: 72, borderRadius: '50%',
        background: 'linear-gradient(135deg, #0A66C2, #2563EB)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: '1.75rem', color: '#fff', flexShrink: 0,
    },
    name:     { fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.4rem' },
    meta:     { display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' },
    roleBadge: {
        padding: '0.2rem 0.6rem', borderRadius: 999, fontSize: '0.72rem',
        fontWeight: 700, textTransform: 'uppercase',
        background: 'var(--accent-light)', color: 'var(--accent)',
    },
    join: { fontSize: '0.85rem', color: 'var(--text-muted)' },
    bio: { fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '0.6rem' },
    statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' },
    statCard: {
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '1.25rem', textAlign: 'center',
    },
    statNum:   { fontSize: '2rem', fontWeight: 800, color: 'var(--accent)' },
    statLabel: { fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' },
    sectionTitle: { fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' },
};
