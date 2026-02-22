import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'success') => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3500);
    }, []);

    const dismiss = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={dismiss} />
        </ToastContext.Provider>
    );
}

function ToastContainer({ toasts, onDismiss }) {
    if (!toasts.length) return null;
    return (
        <div style={containerStyle}>
            {toasts.map((t) => (
                <div key={t.id} style={{ ...toastStyle, ...typeStyles[t.type] }}>
                    <span style={{ flexShrink: 0 }}>{icons[t.type]}</span>
                    <span style={{ flex: 1 }}>{t.message}</span>
                    <button onClick={() => onDismiss(t.id)} style={closeStyle}>✕</button>
                </div>
            ))}
        </div>
    );
}

const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

const containerStyle = {
    position: 'fixed',
    bottom: '1.5rem',
    right: '1.5rem',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    maxWidth: 360,
};

const toastStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    padding: '0.75rem 1rem',
    borderRadius: 8,
    fontSize: '0.875rem',
    fontWeight: 500,
    boxShadow: '0 4px 16px rgba(0,0,0,0.15), 0 1px 4px rgba(0,0,0,0.1)',
    border: '1px solid',
    animation: 'slideUp 0.25s ease',
    cursor: 'default',
    minWidth: 260,
    background: '#FFFFFF',
};

const typeStyles = {
    success: {
        background: '#F0FDF4',
        borderColor: 'rgba(5,118,66,0.3)',
        color: '#057642',
    },
    error: {
        background: '#FFF5F5',
        borderColor: 'rgba(204,0,0,0.25)',
        color: '#CC0000',
    },
    warning: {
        background: '#FFFBEB',
        borderColor: 'rgba(180,99,0,0.3)',
        color: '#B45309',
    },
    info: {
        background: '#EFF6FF',
        borderColor: 'rgba(10,102,194,0.25)',
        color: '#0A66C2',
    },
};

const closeStyle = {
    background: 'none',
    border: 'none',
    color: 'inherit',
    opacity: 0.6,
    cursor: 'pointer',
    fontSize: '0.8rem',
    padding: '0 0.2rem',
    flexShrink: 0,
};

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used inside ToastProvider');
    return ctx;
}
