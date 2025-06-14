import { createContext, useContext, useState } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  return (
    <ToastContext.Provider value={{ toast, showToast }}>
      {children}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div 
            className={`${
              toast.type === 'success' ? 'bg-teal-500' : 'bg-red-500'
            } text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-2`}
          >
            <span>{toast.type === 'success' ? '✓' : '⚠'}</span>
            <p>{toast.message}</p>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};