import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

export default function Sidebar() {
    const [categories, setCategories] = useState([]);
    const [searchParams] = useSearchParams();
    const activeCategory = searchParams.get('category');

    useEffect(() => {
        api.get('/categories').then((r) => setCategories(r.data)).catch(() => { });
    }, []);

    const categoryIcons = {
        'Programming': '💻', 'AI / ML': '🤖', 'Web Development': '🌐',
        'Hackathons': '🏆', 'Internships': '💼', 'Placements': '🎯', 'Projects': '🚀',
    };

    return (
        <aside className="sidebar">
            <div style={styles.section}>
                <div style={styles.sectionTitle}>Categories</div>
                <Link
                    to="/"
                    style={{ ...styles.catItem, ...(activeCategory ? {} : styles.catActive) }}
                >
                    <span>🏠</span> All Posts
                </Link>
                {categories.map((cat) => (
                    <Link
                        key={cat._id}
                        to={`/?category=${cat._id}`}
                        style={{
                            ...styles.catItem,
                            ...(activeCategory === cat._id ? styles.catActive : {}),
                        }}
                    >
                        <span>{categoryIcons[cat.name] || '📂'}</span>
                        {cat.name}
                    </Link>
                ))}
            </div>

            <div style={{ ...styles.section, marginTop: '1.5rem' }}>
                <div style={styles.sectionTitle}>Quick Links</div>
                <Link to="/dashboard" style={styles.catItem}><span>📊</span> My Dashboard</Link>
                <Link to="/posts/create" style={styles.catItem}><span>✏️</span> New Post</Link>
            </div>
        </aside>
    );
}

const styles = {
    section: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem', },
    sectionTitle: { fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', padding: '0 0.25rem', },
    catItem: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 0.75rem', borderRadius: 8, fontSize: '0.88rem', color: 'var(--text-secondary)', transition: 'all 0.2s', marginBottom: '0.15rem', },
    catActive: { background: 'var(--accent-light)', color: 'var(--accent-hover)', fontWeight: 600, },
};
