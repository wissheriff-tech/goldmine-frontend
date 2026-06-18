'use client';

import { ToastBar, Toaster, toast } from 'react-hot-toast';

export default function AppToaster() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 10000,
        style: {
          background: '#ffffff',
          color: '#111827',
          border: '1px solid rgba(17,24,39,0.12)',
          boxShadow: '0 24px 80px rgba(15,23,42,0.24)',
          borderRadius: '12px',
          maxWidth: 'min(92vw, 460px)',
          padding: '12px 42px 12px 14px',
          fontSize: '0.9rem',
          lineHeight: 1.45,
        },
        success: {
          iconTheme: { primary: '#16a34a', secondary: '#ffffff' },
        },
        error: {
          iconTheme: { primary: '#dc2626', secondary: '#ffffff' },
        },
      }}
      containerStyle={{
        top: '50%',
        bottom: 'auto',
        transform: 'translateY(-50%)',
        zIndex: 99999,
      }}
    >
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 10, width: '100%' }}>
              <span style={{ flexShrink: 0, marginTop: 2 }}>{icon}</span>
              <div style={{ flex: 1, paddingRight: 4 }}>{message}</div>
              <button
                type="button"
                onClick={() => toast.dismiss(t.id)}
                aria-label="Close notification"
                style={{
                  position: 'absolute',
                  top: -6,
                  right: -34,
                  width: 26,
                  height: 26,
                  borderRadius: 999,
                  border: '1px solid rgba(17,24,39,0.12)',
                  background: '#ffffff',
                  color: '#111827',
                  cursor: 'pointer',
                  fontSize: 18,
                  lineHeight: '22px',
                  fontWeight: 700,
                }}
              >
                ×
              </button>
            </div>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
}
