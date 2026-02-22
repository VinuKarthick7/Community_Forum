import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Navbar() {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const searchRef = useRef(null);
    const debounceRef = useRef(null);

    // Debounced live search
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!search.trim()) { setResults([]); setShowResults(false); return; }
        debounceRef.current = setTimeout(async () => {
            setSearching(true);
            try {
                const { data } = await api.get(`/posts?search=${encodeURIComponent(search.trim())}&limit=5`);
                setResults(data.posts || []);
                setShowResults(true);
            } catch { setResults([]); }
            finally { setSearching(false); }
        }, 350);
        return () => clearTimeout(debounceRef.current);
    }, [search]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) {
            navigate(`/?search=${encodeURIComponent(search.trim())}`);
            setSearch(''); setShowResults(false);
        }
    };

    const handleResultClick = (postId) => {
        setSearch(''); setShowResults(false);
        navigate(`/posts/${postId}`);
    };

    const handleLogout = () => { logout(); navigate('/'); };
    const initials = user?.name?.charAt(0)?.toUpperCase() || '?';

    return (
        <nav style={styles.nav}>
            <div style={styles.inner}>
                {/* Logo */}
                <Link to="/" style={styles.logo}>
                    <span style={styles.logoIcon}>⚡</span>
                    <span>IPS Forum</span>
                </Link>

                {/* Live Search */}
                <form onSubmit={handleSearch} style={styles.searchForm} ref={searchRef}>
                    <div style={styles.searchWrap}>
                        <span style={styles.searchIcon}>{searching ? '⌛' : '🔍'}</span>
                        <input
                            style={styles.searchInput}
                            type="text"
                            placeholder="Search posts, tags, topics..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onFocus={() => results.length > 0 && setShowResults(true)}
                            autoComplete="off"
                        />
                        {search && (
                            <button
                                type="button"
                                style={styles.clearBtn}
                                onClick={() => { setSearch(''); setShowResults(false); }}
                            >×</button>
                        )}
                    </div>

                    {/* Live search dropdown */}
                    {showResults && (
                        <div style={styles.searchDropdown}>
                            {results.length === 0 ? (
                                <div style={styles.noResults}>No posts found for "{search}"</div>
                            ) : (
                                <>
                                    {results.map((p) => (
                                        <div
                                            key={p._id}
                                            style={styles.searchResult}
                                            onClick={() => handleResultClick(p._id)}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <div style={styles.resultTitle}>{p.title}</div>
                                            <div style={styles.resultMeta}>
                                                {p.category?.name && <span style={styles.resultCat}>{p.category.name}</span>}
                                                <span>{p.author?.name}</span>
                                                <span>▲ {p.upvotes?.length || 0}</span>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        type="submit"
                                        style={styles.seeAll}
                                        onClick={handleSearch}
                                    >
                                        See all results for "{search}" →
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </form>

                {/* Actions */}
                <div style={styles.actions}>
                    {user ? (
                        <>
                            {isAdmin() && (
                                <Link to="/admin" className="btn btn-outline btn-sm">Admin</Link>
                            )}
                            <Link to="/posts/create" className="btn btn-primary btn-sm">+ New Post</Link>
                            <div style={styles.avatarWrap} onClick={() => setMenuOpen(!menuOpen)}>
                                <div className="avatar">{initials}</div>
                                {menuOpen && (
                                    <div style={styles.dropdown}>
                                        <div style={styles.dropName}>{user.name}</div>
                                        <div style={styles.dropEmail}>{user.email}</div>
                                        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.5rem 0' }} />
                                        <Link to="/dashboard" style={styles.dropItem} onClick={() => setMenuOpen(false)}>📊 Dashboard</Link>
                                        <Link to="/bookmarks" style={styles.dropItem} onClick={() => setMenuOpen(false)}>🔖 Bookmarks</Link>
                                        <Link to={`/users/${user._id}`} style={styles.dropItem} onClick={() => setMenuOpen(false)}>👤 Profile</Link>
                                        <Link to="/settings" style={styles.dropItem} onClick={() => setMenuOpen(false)}>⚙️ Settings</Link>
                                        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.5rem 0' }} />
                                        <button style={{ ...styles.dropItem, ...styles.dropLogout }} onClick={handleLogout}>
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
                            <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

const styles = {
    nav: {
        position: 'sticky', top: 0, zIndex: 100,
        background: 'var(--bg-nav)',
        borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow-xs)',
    },
    inner: {
        maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem',
        height: 56, display: 'flex', alignItems: 'center', gap: '1rem',
    },
    logo: {
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        fontWeight: 800, fontSize: '1.05rem', whiteSpace: 'nowrap', color: 'var(--accent)',
    },
    logoIcon: { fontSize: '1.4rem', color: 'var(--accent)' },
    searchForm: { flex: 1, maxWidth: 480, position: 'relative' },
    searchWrap: { position: 'relative' },
    searchIcon: {
        position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
        fontSize: '0.85rem', pointerEvents: 'none', color: 'var(--text-muted)',
    },
    searchInput: {
        paddingLeft: '2.2rem', paddingRight: '2rem',
        borderRadius: 999, fontSize: '0.875rem',
        background: 'var(--bg-secondary)', border: '1.5px solid var(--border)',
        width: '100%', color: 'var(--text-primary)',
    },
    clearBtn: {
        position: 'absolute', right: '0.65rem', top: '50%', transform: 'translateY(-50%)',
        background: 'none', border: 'none', color: 'var(--text-muted)',
        fontSize: '1.1rem', cursor: 'pointer', lineHeight: 1, padding: '0 0.15rem',
    },
    searchDropdown: {
        position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', zIndex: 300,
        overflow: 'hidden',
    },
    noResults: { padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' },
    searchResult: {
        padding: '0.7rem 1rem', cursor: 'pointer',
        borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s',
    },
    resultTitle: { fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.2rem', color: 'var(--text-primary)' },
    resultMeta: { display: 'flex', gap: '0.6rem', fontSize: '0.75rem', color: 'var(--text-muted)' },
    resultCat: { color: 'var(--accent)' },
    seeAll: {
        display: 'block', width: '100%', padding: '0.65rem 1rem',
        background: 'none', border: 'none', borderTop: '1px solid var(--border-subtle)',
        color: 'var(--accent)', fontSize: '0.82rem', cursor: 'pointer',
        textAlign: 'left', fontWeight: 600,
    },
    actions: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' },
    avatarWrap: { position: 'relative', cursor: 'pointer' },
    dropdown: {
        position: 'absolute', top: '110%', right: 0,
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', minWidth: 210, padding: '0.4rem',
        boxShadow: 'var(--shadow-lg)', zIndex: 200,
    },
    dropName: { fontWeight: 700, fontSize: '0.9rem', padding: '0.35rem 0.6rem', color: 'var(--text-primary)' },
    dropEmail: { fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0 0.6rem 0.35rem' },
    dropItem: {
        display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', textAlign: 'left',
        padding: '0.5rem 0.75rem', borderRadius: 6,
        fontSize: '0.875rem', color: 'var(--text-secondary)',
        background: 'none', border: 'none', transition: 'background 0.15s, color 0.15s',
        cursor: 'pointer', textDecoration: 'none',
    },
    dropLogout: { color: 'var(--danger)', marginTop: '0.1rem' },
};
