import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SimpleMDE from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';
import { PenSquare, Save } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function CreatePost() {
    const { id } = useParams(); // if editing
    const { user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [form, setForm] = useState({ title: '', content: '', category: '', tags: '' });
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [draftSaved, setDraftSaved] = useState(false);
    const draftKey = `post_draft_${id || 'new'}`;
    const draftTimer = useRef(null);

    useEffect(() => {
        if (!user) navigate('/login');
        api.get('/categories').then(({ data }) => setCategories(data));

        if (isEdit) {
            api.get(`/posts/${id}`).then(({ data }) => {
                setForm({
                    title: data.title,
                    content: data.content,
                    category: data.category?._id || '',
                    tags: data.tags?.join(', ') || '',
                });
            });
        } else {
            // Restore draft for new posts
            const saved = localStorage.getItem(draftKey);
            if (saved) {
                try { setForm(JSON.parse(saved)); } catch {}
            }
        }
    }, []);

    // Auto-save draft (debounced 1s) for new posts
    useEffect(() => {
        if (isEdit) return;
        if (draftTimer.current) clearTimeout(draftTimer.current);
        draftTimer.current = setTimeout(() => {
            localStorage.setItem(draftKey, JSON.stringify(form));
            setDraftSaved(true);
            setTimeout(() => setDraftSaved(false), 2000);
        }, 1000);
        return () => clearTimeout(draftTimer.current);
    }, [form, isEdit]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        const payload = {
            title: form.title,
            content: form.content,
            category: form.category,
            tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        };
        try {
            if (isEdit) {
                await api.put(`/posts/${id}`, payload);
                showToast('Post updated successfully!', 'success');
                navigate(`/posts/${id}`);
            } else {
                const { data } = await api.post('/posts', payload);
                localStorage.removeItem(draftKey);
                showToast('Post published!', 'success');
                navigate(`/posts/${data._id}`);
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to save post';
            setError(msg);
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page} className="create-page">
            <div style={styles.container}>
                <h1 style={styles.title}>
                    {isEdit
                        ? <><PenSquare size={20} style={{ marginRight: 8 }} />Edit Post</>
                        : <><PenSquare size={20} style={{ marginRight: 8 }} />Create New Post</>
                    }
                </h1>
                <p style={styles.sub}>{isEdit ? 'Update your post details below.' : 'Share your knowledge with the IPS Tech community.'}</p>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit} style={styles.form} className="create-form">
                    <div className="form-group">
                        <label>Post Title *</label>
                        <input name="title" placeholder="What do you want to discuss?" value={form.title}
                            onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>Category *</label>
                        <select name="category" value={form.category} onChange={handleChange} required>
                            <option value="">Select a category</option>
                            {categories.map((c) => (
                                <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                            <label style={{ margin: 0 }}>Content * <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>(Markdown supported)</span></label>
                            {draftSaved && (
                                <span style={styles.draftBadge}><Save size={11} style={{ marginRight: 3 }} /> Draft saved</span>
                            )}
                        </div>
                        <SimpleMDE
                            value={form.content}
                            onChange={(val) => setForm((f) => ({ ...f, content: val }))}
                            options={{
                                spellChecker: false,
                                placeholder: 'Write your content here. Supports **bold**, *italic*, `code`, ```code blocks```, and more...',
                                toolbar: ['bold', 'italic', 'strikethrough', '|', 'heading', 'quote', 'unordered-list', 'ordered-list', '|', 'code', 'link', '|', 'preview', 'side-by-side', 'fullscreen'],
                                minHeight: '200px',
                            }}
                        />
                    </div>

                    <div className="form-group">
                        <label>Tags <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(comma separated)</span></label>
                        <input name="tags" placeholder="e.g. python, react, hackathon" value={form.tags} onChange={handleChange} />
                    </div>

                    <div style={styles.btnRow}>
                        <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving…' : isEdit ? 'Update Post' : 'Publish Post →'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const styles = {
    page: { maxWidth: 1200, margin: '0 auto', padding: 'clamp(1rem, 4vw, 2rem) clamp(0.5rem, 4vw, 1.5rem)' },
    container: { maxWidth: 720, margin: '0 auto' },
    title: { fontSize: 'clamp(1.2rem, 4vw, 1.6rem)', fontWeight: 800, marginBottom: '0.35rem', display: 'flex', alignItems: 'center' },
    sub: { color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' },
    form: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'clamp(1rem, 4vw, 2rem)', display: 'flex', flexDirection: 'column', gap: '1.25rem' },
    btnRow: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' },
    draftBadge: { fontSize: '0.73rem', color: '#057642', fontWeight: 600, display: 'inline-flex', alignItems: 'center' },
};
