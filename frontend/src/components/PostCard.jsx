import { Link } from 'react-router-dom';
import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function PostCard({ post, onDelete }) {
    const { user } = useAuth();
    const [upvotes, setUpvotes] = useState(post.upvotes?.length || 0);
    const [upvoted, setUpvoted] = useState(
        user ? post.upvotes?.some((id) => id === user._id || id?._id === user._id) : false
    );

    const handleUpvote = async (e) => {
        e.preventDefault();
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

    return (
        <Link to={`/posts/${post._id}`} style={{ textDecoration: 'none' }}>
            <div className="card" style={styles.card}>
                {/* Header */}
                <div style={styles.header}>
                    <div className="avatar">{post.author?.name?.charAt(0)?.toUpperCase()}</div>
                    <div>
                        <div style={styles.authorName}>{post.author?.name}</div>
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
                    {post.content?.substring(0, 150)}{post.content?.length > 150 ? '…' : ''}
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
                        style={{ pointerEvents: user ? 'auto' : 'none' }}
                    >
                        ▲ {upvotes}
                    </button>
                    <span style={styles.stat}>💬 {post.comments?.length || 0}</span>
                    {onDelete && (
                        <button
                            className="btn btn-danger btn-sm"
                            onClick={(e) => { e.preventDefault(); onDelete(post._id); }}
                            style={{ marginLeft: 'auto' }}
                        >
                            Delete
                        </button>
                    )}
                </div>
            </div>
        </Link>
    );
}

const styles = {
    card: { marginBottom: '1rem', cursor: 'pointer' },
    header: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' },
    authorName: { fontWeight: 600, fontSize: '0.88rem' },
    meta: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.1rem' },
    catBadge: {
        fontSize: '0.7rem', fontWeight: 600, padding: '0.1rem 0.5rem',
        background: 'rgba(99,102,241,0.15)', color: 'var(--accent-hover)', borderRadius: 999,
    },
    time: { fontSize: '0.75rem', color: 'var(--text-muted)' },
    title: { fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)', lineHeight: 1.3 },
    preview: { fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '0.85rem' },
    tags: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' },
    footer: { display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' },
    stat: { fontSize: '0.85rem', color: 'var(--text-muted)' },
};
