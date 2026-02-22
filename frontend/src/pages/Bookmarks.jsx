import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import PostCard from '../components/PostCard';
import { useToast } from '../context/ToastContext';

export default function Bookmarks() {
    const { showToast } = useToast();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/users/bookmarks')
            .then(({ data }) => setPosts(data))
            .catch(() => showToast('Failed to load bookmarks', 'error'))
            .finally(() => setLoading(false));
    }, []);

    const handleUnbookmark = async (postId) => {
        try {
            await api.post(`/users/bookmarks/${postId}`);
            setPosts((prev) => prev.filter((p) => p._id !== postId));
            showToast('Bookmark removed', 'info');
        } catch {
            showToast('Failed to remove bookmark', 'error');
        }
    };

    return (
        <div style={styles.page} className="bookmarks-page">
            <div style={styles.container}>
                <div style={styles.header}>
                    <h1 style={styles.title}>🔖 Saved Posts</h1>
                    <p style={styles.sub}>{posts.length} bookmark{posts.length !== 1 ? 's' : ''}</p>
                </div>

                {loading ? (
                    <div className="spinner" style={{ marginTop: '3rem' }} />
                ) : posts.length === 0 ? (
                    <div style={styles.empty}>
                        <div style={styles.emptyIcon}>🔖</div>
                        <h3 style={styles.emptyTitle}>No saved posts yet</h3>
                        <p style={styles.emptyText}>
                            When you find a post worth saving, click the Save button on it.
                        </p>
                        <Link to="/" className="btn btn-primary">Browse Posts</Link>
                    </div>
                ) : (
                    <div>
                        {posts.map((post) => (
                            <div key={post._id} style={styles.postWrapper}>
                                <PostCard post={post} />
                                <button
                                    className="btn btn-ghost btn-sm"
                                    style={styles.removeBtn}
                                    onClick={() => handleUnbookmark(post._id)}
                                >
                                    Remove bookmark
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    page: { maxWidth: 1200, margin: '0 auto', padding: 'clamp(1rem, 4vw, 2rem) clamp(0.5rem, 4vw, 1.5rem)' },
    container: { maxWidth: 780, margin: '0 auto' },
    header: { marginBottom: '2rem' },
    title: { fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.25rem' },
    sub: { fontSize: '0.88rem', color: 'var(--text-muted)' },
    empty: {
        textAlign: 'center', padding: '4rem 2rem',
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
    },
    emptyIcon: { fontSize: '3rem', marginBottom: '1rem' },
    emptyTitle: { fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' },
    emptyText: { color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' },
    postWrapper: { position: 'relative' },
    removeBtn: {
        position: 'absolute', top: '1rem', right: '1rem',
        fontSize: '0.75rem', color: 'var(--text-muted)',
    },
};
