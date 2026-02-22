import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
    Search, X, Bell, Plus, ChevronDown, LogOut,
    Settings, User, Bookmark, LayoutDashboard, Menu, Shield,
    Home, Trophy, LayoutGrid, Code2, Cpu, Globe, Briefcase, Target, Rocket, Folder,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Navbar() {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const activeCategory = searchParams.get('category') || '';
    const [search, setSearch] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showBell, setShowBell] = useState(false);
    const [categories, setCategories] = useState([]);
    const searchRef = useRef(null);
    const bellRef = useRef(null);
    const avatarRef = useRef(null);
    const debounceRef = useRef(null);

    // Debounced live search
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!search.trim()) { setResults([]); setShowResults(false); return; }
        debounceRef.current = setTimeout(async () => {
            setSearching(true);
            setShowResults(true);
            try {
                const { data } = await api.get(`/posts?search=${encodeURIComponent(search.trim())}&limit=5`);
                setResults(data.posts || []);
                setShowResults(true);
            } catch { setResults([]); }
            finally { setSearching(false); }
        }, 350);
        return () => clearTimeout(debounceRef.current);
    }, [search]);

    // Close dropdowns on click-outside or Escape key
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) setShowResults(false);
            if (bellRef.current && !bellRef.current.contains(e.target)) setShowBell(false);
            if (avatarRef.current && !avatarRef.current.contains(e.target)) setMenuOpen(false);
        };
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                setShowResults(false);
                setShowBell(false);
                setMenuOpen(false);
                setMobileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    useEffect(() => {
        api.get('/categories').then((r) => setCategories(r.data)).catch(() => {});
    }, []);

    const categoryIcon = (name) => {
        const map = {
            'Programming': <Code2 size={15} />, 'AI / ML': <Cpu size={15} />,
            'Web Development': <Globe size={15} />, 'Hackathons': <Trophy size={15} />,
            'Internships': <Briefcase size={15} />, 'Placements': <Target size={15} />,
            'Projects': <Rocket size={15} />,
            'Other': <Folder size={15} />,
        };
        return map[name] || <Folder size={15} />;
    };

    // Notification polling
    useEffect(() => {
        if (!user) return;
        const fetchNotifications = async () => {
            try {
                const { data } = await api.get('/notifications');
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            } catch {}
        };
        fetchNotifications();
        const id = setInterval(fetchNotifications, 30000);
        return () => clearInterval(id);
    }, [user]);

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

    const handleLogout = () => { logout(); navigate('/'); setMobileOpen(false); };
    const initials = user?.name?.charAt(0)?.toUpperCase() || '?';

    const markAllRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setUnreadCount(0);
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        } catch {}
    };

    const notifLabel = (n) => {
        if (n.type === 'comment') return 'commented on your post';
        if (n.type === 'reply')   return 'replied to your comment';
        if (n.type === 'upvote')  return 'upvoted your post';
        return 'notification';
    };

    return (
        <nav style={styles.nav}>
            <div style={styles.inner} className="navbar-inner">
                {/* Logo */}
                <Link to="/" style={styles.logo}>
                    <img src="/ips-logo.png" alt="IPS" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                    <span>IPS Forum</span>
                </Link>

                {/* Live Search (desktop) */}
                <form onSubmit={handleSearch} style={styles.searchForm} className="navbar-search-form" ref={searchRef}>
                    <div style={styles.searchWrap}>
                        <span style={styles.searchIcon}>
                            <Search size={14} color="var(--text-muted)" />
                        </span>
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
                            <button type="button" style={styles.clearBtn}
                                aria-label="Clear search"
                                onClick={() => { setSearch(''); setShowResults(false); }}>
                                <X size={13} />
                            </button>
                        )}
                    </div>

                    {showResults && (
                        <div style={styles.searchDropdown}>
                            {searching ? (
                                <div style={styles.noResults}>Searching…</div>
                            ) : results.length === 0 ? (
                                <div style={styles.noResults}>No posts found for "{search}"</div>
                            ) : (
                                <>
                                    {results.map((p) => (
                                        <div key={p._id} style={styles.searchResult}
                                            onClick={() => handleResultClick(p._id)}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                            <div style={styles.resultTitle}>{p.title}</div>
                                            <div style={styles.resultMeta}>
                                                {p.category?.name && <span style={styles.resultCat}>{p.category.name}</span>}
                                                <span>{p.author?.name}</span>
                                            </div>
                                        </div>
                                    ))}
                                    <button type="submit" style={styles.seeAll} onClick={handleSearch}>
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
                            {/* Notification Bell */}
                            <div style={styles.bellWrap} ref={bellRef}>
                                <button style={styles.bellBtn} aria-label="Notifications" onClick={() => setShowBell(!showBell)}>
                                    <Bell size={18} />
                                    {unreadCount > 0 && (
                                        <span style={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                                    )}
                                </button>
                                {showBell && (
                                    <div style={styles.bellDropdown} className="bell-dropdown">
                                        <div style={styles.bellHeader}>
                                            <span style={styles.bellTitle}>Notifications</span>
                                            {unreadCount > 0 && (
                                                <button style={styles.markAllBtn} onClick={markAllRead}>
                                                    Mark all read
                                                </button>
                                            )}
                                        </div>
                                        {notifications.length === 0 ? (
                                            <div style={styles.bellEmpty}>No notifications</div>
                                        ) : (
                                            notifications.slice(0, 8).map((n) => (
                                                <div key={n._id} style={{
                                                    ...styles.notifItem,
                                                    background: n.read ? 'transparent' : 'var(--accent-light)',
                                                }}
                                                    onClick={() => {
                                                        setShowBell(false);
                                                        if (n.post) navigate(`/posts/${n.post?._id || n.post}`);
                                                    }}>
                                                    <div style={styles.notifAvatar}>
                                                        {n.sender?.name?.charAt(0)?.toUpperCase() || '?'}
                                                    </div>
                                                    <div>
                                                        <div style={styles.notifText}>
                                                            <strong>{n.sender?.name}</strong> {notifLabel(n)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>

                            {isAdmin() && (
                                <Link to="/admin" className="btn btn-outline btn-sm navbar-desktop-action" style={styles.adminBtn}>
                                    <Shield size={13} /> <span className="navbar-new-post-text">Admin</span>
                                </Link>
                            )}
                            <Link to="/posts/create" className="btn btn-primary btn-sm navbar-desktop-action" style={styles.newPostBtn}>
                                <Plus size={14} /> <span className="navbar-new-post-text">New Post</span>
                            </Link>

                            {/* User avatar + dropdown */}
                            <div style={styles.avatarWrap} ref={avatarRef} role="button" tabIndex={0} aria-label="User menu" aria-expanded={menuOpen}
                                onClick={() => setMenuOpen(!menuOpen)}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setMenuOpen(!menuOpen); } }}>
                                <div className="avatar">{initials}</div>
                                <ChevronDown size={10} color="var(--text-secondary)" style={{ marginTop: '-2px' }} />
                                {menuOpen && (
                                    <div style={styles.dropdown} className="navbar-avatar-dropdown">
                                        <div style={styles.dropName}>{user.name}</div>
                                        <div style={styles.dropEmail}>{user.email}</div>
                                        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.5rem 0' }} />
                                        <Link to="/dashboard" style={styles.dropItem} onClick={() => setMenuOpen(false)}>
                                            <LayoutDashboard size={14} /> Dashboard
                                        </Link>
                                        <Link to="/bookmarks" style={styles.dropItem} onClick={() => setMenuOpen(false)}>
                                            <Bookmark size={14} /> Bookmarks
                                        </Link>
                                        <Link to={`/users/${user._id}`} style={styles.dropItem} onClick={() => setMenuOpen(false)}>
                                            <User size={14} /> Profile
                                        </Link>
                                        <Link to="/settings" style={styles.dropItem} onClick={() => setMenuOpen(false)}>
                                            <Settings size={14} /> Settings
                                        </Link>
                                        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.5rem 0' }} />
                                        <button style={{ ...styles.dropItem, ...styles.dropLogout }} onClick={handleLogout}>
                                            <LogOut size={14} /> Logout
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

                    {/* Mobile hamburger */}
                    <button style={styles.hamburger} className="navbar-hamburger" aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)}>
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div style={styles.mobileMenu}>
                    <form onSubmit={(e) => { handleSearch(e); setMobileOpen(false); }} style={{ padding: '0.75rem 1rem' }}>
                        <div style={styles.searchWrap}>
                            <span style={styles.searchIcon}><Search size={14} color="var(--text-muted)" /></span>
                            <input style={styles.searchInput} type="text" placeholder="Search..."
                                value={search} onChange={(e) => setSearch(e.target.value)} autoComplete="off" />
                        </div>
                    </form>
                    <div style={styles.mobileLinks}>
                        {/* Navigation */}
                        <div style={styles.mobileSectionLabel}>Navigation</div>
                        <Link to="/" style={styles.mobileLink} onClick={() => setMobileOpen(false)}>
                            <Home size={15} color="var(--accent)" /> Home
                        </Link>
                        <Link to="/leaderboard" style={styles.mobileLink} onClick={() => setMobileOpen(false)}>
                            <Trophy size={15} color="var(--accent)" /> Leaderboard
                        </Link>

                        {/* Categories */}
                        <div style={styles.mobileSectionLabel}>Browse Categories</div>
                        <Link to="/" style={{ ...styles.mobileLink, ...(location.pathname === '/' && !activeCategory ? styles.mobileLinkActive : {}) }} onClick={() => setMobileOpen(false)}>
                            <LayoutGrid size={15} color="var(--accent)" /> All Posts
                        </Link>
                        {categories.map((cat) => (
                            <Link key={cat._id} to={`/?category=${cat._id}`}
                                style={{ ...styles.mobileLink, ...(activeCategory === cat._id ? styles.mobileLinkActive : {}) }}
                                onClick={() => setMobileOpen(false)}>
                                <span style={{ flexShrink: 0, color: 'var(--accent)', display: 'flex' }}>{categoryIcon(cat.name)}</span>
                                {cat.name}
                            </Link>
                        ))}

                        {/* Account */}
                        {user ? (
                            <>
                                <div style={styles.mobileSectionLabel}>Account</div>
                                <Link to="/dashboard"    style={styles.mobileLink} onClick={() => setMobileOpen(false)}><LayoutDashboard size={15} color="var(--accent)" /> Dashboard</Link>
                                <Link to="/bookmarks"    style={styles.mobileLink} onClick={() => setMobileOpen(false)}><Bookmark size={15} color="var(--accent)" /> Bookmarks</Link>
                                <Link to={`/users/${user._id}`} style={styles.mobileLink} onClick={() => setMobileOpen(false)}><User size={15} color="var(--accent)" /> Profile</Link>
                                <Link to="/settings"     style={styles.mobileLink} onClick={() => setMobileOpen(false)}><Settings size={15} color="var(--accent)" /> Settings</Link>
                                <Link to="/posts/create" style={styles.mobileLink} onClick={() => setMobileOpen(false)}><Plus size={15} color="var(--accent)" /> New Post</Link>
                                {isAdmin() && <Link to="/admin" style={styles.mobileLink} onClick={() => setMobileOpen(false)}><Shield size={15} color="var(--accent)" /> Admin</Link>}
                                <button style={{ ...styles.mobileLink, ...styles.mobileLogout }} onClick={handleLogout}><LogOut size={15} color="var(--danger)" /> Logout</button>
                            </>
                        ) : (
                            <>
                                <div style={styles.mobileSectionLabel}>Account</div>
                                <Link to="/login"    style={styles.mobileLink} onClick={() => setMobileOpen(false)}><User size={15} color="var(--accent)" /> Login</Link>
                                <Link to="/register" style={styles.mobileLink} onClick={() => setMobileOpen(false)}><Plus size={15} color="var(--accent)" /> Sign Up</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
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
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        fontWeight: 800, fontSize: '1.05rem', whiteSpace: 'nowrap', color: 'var(--accent)',
        textDecoration: 'none',
    },
    searchForm: { flex: 1, maxWidth: 480, position: 'relative' },
    searchWrap: { position: 'relative' },
    searchIcon: {
        position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
        pointerEvents: 'none', display: 'flex', alignItems: 'center',
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
        cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0,
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
    actions: { display: 'flex', alignItems: 'center', gap: '0.6rem', marginLeft: 'auto' },
    adminBtn: { display: 'flex', alignItems: 'center', gap: '0.3rem' },
    newPostBtn: { display: 'flex', alignItems: 'center', gap: '0.3rem' },
    // Bell
    bellWrap: { position: 'relative' },
    bellBtn: {
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--text-secondary)', padding: '0.45rem', borderRadius: 8,
        display: 'flex', alignItems: 'center', position: 'relative',
        transition: 'background 0.15s, color 0.15s',
    },
    badge: {
        position: 'absolute', top: 0, right: 0,
        background: '#EF4444', color: '#fff', fontSize: '0.6rem',
        fontWeight: 700, borderRadius: 999, minWidth: 16, height: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 3px',
    },
    bellDropdown: {
        position: 'absolute', top: 'calc(100% + 8px)', right: 0,
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', width: 300, boxShadow: 'var(--shadow-lg)',
        zIndex: 200, overflow: 'hidden',
        // class: bell-dropdown (overridden in CSS on small screens)
    },
    bellHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)' },
    bellTitle: { fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' },
    markAllBtn: {
        background: 'none', border: 'none', cursor: 'pointer',
        fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600,
    },
    bellEmpty: { padding: '1.25rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' },
    notifItem: {
        display: 'flex', alignItems: 'flex-start', gap: '0.65rem',
        padding: '0.65rem 1rem', cursor: 'pointer',
        borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s',
    },
    notifAvatar: {
        width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)',
        color: '#fff', fontSize: '0.7rem', fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    notifText: { fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 },
    // Avatar dropdown
    avatarWrap: { position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.15rem', padding: '0.2rem', borderRadius: 999 },
    dropdown: {
        position: 'absolute', top: '110%', right: 0,
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', minWidth: 200, width: 'max-content', maxWidth: '90vw', padding: '0.4rem',
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
    // Mobile — hidden on desktop, shown via CSS .navbar-hamburger on ≤860px
    hamburger: {
        background: 'none', border: 'none',
        cursor: 'pointer', color: 'var(--text-secondary)',
        padding: '0.35rem', display: 'none', alignItems: 'center',
    },
    mobileMenu: {
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-card)',
        maxHeight: 'calc(100vh - 56px)',
        overflowY: 'auto',
    },
    mobileLinks: { display: 'flex', flexDirection: 'column', padding: '0.5rem 1rem 1.25rem' },
    mobileSectionLabel: {
        fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: 'var(--text-muted)',
        padding: '0.85rem 0.5rem 0.35rem', marginTop: '0.25rem',
    },
    mobileLinkIcon: { flexShrink: 0, color: 'var(--accent)' },
    mobileLink: {
        display: 'flex', alignItems: 'center', gap: '0.6rem',
        padding: '0.6rem 0.75rem', fontSize: '0.9rem', fontWeight: 500,
        color: 'var(--text-secondary)', textDecoration: 'none',
        borderRadius: 8, cursor: 'pointer',
        background: 'none', border: 'none', textAlign: 'left', width: '100%',
        transition: 'background 0.15s, color 0.15s',
        marginBottom: '0.1rem',
    },
    mobileLogout: { color: 'var(--danger)' },
    mobileLinkActive: {
        background: 'var(--accent-light)',
        color: 'var(--accent)',
        fontWeight: 600,
    },
};
