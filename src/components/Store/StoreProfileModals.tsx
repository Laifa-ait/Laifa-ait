import React from 'react';
import { ConfirmModal } from '../ui/ConfirmModal';
import { ImageAdjusterModal } from '../ui/ImageAdjusterModal';

interface StoreProfileModalsProps {
  adjustingImage: { src: string; type: 'logo' | 'banner' } | null;
  setAdjustingImage: (val: { src: string; type: 'logo' | 'banner' } | null) => void;
  showConfirm: boolean;
  setShowConfirm: (val: boolean) => void;
  isRTL: boolean;
  onSaveAdjustedImage: (blob: Blob) => Promise<void>;
  onExecuteFollowAction: (following: boolean) => Promise<void>;
}

export const StoreProfileModals: React.FC<StoreProfileModalsProps> = ({
  adjustingImage,
  setAdjustingImage,
  showConfirm,
  setShowConfirm,
  isRTL,
  onSaveAdjustedImage,
  onExecuteFollowAction,
}) => {
  return (
    <>
      {adjustingImage && (
        <ImageAdjusterModal
          src={adjustingImage.src}
          type={adjustingImage.type}
          isRTL={isRTL}
          onClose={() => setAdjustingImage(null)}
          onConfirm={onSaveAdjustedImage}
        />
      )}

      {showConfirm && (
        <ConfirmModal
          isOpen={showConfirm}
          title="Ne plus suivre cette boutique ?"
          message="Vous ne recevrez plus les notifications sur les nouveautés et promotions de ce vendeur."
          confirmText="Se désabonner"
          cancelText="Annuler"
          onConfirm={() => onExecuteFollowAction(false)}
          onClose={() => setShowConfirm(false)}
        />
      )}
    </>
  );
};
