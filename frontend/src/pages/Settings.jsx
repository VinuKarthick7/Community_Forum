import { useState, useContext } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
    const { user, updateUser } = useAuth();
    const { showToast } = useToast();

    // Profile form
    const [name, setName] = useState(user?.name || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [savingProfile, setSavingProfile] = useState(false);

    // Password form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [savingPassword, setSavingPassword] = useState(false);

    const handleProfileSave = async (e) => {
        e.preventDefault();
        if (!name.trim()) return showToast('Name cannot be empty', 'error');
        setSavingProfile(true);
        try {
            const { data } = await api.put('/users/profile', { name, bio });
            updateUser({ name: data.name, bio: data.bio });
            showToast('Profile updated!', 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to update profile', 'error');
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordSave = async (e) => {
        e.preventDefault();
        if (!currentPassword || !newPassword) return showToast('All fields are required', 'error');
        if (newPassword !== confirmPassword) return showToast('Passwords do not match', 'error');
        if (newPassword.length < 6) return showToast('Password must be at least 6 characters', 'error');
        setSavingPassword(true);
        try {
            await api.put('/users/password', { currentPassword, newPassword });
            showToast('Password changed successfully!', 'success');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to change password', 'error');
        } finally {
            setSavingPassword(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <h1 style={styles.pageTitle}>⚙️ Settings</h1>

                {/* Profile Section */}
                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>Profile</h2>
                    <p style={styles.sectionDesc}>Update your display name and bio visible to other members.</p>

                    <form onSubmit={handleProfileSave} style={styles.form}>
                        <div style={styles.field}>
                            <label style={styles.label}>Display Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                maxLength={50}
                                placeholder="Your name"
                            />
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>
                                Bio
                                <span style={styles.charCount}>{bio.length}/300</span>
                            </label>
                            <textarea
                                rows={4}
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                maxLength={300}
                                placeholder="Tell others a bit about yourself..."
                                style={{ resize: 'vertical' }}
                            />
                        </div>

                        <div style={styles.formActions}>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={savingProfile}
                            >
                                {savingProfile ? 'Saving...' : 'Save Profile'}
                            </button>
                        </div>
                    </form>
                </section>

                {/* Password Section */}
                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>Change Password</h2>
                    <p style={styles.sectionDesc}>Use a strong password you don't use elsewhere.</p>

                    <form onSubmit={handlePasswordSave} style={styles.form}>
                        <div style={styles.field}>
                            <label style={styles.label}>Current Password</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter current password"
                                autoComplete="current-password"
                            />
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="At least 6 characters"
                                autoComplete="new-password"
                            />
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repeat new password"
                                autoComplete="new-password"
                            />
                        </div>

                        <div style={styles.formActions}>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={savingPassword}
                            >
                                {savingPassword ? 'Saving...' : 'Change Password'}
                            </button>
                        </div>
                    </form>
                </section>

                {/* Account Info */}
                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>Account Info</h2>
                    <div style={styles.infoGrid}>
                        <div style={styles.infoItem}>
                            <span style={styles.infoLabel}>Email</span>
                            <span style={styles.infoValue}>{user?.email || '—'}</span>
                        </div>
                        <div style={styles.infoItem}>
                            <span style={styles.infoLabel}>Role</span>
                            <span style={{ ...styles.infoValue, textTransform: 'capitalize' }}>{user?.role || '—'}</span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

const styles = {
    page: { maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' },
    container: { maxWidth: 620, margin: '0 auto' },
    pageTitle: { fontSize: '1.6rem', fontWeight: 800, marginBottom: '2rem' },
    section: {
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '1.75rem', marginBottom: '1.5rem',
    },
    sectionTitle: { fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.3rem' },
    sectionDesc: { fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' },
    form: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
    field: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
    label: { fontSize: '0.85rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    charCount: { fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 },
    formActions: { display: 'flex', justifyContent: 'flex-end' },
    infoGrid: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
    infoItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--border)' },
    infoLabel: { fontSize: '0.85rem', color: 'var(--text-muted)' },
    infoValue: { fontSize: '0.9rem', fontWeight: 500 },
};
