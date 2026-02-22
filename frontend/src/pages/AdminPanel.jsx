import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Pin, Trash2, Folder, FileText, Flag, Check } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';

export default function AdminPanel() {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [posts, setPosts] = useState([]);
    const [reports, setReports] = useState([]);
    const [newCatName, setNewCatName] = useState('');
    const [newCatDesc, setNewCatDesc] = useState('');
    const [catError, setCatError] = useState('');
    const [tab, setTab] = useState('categories'); // 'categories' | 'posts' | 'reports'
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user || !isAdmin()) { navigate('/'); return; }
        fetchCategories();
        fetchPosts();
        fetchReports();
    }, []);

    const fetchCategories = async () => {
        const { data } = await api.get('/categories');
        setCategories(data);
    };

    const fetchPosts = async () => {
        const { data } = await api.get('/posts?limit=50');
        setPosts(data.posts);
    };

    const fetchReports = async () => {
        try {
            const { data } = await api.get('/admin/reports');
            setReports(data);
        } catch {
            // endpoint may not exist yet; silently ignore
        }
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

    const handlePinPost = async (postId) => {
        try {
            const { data } = await api.post(`/posts/${postId}/pin`);
            setPosts((prev) => prev.map((p) => p._id === postId ? { ...p, pinned: data.pinned } : p));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to pin post');
        }
    };

    return (
        <div style={styles.page}>
            <h1 style={styles.heading}><Shield size={22} style={{ marginRight: 8 }} color="var(--accent)" />Admin Panel</h1>
            <p style={styles.sub}>Manage categories, posts, and community moderation.</p>

            <div style={styles.tabs}>
                {['categories', 'posts', 'reports'].map((t) => (
                    <button key={t} style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}
                        onClick={() => setTab(t)}>
                        {t === 'categories' && <><Folder size={13} style={{ marginRight: 4 }} />Categories</>}
                        {t === 'posts'      && <><FileText size={13} style={{ marginRight: 4 }} />All Posts</>}
                        {t === 'reports'    && <><Flag size={13} style={{ marginRight: 4 }} />Reports{reports.length > 0 && ` (${reports.length})`}</>}
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
                        {posts.length} total posts · Pin posts to keep them at the top of the feed.
                    </p>
                    {posts.map((p) => (
                        <div key={p._id} style={styles.postRow}>
                            <PostCard post={p} onDelete={handleDeletePost} />
                            <button
                                className={`btn btn-sm ${p.pinned ? 'btn-primary' : 'btn-ghost'}`}
                                style={{ ...styles.pinBtn, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                onClick={() => handlePinPost(p._id)}
                            >
                                <Pin size={12} /> {p.pinned ? 'Unpin' : 'Pin'}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Reports tab */}
            {tab === 'reports' && (
                <div>
                    {reports.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            <Flag size={36} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
                            <p>No reports yet.</p>
                        </div>
                    ) : (
                        reports.map((r) => (
                            <div key={r._id} style={styles.reportCard}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                                    <Flag size={13} color="var(--danger)" />
                                    <span style={{ fontWeight: 600, fontSize: '0.85rem', textTransform: 'capitalize' }}>
                                        {r.targetType} reported
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                                        by {r.reporter?.name || r.reporter}
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>{r.reason}</p>
                                {r.resolved && (
                                    <span style={{ fontSize: '0.72rem', color: '#057642', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Check size={11} /> Resolved
                                    </span>
                                )}
                            </div>
                        ))
                    )}
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
    tab: { padding: '0.6rem 1.25rem', background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer', borderBottom: '2px solid transparent', transition: 'all 0.15s' },
    tabActive: { color: 'var(--accent)', borderBottomColor: 'var(--accent)' },
    addBox: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem' },
    boxTitle: { fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' },
    addForm: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },
    catGrid: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
    catCard: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' },
    catName: { fontWeight: 700, fontSize: '0.95rem' },
    catDesc: { fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' },
    postRow: { position: 'relative' },
    pinBtn: { position: 'absolute', top: '1rem', right: '1rem', fontSize: '0.75rem' },
    reportCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem', marginBottom: '0.65rem' },
};
