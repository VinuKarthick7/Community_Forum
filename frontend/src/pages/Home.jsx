import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import PostCard from '../components/PostCard';

export default function Home() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchParams] = useSearchParams();

    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const tag = searchParams.get('tag') || '';

    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams({ page, limit: 10 });
        if (search) params.set('search', search);
        if (category) params.set('category', category);
        if (tag) params.set('tag', tag);

        api.get(`/posts?${params}`)
            .then(({ data }) => {
                setPosts(data.posts);
                setTotalPages(data.pages);
            })
            .finally(() => setLoading(false));
    }, [search, category, tag, page]);

    // reset page on filter change
    useEffect(() => { setPage(1); }, [search, category, tag]);

    return (
        <div className="page-layout">
            <Sidebar />

            <main>
                {/* Hero / header */}
                <div style={styles.hero}>
                    <h1 style={styles.heroTitle}>
                        {search 
                            ? `Results for "${search}"` 
                            : tag 
                            ? `Posts tagged #${tag}` 
                            : category 
                            ? 'Category Posts' 
                            : 'Community Feed'}
                    </h1>
                    <p style={styles.heroSub}>
                        {search || category || tag
                            ? 'Filtered posts from the IPS Tech community'
                            : 'Discover discussions, ask questions, and share knowledge'}
                    </p>
                </div>

                {loading ? (
                    <div className="spinner" />
                ) : posts.length === 0 ? (
                    <div className="empty-state">
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
                        <h3>No posts found</h3>
                        <p>Be the first to start a discussion!</p>
                    </div>
                ) : (
                    <>
                        {posts.map((post) => <PostCard key={post._id} post={post} />)}
                        {totalPages > 1 && (
                            <div className="pagination">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        className={`page-btn ${p === page ? 'active' : ''}`}
                                        onClick={() => setPage(p)}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

const styles = {
    hero: {
        background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(167,139,250,0.08))',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.75rem 2rem',
        marginBottom: '1.5rem',
    },
    heroTitle: { fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.35rem' },
    heroSub: { color: 'var(--text-secondary)', fontSize: '0.92rem' },
};
