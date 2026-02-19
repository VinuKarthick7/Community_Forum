import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';

export default function AdminPanel() {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [posts, setPosts] = useState([]);
    const [newCatName, setNewCatName] = useState('');
    const [newCatDesc, setNewCatDesc] = useState('');
    const [catError, setCatError] = useState('');
    const [tab, setTab] = useState('categories'); // 'categories' | 'posts'
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user || !isAdmin()) { navigate('/'); return; }
        fetchCategories();
        fetchPosts();
    }, []);

    const fetchCategories = async () => {
        const { data } = await api.get('/categories');
        setCategories(data);
    };

    const fetchPosts = async () => {
        const { data } = await api.get('/posts?limit=50');
        setPosts(data.posts);
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        setCatError(''); setLoading(true);
        try {
            const { data } = await api.post('/categories', { name: newCatName, description: newCatDesc });
            setCategories((prev) => [...prev, data]);
            setNewCatName(''); setNewCatDesc('');
        } catch (err) {
            setCatError(err.response?.data?.message || 'Failed to add category');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Delete this category?')) return;
        await api.delete(`/categories/${id}`);
        setCategories((prev) => prev.filter((c) => c._id !== id));
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Delete this post?')) return;
        await api.delete(`/posts/${postId}`);
        setPosts((prev) => prev.filter((p) => p._id !== postId));
    };

    return (
        <div style={styles.page}>
            <h1 style={styles.heading}>🛡️ Admin Panel</h1>
            <p style={styles.sub}>Manage categories, posts, and community moderation.</p>

            {/* Tab nav */}
            <div style={styles.tabs}>
                {['categories', 'posts'].map((t) => (
                    <button
                        key={t}
                        style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}
                        onClick={() => setTab(t)}
                    >
                        {t === 'categories' ? '📂 Categories' : '📝 All Posts'}
                    </button>
                ))}
            </div>

            {/* Categories tab */}
            {tab === 'categories' && (
                <div>
                    {/* Add form */}
                    <div style={styles.addBox}>
                        <h3 style={styles.boxTitle}>Add Category</h3>
                        {catError && <div className="alert alert-error">{catError}</div>}
                        <form onSubmit={handleAddCategory} style={styles.addForm}>
                            <input placeholder="Category name" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} required />
                            <input placeholder="Description (optional)" value={newCatDesc} onChange={(e) => setNewCatDesc(e.target.value)} />
                            <button className="btn btn-primary" type="submit" disabled={loading}>
                                {loading ? '…' : '+ Add'}
                            </button>
                        </form>
                    </div>

                    {/* Category list */}
                    <div style={styles.catGrid}>
                        {categories.map((cat) => (
                            <div key={cat._id} style={styles.catCard}>
                                <div>
                                    <div style={styles.catName}>{cat.name}</div>
                                    <div style={styles.catDesc}>{cat.description || '—'}</div>
                                </div>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteCategory(cat._id)}>
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Posts tab */}
            {tab === 'posts' && (
                <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                        {posts.length} total posts · Click Delete to remove any post.
                    </p>
                    {posts.map((p) => <PostCard key={p._id} post={p} onDelete={handleDeletePost} />)}
                </div>
            )}
        </div>
    );
}

const styles = {
    page: { maxWidth: 960, margin: '0 auto', padding: '2rem 1.5rem' },
    heading: { fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.35rem' },
    sub: { color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem' },
    tabs: { display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', marginBottom: '2rem' },
    tab: { padding: '0.6rem 1.25rem', background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem', cursor: 'pointer', borderBottom: '2px solid transparent', transition: 'all 0.2s' },
    tabActive: { color: 'var(--accent-hover)', borderBottomColor: 'var(--accent)' },
    addBox: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem' },
    boxTitle: { fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' },
    addForm: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },
    catGrid: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
    catCard: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' },
    catName: { fontWeight: 700, fontSize: '0.95rem' },
    catDesc: { fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' },
};
