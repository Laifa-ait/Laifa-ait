import React from 'react';
import { ConfirmModal } from '../ui/ConfirmModal';
import { ImageAdjusterModal } from '../ui/ImageAdjusterModal';

export interface AdjustingImagePayload {
  file?: File;
  type: 'logo' | 'banner';
  src: string;
}

interface StoreProfileModalsProps {
  adjustingImage: AdjustingImagePayload | null;
  setAdjustingImage: React.Dispatch<React.SetStateAction<{ file: File; type: 'logo' | 'banner'; src: string } | null>> | ((val: AdjustingImagePayload | null) => void);
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
