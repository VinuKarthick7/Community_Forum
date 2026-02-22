import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Clock, TrendingUp, Flame, MessageSquare } from 'lucide-react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import PostCard from '../components/PostCard';

const SORT_OPTIONS = [
    { value: 'newest', label: 'Recent',   Icon: Clock        },
    { value: 'top',    label: 'Top Voted', Icon: TrendingUp  },
    { value: 'hot',    label: 'Trending',  Icon: Flame       },
];

export default function Home() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sort, setSort] = useState('newest');
    const [searchParams] = useSearchParams();

    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const tag = searchParams.get('tag') || '';

    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams({ page, limit: 10, sort });
        if (search) params.set('search', search);
        if (category) params.set('category', category);
        if (tag) params.set('tag', tag);

        api.get(`/posts?${params}`)
            .then(({ data }) => {
                setPosts(data.posts);
                setTotalPages(data.pages);
            })
            .finally(() => setLoading(false));
    }, [search, category, tag, page, sort]);

    // reset page on filter/sort change
    useEffect(() => { setPage(1); }, [search, category, tag, sort]);

    return (
        <div className="page-layout">
            <Sidebar />

            <main>
                {/* Hero / header */}
                <div style={styles.hero}>
                    <div style={styles.heroTop}>
                        <div>
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

                        {/* Sort buttons */}
                        <div style={styles.sortRow}>
                            {SORT_OPTIONS.map(({ value, label, Icon }) => (
                                <button
                                    key={value}
                                    className={`btn btn-sm ${sort === value ? 'btn-primary' : 'btn-ghost'}`}
                                    onClick={() => setSort(value)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                >
                                    <Icon size={13} /> {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="spinner" />
                ) : posts.length === 0 ? (
                    <div className="empty-state">
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}><MessageSquare size={48} color="var(--text-muted)" /></div>
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
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        marginBottom: '1rem',
        boxShadow: 'var(--shadow-xs)',
    },
    heroTop: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '1rem',
    },
    heroTitle: { fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.2rem', color: 'var(--text-primary)' },
    heroSub:   { color: 'var(--text-muted)', fontSize: '0.875rem' },
    sortRow:   { display: 'flex', gap: '0.35rem', flexShrink: 0 },
};
