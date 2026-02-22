import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
    Home, Code2, Cpu, Globe, Trophy, Briefcase, Target, Rocket,
    Folder, BarChart2, PenSquare, Bookmark,
} from 'lucide-react';
import api from '../api/axios';

export default function Sidebar() {
    const [categories, setCategories] = useState([]);
    const [searchParams] = useSearchParams();
    const activeCategory = searchParams.get('category');

    useEffect(() => {
        api.get('/categories').then((r) => setCategories(r.data)).catch(() => { });
    }, []);

    const categoryIcon = (name) => {
        const icons = {
            'Programming': Code2, 'AI / ML': Cpu, 'Web Development': Globe,
            'Hackathons': Trophy, 'Internships': Briefcase,
            'Placements': Target, 'Projects': Rocket,
        };
        const Icon = icons[name] || Folder;
        return <Icon size={15} />;
    };

    return (
        <aside className="sidebar">
            <div style={styles.section}>
                <div style={styles.sectionTitle}>Categories</div>
                <Link to="/" style={{ ...styles.catItem, ...(activeCategory ? {} : styles.catActive) }}>
                    <Home size={15} /> All Posts
                </Link>
                {categories.map((cat) => (
                    <Link
                        key={cat._id}
                        to={`/?category=${cat._id}`}
                        style={{ ...styles.catItem, ...(activeCategory === cat._id ? styles.catActive : {}) }}
                    >
                        {categoryIcon(cat.name)}
                        {cat.name}
                    </Link>
                ))}
            </div>

            <div style={{ ...styles.section, marginTop: '1.5rem' }}>
                <div style={styles.sectionTitle}>Quick Links</div>
                <Link to="/dashboard"   style={styles.catItem}><BarChart2 size={15} /> My Dashboard</Link>
                <Link to="/bookmarks"   style={styles.catItem}><Bookmark  size={15} /> Bookmarks</Link>
                <Link to="/leaderboard" style={styles.catItem}><Trophy    size={15} /> Leaderboard</Link>
                <Link to="/posts/create" style={styles.catItem}><PenSquare size={15} /> New Post</Link>
            </div>
        </aside>
    );
}

const styles = {
    section: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '0.85rem 0.85rem', boxShadow: 'var(--shadow-xs)' },
    sectionTitle: { fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.6rem', padding: '0 0.25rem' },
    catItem: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 0.6rem', borderRadius: 6, fontSize: '0.875rem', color: 'var(--text-secondary)', transition: 'all 0.15s', marginBottom: '0.1rem', fontWeight: 500, textDecoration: 'none' },
    catActive: { background: 'var(--accent-light)', color: 'var(--accent)', fontWeight: 600 },
};
