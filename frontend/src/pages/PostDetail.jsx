import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function PostDetail() {
    const { id } = useParams();
    const { user, isAdmin } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [upvotes, setUpvotes] = useState(0);
    const [upvoted, setUpvoted] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);

    useEffect(() => {
        api.get(`/posts/${id}`)
            .then(({ data }) => {
                setPost(data);
                setUpvotes(data.upvotes?.length || 0);
                setUpvoted(user ? data.upvotes?.some((uid) => uid === user._id || uid?._id === user._id) : false);
                if (user?.bookmarks) {
                    setBookmarked(user.bookmarks.includes(data._id) || user.bookmarks.some(b => b === data._id || b?._id === data._id));
                }
            })
            .catch(() => navigate('/'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleUpvote = async () => {
        if (!user) return navigate('/login');
        const { data } = await api.post(`/posts/${id}/upvote`);
        setUpvotes(data.upvotes);
        setUpvoted(data.upvoted);
        showToast(data.upvoted ? 'Upvoted!' : 'Upvote removed', 'info');
    };

    const handleBookmark = async () => {
        if (!user) return navigate('/login');
        try {
            const { data } = await api.post(`/users/bookmarks/${id}`);
            setBookmarked(data.bookmarked);
            showToast(data.bookmarked ? 'Bookmarked!' : 'Bookmark removed', 'info');
        } catch {
            showToast('Failed to update bookmark', 'error');
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            showToast('Link copied to clipboard!', 'success');
        }).catch(() => showToast('Could not copy link', 'error'));
    };

    const handleAcceptAnswer = async (commentId) => {
        if (!post || !user || user._id !== post.author?._id) return;
        try {
            const isCurrentAnswer = post.acceptedAnswer?._id === commentId || post.acceptedAnswer === commentId;
            const { data } = await api.post(`/posts/${id}/solve/${commentId}`);
            setPost((p) => ({ ...p, solved: data.solved, acceptedAnswer: isCurrentAnswer ? null : { _id: commentId } }));
            showToast(data.solved ? '✅ Marked as accepted answer!' : 'Answer un-accepted', 'success');
        } catch {
            showToast('Failed to update', 'error');
        }
    };

    const submitComment = async (content, parentComment = null) => {
        if (!content.trim()) return;
        try {
            const { data } = await api.post('/comments', { postId: id, content, parentComment });
            setPost((p) => ({ ...p, comments: [...(p.comments || []), data] }));
            showToast('Comment posted!', 'success');
            return true;
        } catch {
            showToast('Failed to post comment', 'error');
            return false;
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        const ok = await submitComment(comment);
        if (ok) setComment('');
    };

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        const ok = await submitComment(replyText, replyTo.id);
        if (ok) { setReplyTo(null); setReplyText(''); }
    };

    const handleDeletePost = async () => {
        if (!window.confirm('Delete this post?')) return;
        try {
            await api.delete(`/posts/${id}`);
            showToast('Post deleted', 'success');
            navigate('/');
        } catch {
            showToast('Failed to delete post', 'error');
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await api.delete(`/comments/${commentId}`);
            setPost((p) => ({ ...p, comments: p.comments.filter((c) => c._id !== commentId) }));
            showToast('Comment deleted', 'success');
        } catch {
            showToast('Failed to delete comment', 'error');
        }
    };

    const timeAgo = (date) => {
        const diff = Date.now() - new Date(date).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    const buildTree = (comments = []) => {
        const map = {};
        const roots = [];
        comments.forEach((c) => { map[c._id] = { ...c, replies: [] }; });
        comments.forEach((c) => {
            if (c.parentComment) {
                const parent = map[c.parentComment?._id || c.parentComment];
                if (parent) parent.replies.push(map[c._id]);
                else roots.push(map[c._id]);
            } else {
                roots.push(map[c._id]);
            }
        });
        return roots;
    };

    const CommentItem = ({ c, depth = 0 }) => {
        const isAuthor = user && (user._id === c.author?._id);
        const canDelete = isAuthor || isAdmin();
        const isReplying = replyTo?.id === c._id;
        const isPostAuthor = user && post && user._id === post.author?._id;
        const isAccepted = post?.acceptedAnswer?._id === c._id || post?.acceptedAnswer === c._id;

        return (
            <div style={{ marginLeft: depth > 0 ? '1.75rem' : 0 }}>
                <div style={{
                    ...styles.commentCard,
                    borderLeft: depth > 0 ? '2px solid var(--accent)' : '1px solid var(--border)',
                    ...(isAccepted ? styles.acceptedCard : {}),
                }}>
                    {isAccepted && (
                        <div style={styles.acceptedBanner}>✅ Accepted Answer</div>
                    )}
                    <div style={styles.commentHeader}>
                        <Link to={`/users/${c.author?._id}`} style={styles.commentAuthorLink}>
                            <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.7rem' }}>
                                {c.author?.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <span style={styles.commentAuthor}>{c.author?.name}</span>
                        </Link>
                        <span style={styles.commentTime}>{timeAgo(c.createdAt)}</span>
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            {isPostAuthor && depth === 0 && (
                                <button
                                    className={`btn btn-sm ${isAccepted ? 'btn-primary' : 'btn-ghost'}`}
                                    onClick={() => handleAcceptAnswer(c._id)}
                                    title={isAccepted ? 'Un-accept answer' : 'Accept as answer'}
                                >
                                    {isAccepted ? '✅ Accepted' : '✓ Accept'}
                                </button>
                            )}
                            {user && depth === 0 && (
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => setReplyTo(isReplying ? null : { id: c._id, authorName: c.author?.name })}
                                >
                                    {isReplying ? '✕ Cancel' : '↩ Reply'}
                                </button>
                            )}
                            {canDelete && (
                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteComment(c._id)}>
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                    <p style={styles.commentContent}>{c.content}</p>
                </div>

                {isReplying && (
                    <form onSubmit={handleReplySubmit} style={{ ...styles.commentForm, marginLeft: '1.75rem', marginTop: '0.5rem' }}>
                        <div style={styles.replyBanner}>
                            ↩ Replying to <strong>{replyTo.authorName}</strong>
                        </div>
                        <textarea
                            rows={2}
                            placeholder="Write your reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            style={{ resize: 'vertical' }}
                            autoFocus
                        />
                        <button className="btn btn-primary btn-sm" type="submit" style={{ alignSelf: 'flex-end' }}>
                            Post Reply
                        </button>
                    </form>
                )}

                {c.replies?.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
                        {c.replies.map((r) => <CommentItem key={r._id} c={r} depth={depth + 1} />)}
                    </div>
                )}
            </div>
        );
    };

    if (loading) return <div className="spinner" style={{ marginTop: '5rem' }} />;
    if (!post) return null;

    const canModify = user && (user._id === post.author?._id || isAdmin());
    const commentTree = buildTree(post.comments || []);

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
                    {/* Status badges */}
                    {(post.pinned || post.solved) && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                            {post.pinned && <span style={styles.pinnedBadge}>📌 Pinned</span>}
                            {post.solved && <span style={styles.solvedBadge}>✅ Solved</span>}
                        </div>
                    )}

                    <h1 style={styles.title}>{post.title}</h1>

                    <div style={styles.meta}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <Link to={`/users/${post.author?._id}`} style={styles.authorLink}>
                                <div className="avatar">{post.author?.name?.charAt(0)?.toUpperCase()}</div>
                                <div>
                                    <div style={styles.authorName}>{post.author?.name}</div>
                                    <div style={styles.metaSub}>{timeAgo(post.createdAt)}</div>
                                </div>
                            </Link>
                            <div style={styles.viewStat}>👁 {post.views || 0} views</div>
                        </div>
                    </div>

                    {post.tags?.length > 0 && (
                        <div style={styles.tags}>
                            {post.tags.map((t) => (
                                <Link key={t} to={`/?tag=${t}`} className="tag-badge">#{t}</Link>
                            ))}
                        </div>
                    )}

                    <div className="divider" />

                    <div style={styles.content}>
                        {post.content.split('\n').map((para, i) => (
                            <p key={i} style={{ marginBottom: '0.75rem' }}>{para}</p>
                        ))}
                    </div>

                    <div style={styles.actions}>
                        <button
                            className={`btn ${upvoted ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={handleUpvote}
                        >
                            ▲ Upvote {upvotes > 0 && `(${upvotes})`}
                        </button>
                        <button
                            className={`btn btn-ghost btn-sm`}
                            onClick={handleBookmark}
                            title={bookmarked ? 'Remove bookmark' : 'Bookmark this post'}
                        >
                            {bookmarked ? '🔖 Saved' : '🔖 Save'}
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={handleShare}>
                            🔗 Share
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
                        💬 {post.comments?.length || 0} Comment{post.comments?.length !== 1 ? 's' : ''}
                    </h2>

                    {user ? (
                        <form onSubmit={handleComment} style={styles.commentForm}>
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

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {commentTree.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', textAlign: 'center', padding: '1.5rem 0' }}>
                                No comments yet. Be the first!
                            </p>
                        ) : (
                            commentTree.map((c) => <CommentItem key={c._id} c={c} />)
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

const styles = {
    page: { maxWidth: 1128, margin: '0 auto', padding: '1.75rem 1.25rem' },
    container: { maxWidth: 760, margin: '0 auto' },
    breadcrumb: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '0.85rem' },
    breadLink: { color: 'var(--accent)', fontWeight: 500 },
    breadSep: { color: 'var(--text-muted)' },
    article: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem 2rem', marginBottom: '1.25rem', boxShadow: 'var(--shadow-xs)' },
    title: { fontSize: '1.6rem', fontWeight: 800, lineHeight: 1.3, marginBottom: '1.1rem', color: 'var(--text-primary)' },
    meta: { marginBottom: '0.85rem' },
    authorLink: { display: 'inline-flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' },
    authorName: { fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' },
    metaSub: { fontSize: '0.77rem', color: 'var(--text-muted)' },
    viewStat: { fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 },
    tags: { display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.85rem' },
    content: { fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--text-secondary)' },
    actions: { display: 'flex', gap: '0.5rem', marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap' },
    pinnedBadge: { fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', background: 'rgba(245,158,11,0.12)', color: '#B45309', borderRadius: 999, border: '1px solid rgba(245,158,11,0.3)' },
    solvedBadge: { fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', background: 'rgba(5,118,66,0.1)', color: '#057642', borderRadius: 999, border: '1px solid rgba(5,118,66,0.25)' },
    commentsSection: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem 2rem', boxShadow: 'var(--shadow-xs)' },
    commentsTitle: { fontSize: '1rem', fontWeight: 700, marginBottom: '1.1rem', color: 'var(--text-primary)' },
    commentForm: { display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem', padding: '0.85rem 1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', border: '1px solid var(--border-subtle)' },
    replyBanner: { fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 500 },
    loginPrompt: { padding: '0.75rem 0', marginBottom: '0.75rem' },
    commentCard: { padding: '0.85rem 1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border-subtle)' },
    acceptedCard: { borderColor: 'rgba(5,118,66,0.4)', borderLeftWidth: 3, background: 'rgba(5,118,66,0.03)' },
    acceptedBanner: { fontSize: '0.73rem', fontWeight: 700, color: '#057642', marginBottom: '0.4rem' },
    commentHeader: { display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' },
    commentAuthorLink: { display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' },
    commentAuthor: { fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' },
    commentTime: { fontSize: '0.75rem', color: 'var(--text-muted)' },
    commentContent: { fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65, paddingLeft: '0.1rem' },
};
