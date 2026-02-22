import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowUp, MessageSquare, Eye, Pin, CheckCircle } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function PostCard({ post, onDelete, editUrl }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [upvotes, setUpvotes] = useState(post.upvotes?.length || 0);
    const [upvoted, setUpvoted] = useState(
        user ? post.upvotes?.some((id) => id === user._id || id?._id === user._id) : false
    );

    const handleUpvote = async (e) => {
        e.stopPropagation();
        if (!user) return;
        try {
            const { data } = await api.post(`/posts/${post._id}/upvote`);
            setUpvotes(data.upvotes);
            setUpvoted(data.upvoted);
        } catch { }
    };

    const timeAgo = (date) => {
        const diff = Date.now() - new Date(date).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    const fmtViews = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n || 0);

    return (
        <div
            className="card"
            style={{
                ...styles.card,
                cursor: 'pointer',
                ...(post.pinned ? styles.pinnedCard : {}),
            }}
            onClick={() => navigate(`/posts/${post._id}`)}
        >
            {/* Pinned / Solved badges */}
            {(post.pinned || post.solved) && (
                <div style={styles.badges}>
                    {post.pinned && (
                        <span style={styles.pinnedBadge}>
                            <Pin size={10} /> Pinned
                        </span>
                    )}
                    {post.solved && (
                        <span style={styles.solvedBadge}>
                            <CheckCircle size={10} /> Solved
                        </span>
                    )}
                </div>
            )}

            {/* Header */}
            <div style={styles.header}>
                <Link
                    to={`/users/${post.author?._id}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
                >
                    <div className="avatar">{post.author?.name?.charAt(0)?.toUpperCase()}</div>
                    <div style={styles.authorName}>{post.author?.name}</div>
                </Link>
                <div>
                    <div style={styles.meta}>
                        {post.category?.name && (
                            <span style={styles.catBadge}>{post.category.name}</span>
                        )}
                        <span style={styles.time}>{timeAgo(post.createdAt)}</span>
                    </div>
                </div>
            </div>

            {/* Title */}
            <h2 style={styles.title}>{post.title}</h2>

            {/* Content preview */}
            <p style={styles.preview}>
                {post.content?.substring(0, 150)}{post.content?.length > 150 ? 'â€¦' : ''}
            </p>

            {/* Tags */}
            {post.tags?.length > 0 && (
                <div style={styles.tags}>
                    {post.tags.slice(0, 5).map((tag) => (
                        <span key={tag} className="tag-badge">#{tag}</span>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div style={styles.footer}>
                <button
                    className={`btn btn-sm ${upvoted ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={handleUpvote}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', pointerEvents: user ? 'auto' : 'none' }}
                >
                    <ArrowUp size={13} /> {upvotes}
                </button>
                <span style={styles.stat}><MessageSquare size={13} style={{ marginRight: 3 }} />{post.comments?.length || 0}</span>
                <span style={styles.stat}><Eye size={13} style={{ marginRight: 3 }} />{fmtViews(post.views)}</span>
                {(editUrl || onDelete) && <div style={{ flex: 1 }} />}
                {editUrl && (
                    <Link
                        to={editUrl}
                        className="btn btn-outline btn-sm"
                        onClick={(e) => e.stopPropagation()}
                    >
                        Edit
                    </Link>
                )}
                {onDelete && (
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={(e) => { e.stopPropagation(); onDelete(post._id); }}
                    >
                        Delete
                    </button>
                )}
            </div>
        </div>
    );
}

const styles = {
    card: { marginBottom: '0.75rem', cursor: 'pointer' },
    pinnedCard: { borderColor: '#F59E0B', borderLeftWidth: 3 },
    badges: { display: 'flex', gap: '0.4rem', marginBottom: '0.6rem' },
    pinnedBadge: {
        display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
        fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.55rem',
        background: 'rgba(245,158,11,0.12)', color: '#B45309', borderRadius: 999, border: '1px solid rgba(245,158,11,0.3)',
    },
    solvedBadge: {
        display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
        fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.55rem',
        background: 'rgba(5,118,66,0.1)', color: '#057642', borderRadius: 999, border: '1px solid rgba(5,118,66,0.25)',
    },
    header: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' },
    authorName: { fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' },
    meta: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.1rem' },
    catBadge: {
        fontSize: '0.7rem', fontWeight: 600, padding: '0.1rem 0.5rem',
        background: 'var(--accent-light)', color: 'var(--accent)', borderRadius: 999,
    },
    time: { fontSize: '0.75rem', color: 'var(--text-muted)' },
    title: { fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)', lineHeight: 1.35 },
    preview: { fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '0.8rem' },
    tags: { display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.9rem' },
    footer: { display: 'flex', alignItems: 'center', gap: '0.6rem', paddingTop: '0.7rem', borderTop: '1px solid var(--border-subtle)' },
    stat: { fontSize: '0.83rem', color: 'var(--text-muted)', fontWeight: 500 },
};
