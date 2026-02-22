import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BarChart2, FileText, MessageSquare, PenSquare } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PostCard from '../components/PostCard';

export default function Dashboard() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        api.get('/posts/mine')
            .then(({ data }) => setPosts(data))
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (postId) => {
        if (!window.confirm('Delete this post?')) return;
        try {
            await api.delete(`/posts/${postId}`);
            setPosts((ps) => ps.filter((p) => p._id !== postId));
            showToast('Post deleted successfully', 'success');
        } catch {
            showToast('Failed to delete post', 'error');
        }
    };

    if (!user) return null;

    return (
        <div style={styles.page}>
            {/* Profile card */}
            <div style={styles.profileCard} className="dashboard-profile">
                <div style={styles.avatarLg}>{user.name?.charAt(0)?.toUpperCase()}</div>
                <div>
                    <h1 style={styles.name}>{user.name}</h1>
                    <p style={styles.email}>{user.email}</p>
                    <span style={styles.roleBadge}>{user.role}</span>
                </div>
                <Link to="/posts/create" className="btn btn-primary" style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                    <PenSquare size={14} /> New Post
                </Link>
            </div>

            <div style={styles.stats} className="dashboard-stats">
                <div style={styles.statCard}>
                    <BarChart2 size={20} color="var(--accent)" style={{ marginBottom: '0.4rem' }} />
                    <div style={styles.statNumber}>{posts.length}</div>
                    <div style={styles.statLabel}>Posts Created</div>
                </div>
                <div style={styles.statCard}>
                    <FileText size={20} color="var(--accent)" style={{ marginBottom: '0.4rem' }} />
                    <div style={styles.statNumber}>
                        {posts.reduce((sum, p) => sum + (p.upvotes?.length || 0), 0)}
                    </div>
                    <div style={styles.statLabel}>Total Upvotes</div>
                </div>
                <div style={styles.statCard}>
                    <MessageSquare size={20} color="var(--accent)" style={{ marginBottom: '0.4rem' }} />
                    <div style={styles.statNumber}>
                        {posts.reduce((sum, p) => sum + (p.comments?.length || 0), 0)}
                    </div>
                    <div style={styles.statLabel}>Comments Received</div>
                </div>
            </div>

            {/* My Posts */}
            <h2 style={styles.sectionTitle}>My Posts</h2>
            {loading ? (
                <div className="spinner" />
            ) : posts.length === 0 ? (
                <div className="empty-state">
                    <FileText size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                    <h3>No posts yet</h3>
                    <p>Create your first post and share your knowledge!</p>
                    <Link to="/posts/create" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <PenSquare size={14} /> Create Post
                    </Link>
                </div>
            ) : (
                posts.map((post) => (
                    <PostCard
                        key={post._id}
                        post={post}
                        onDelete={handleDelete}
                        editUrl={`/posts/edit/${post._id}`}
                    />
                ))
            )}
        </div>
    );
}

const styles = {
    page: { maxWidth: 900, margin: '0 auto', padding: 'clamp(1rem, 4vw, 2rem) clamp(0.75rem, 4vw, 1.5rem)' },
    profileCard: { display: 'flex', alignItems: 'center', gap: '1.25rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'clamp(1rem, 4vw, 1.75rem)', marginBottom: '1.5rem', flexWrap: 'wrap' },
    avatarLg: { width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #0A66C2, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.5rem', color: '#fff', flexShrink: 0 },
    name: { fontSize: '1.3rem', fontWeight: 800 },
    email: { color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.1rem' },
    roleBadge: { display: 'inline-block', marginTop: '0.4rem', padding: '0.15rem 0.55rem', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', background: 'var(--accent-light)', color: 'var(--accent)' },
    stats: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' },
    statCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem', textAlign: 'center' },
    statNumber: { fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, color: 'var(--accent)' },
    statLabel: { fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' },
    sectionTitle: { fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' },
};
