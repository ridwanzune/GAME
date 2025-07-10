
import React from 'react';

interface ModalProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
}

const Modal: React.FC<ModalProps> = ({ title, children, isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-slate-800 border-2 border-pink-500 rounded-2xl shadow-lg p-8 m-4 text-center max-w-sm w-full animate-fade-in">
        <h2 className="text-3xl font-bold mb-4 text-cyan-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{title}</h2>
        <div className="text-slate-200 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
