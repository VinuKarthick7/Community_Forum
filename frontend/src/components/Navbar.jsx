import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Navbar() {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) {
            navigate(`/?search=${encodeURIComponent(search.trim())}`);
            setSearch('');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const initials = user?.name?.charAt(0)?.toUpperCase() || '?';

    return (
        <nav style={styles.nav}>
            <div style={styles.inner}>
                {/* Logo */}
                <Link to="/" style={styles.logo}>
                    <span style={styles.logoIcon}>⚡</span>
                    <span>IPS Forum</span>
                </Link>

                {/* Search */}
                <form onSubmit={handleSearch} style={styles.searchForm}>
                    <div style={styles.searchWrap}>
                        <span style={styles.searchIcon}>🔍</span>
                        <input
                            style={styles.searchInput}
                            type="text"
                            placeholder="Search posts, tags, topics..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </form>

                {/* Actions */}
                <div style={styles.actions}>
                    {user ? (
                        <>
                            {isAdmin() && (
                                <Link to="/admin" className="btn btn-outline btn-sm">
                                    Admin
                                </Link>
                            )}
                            <Link to="/posts/create" className="btn btn-primary btn-sm">
                                + New Post
                            </Link>
                            <div style={styles.avatarWrap} onClick={() => setMenuOpen(!menuOpen)}>
                                <div className="avatar">{initials}</div>
                                {menuOpen && (
                                    <div style={styles.dropdown}>
                                        <div style={styles.dropName}>{user.name}</div>
                                        <div style={styles.dropEmail}>{user.email}</div>
                                        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.5rem 0' }} />
                                        <Link to="/dashboard" style={styles.dropItem} onClick={() => setMenuOpen(false)}>
                                            Dashboard
                                        </Link>
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
        background: 'rgba(13,15,20,0.9)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
    },
    inner: {
        maxWidth: 1200, margin: '0 auto',
        padding: '0 1.5rem',
        height: 64,
        display: 'flex', alignItems: 'center', gap: '1rem',
    },
    logo: {
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        fontWeight: 800, fontSize: '1.1rem', whiteSpace: 'nowrap',
        background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    },
    logoIcon: { fontSize: '1.3rem' },
    searchForm: { flex: 1, maxWidth: 480 },
    searchWrap: { position: 'relative' },
    searchIcon: {
        position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
        fontSize: '0.85rem', pointerEvents: 'none',
    },
    searchInput: {
        paddingLeft: '2.2rem',
        borderRadius: 999,
        fontSize: '0.88rem',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
    },
    actions: { display: 'flex', alignItems: 'center', gap: '0.6rem', marginLeft: 'auto' },
    avatarWrap: { position: 'relative', cursor: 'pointer' },
    dropdown: {
        position: 'absolute', top: '110%', right: 0,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        minWidth: 180, padding: '0.5rem',
        boxShadow: 'var(--shadow)',
        zIndex: 200,
    },
    dropName: { fontWeight: 600, fontSize: '0.88rem', padding: '0.3rem 0.5rem' },
    dropEmail: { fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0 0.5rem 0.3rem' },
    dropItem: {
        display: 'block', width: '100%', textAlign: 'left',
        padding: '0.5rem 0.75rem', borderRadius: 6,
        fontSize: '0.88rem', color: 'var(--text-primary)',
        background: 'none', border: 'none',
        transition: 'background 0.2s',
        cursor: 'pointer',
    },
    dropLogout: { color: 'var(--danger)' },
};
