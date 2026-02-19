import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function CreatePost() {
    const { id } = useParams(); // if editing
    const { user } = useAuth();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [form, setForm] = useState({ title: '', content: '', category: '', tags: '' });
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
        }
    }, []);

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
                navigate(`/posts/${id}`);
            } else {
                const { data } = await api.post('/posts', payload);
                navigate(`/posts/${data._id}`);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <h1 style={styles.title}>{isEdit ? '✏️ Edit Post' : '✨ Create New Post'}</h1>
                <p style={styles.sub}>{isEdit ? 'Update your post details below.' : 'Share your knowledge with the IPS Tech community.'}</p>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div className="form-group">
                        <label>Post Title *</label>
                        <input name="title" placeholder="What do you want to discuss?" value={form.title} onChange={handleChange} required />
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
                        <label>Content *</label>
                        <textarea
                            name="content"
                            rows={10}
                            placeholder="Write your post content here... Share code snippets, questions, or learnings."
                            value={form.content}
                            onChange={handleChange}
                            required
                            style={{ resize: 'vertical' }}
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
    page: { maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' },
    container: { maxWidth: 720, margin: '0 auto' },
    title: { fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.35rem' },
    sub: { color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' },
    form: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' },
    btnRow: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' },
};
