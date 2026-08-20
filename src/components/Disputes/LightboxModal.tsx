import React from 'react';
import { X } from 'lucide-react';

interface LightboxModalProps {
  imageUrl: string;
  onClose: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({ imageUrl, onClose }) => {
  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
      onClick={onClose}
    >
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer"
      >
        <X className="w-6 h-6" />
      </button>
      <img 
        src={imageUrl} 
        alt="Lightbox Zoom" 
        referrerPolicy="no-referrer"
        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
      />
    </div>
  );
};
