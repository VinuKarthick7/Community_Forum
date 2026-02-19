import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function PostDetail() {
    const { id } = useParams();
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [upvotes, setUpvotes] = useState(0);
    const [upvoted, setUpvoted] = useState(false);

    useEffect(() => {
        api.get(`/posts/${id}`)
            .then(({ data }) => {
                setPost(data);
                setUpvotes(data.upvotes?.length || 0);
                setUpvoted(user ? data.upvotes?.some((uid) => uid === user._id || uid?._id === user._id) : false);
            })
            .catch(() => navigate('/'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleUpvote = async () => {
        if (!user) return navigate('/login');
        const { data } = await api.post(`/posts/${id}/upvote`);
        setUpvotes(data.upvotes);
        setUpvoted(data.upvoted);
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;
        const { data } = await api.post('/comments', {
            postId: id, content: comment, parentComment: replyTo,
        });
        setPost((p) => ({ ...p, comments: [...(p.comments || []), data] }));
        setComment(''); setReplyTo(null);
    };

    const handleDeletePost = async () => {
        if (!window.confirm('Delete this post?')) return;
        await api.delete(`/posts/${id}`);
        navigate('/');
    };

    const handleDeleteComment = async (commentId) => {
        await api.delete(`/comments/${commentId}`);
        setPost((p) => ({ ...p, comments: p.comments.filter((c) => c._id !== commentId) }));
    };

    const timeAgo = (date) => {
        const diff = Date.now() - new Date(date).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    if (loading) return <div className="spinner" style={{ marginTop: '5rem' }} />;
    if (!post) return null;

    const canModify = user && (user._id === post.author?._id || isAdmin());

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                {/* Breadcrumb */}
                <div style={styles.breadcrumb}>
                    <Link to="/" style={styles.breadLink}>← Back to Feed</Link>
                    {post.category && (
                        <>
                            <span style={styles.breadSep}>/</span>
                            <Link to={`/?category=${post.category._id}`} style={styles.breadLink}>{post.category.name}</Link>
                        </>
                    )}
                </div>

                {/* Post */}
                <article style={styles.article}>
                    {/* Title */}
                    <h1 style={styles.title}>{post.title}</h1>

                    {/* Meta */}
                    <div style={styles.meta}>
                        <div className="avatar">{post.author?.name?.charAt(0)?.toUpperCase()}</div>
                        <div>
                            <div style={styles.authorName}>{post.author?.name}</div>
                            <div style={styles.metaSub}>{timeAgo(post.createdAt)}</div>
                        </div>
                    </div>

                    {/* Tags */}
                    {post.tags?.length > 0 && (
                        <div style={styles.tags}>
                            {post.tags.map((t) => (
                                <Link key={t} to={`/?tag=${t}`} className="tag-badge">#{t}</Link>
                            ))}
                        </div>
                    )}

                    <div className="divider" />

                    {/* Content */}
                    <div style={styles.content}>
                        {post.content.split('\n').map((para, i) => (
                            <p key={i} style={{ marginBottom: '0.75rem' }}>{para}</p>
                        ))}
                    </div>

                    {/* Actions */}
                    <div style={styles.actions}>
                        <button
                            className={`btn ${upvoted ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={handleUpvote}
                        >
                            ▲ Upvote {upvotes > 0 && `(${upvotes})`}
                        </button>
                        {canModify && (
                            <>
                                <Link to={`/posts/edit/${post._id}`} className="btn btn-outline btn-sm">Edit</Link>
                                <button className="btn btn-danger btn-sm" onClick={handleDeletePost}>Delete</button>
                            </>
                        )}
                    </div>
                </article>

                {/* Comments */}
                <section style={styles.commentsSection}>
                    <h2 style={styles.commentsTitle}>
                        💬 {post.comments?.length || 0} Comments
                    </h2>

                    {/* Comment form */}
                    {user ? (
                        <form onSubmit={handleComment} style={styles.commentForm}>
                            {replyTo && (
                                <div style={styles.replyBanner}>
                                    Replying to comment &nbsp;
                                    <button type="button" style={styles.cancelReply} onClick={() => setReplyTo(null)}>✕ Cancel</button>
                                </div>
                            )}
                            <textarea
                                rows={3}
                                placeholder="Share your thoughts..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                style={{ resize: 'vertical' }}
                            />
                            <button className="btn btn-primary btn-sm" type="submit" style={{ alignSelf: 'flex-end' }}>
                                Post Comment
                            </button>
                        </form>
                    ) : (
                        <div style={styles.loginPrompt}>
                            <Link to="/login" className="btn btn-primary btn-sm">Login to comment</Link>
                        </div>
                    )}

                    {/* Comment list */}
                    <div style={styles.commentList}>
                        {post.comments?.map((c) => (
                            <div key={c._id} style={styles.commentCard}>
                                <div style={styles.commentHeader}>
                                    <div className="avatar" style={{ width: 30, height: 30, fontSize: '0.75rem' }}>
                                        {c.author?.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div>
                                        <span style={styles.commentAuthor}>{c.author?.name}</span>
                                        <span style={styles.commentTime}>{timeAgo(c.createdAt)}</span>
                                    </div>
                                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                                        {user && (
                                            <button className="btn btn-ghost btn-sm" onClick={() => setReplyTo(c._id)}>
                                                ↩ Reply
                                            </button>
                                        )}
                                        {user && (user._id === c.author?._id || isAdmin()) && (
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteComment(c._id)}>
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <p style={styles.commentContent}>{c.content}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

const styles = {
    page: { maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' },
    container: { maxWidth: 780, margin: '0 auto' },
    breadcrumb: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.88rem' },
    breadLink: { color: 'var(--accent-hover)' },
    breadSep: { color: 'var(--text-muted)' },
    article: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem', marginBottom: '2rem' },
    title: { fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.3, marginBottom: '1.25rem' },
    meta: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' },
    authorName: { fontWeight: 600, fontSize: '0.9rem' },
    metaSub: { fontSize: '0.78rem', color: 'var(--text-muted)' },
    tags: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' },
    content: { fontSize: '1rem', lineHeight: 1.8, color: 'var(--text-primary)' },
    actions: { display: 'flex', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' },
    commentsSection: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem' },
    commentsTitle: { fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' },
    commentForm: { display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', },
    replyBanner: { fontSize: '0.82rem', color: 'var(--accent-hover)', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    cancelReply: { background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' },
    loginPrompt: { padding: '1rem 0', marginBottom: '1rem' },
    commentList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    commentCard: { padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' },
    commentHeader: { display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' },
    commentAuthor: { fontWeight: 600, fontSize: '0.85rem', marginRight: '0.5rem' },
    commentTime: { fontSize: '0.75rem', color: 'var(--text-muted)' },
    commentContent: { fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, paddingLeft: '0.25rem' },
};
