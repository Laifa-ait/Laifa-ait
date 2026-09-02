import React from "react";
import { SellerMetadata } from "../hooks/useWorkspaceActions";
import { WorkspaceConfirmAdminModal } from "./WorkspaceConfirmAdminModal";
import { WorkspaceSelectSellerModal } from "./WorkspaceSelectSellerModal";
import { WorkspaceInputMeetModal } from "./WorkspaceInputMeetModal";

interface WorkspaceModalsProps {
  activeModal: "confirm_admin" | "select_seller" | "input_meet" | null;
  onClose: () => void;
  // Admin Export
  loadingSheetAdmin: boolean;
  onConfirmAdminExport: () => void;
  // Seller Export
  sellers: SellerMetadata[];
  selectedSeller: string;
  setSelectedSeller: (id: string) => void;
  customSellerId: string;
  setCustomSellerId: (id: string) => void;
  loadingSheetSeller: boolean;
  onConfirmSellerExport: () => void;
  // Meet
  meetEmail: string;
  setMeetEmail: (email: string) => void;
  meetSearchTerm: string;
  setMeetSearchTerm: (term: string) => void;
  selectedMeetEmails: string[];
  onToggleMeetEmail: (email: string) => void;
  filteredMeetSellers: SellerMetadata[];
  loadingMeet: boolean;
  onConfirmMeetSchedule: () => void;
}

export const WorkspaceModals: React.FC<WorkspaceModalsProps> = ({
  activeModal,
  onClose,
  loadingSheetAdmin,
  onConfirmAdminExport,
  sellers,
  selectedSeller,
  setSelectedSeller,
  customSellerId,
  setCustomSellerId,
  loadingSheetSeller,
  onConfirmSellerExport,
  meetEmail,
  setMeetEmail,
  meetSearchTerm,
  setMeetSearchTerm,
  selectedMeetEmails,
  onToggleMeetEmail,
  filteredMeetSellers,
  loadingMeet,
  onConfirmMeetSchedule,
}) => {
  if (!activeModal) return null;

  return (
    <>
      {activeModal === "confirm_admin" && (
        <WorkspaceConfirmAdminModal
          loadingSheetAdmin={loadingSheetAdmin}
          onClose={onClose}
          onConfirmAdminExport={onConfirmAdminExport}
        />
      )}

      {activeModal === "select_seller" && (
        <WorkspaceSelectSellerModal
          sellers={sellers}
          selectedSeller={selectedSeller}
          setSelectedSeller={setSelectedSeller}
          customSellerId={customSellerId}
          setCustomSellerId={setCustomSellerId}
          loadingSheetSeller={loadingSheetSeller}
          onClose={onClose}
          onConfirmSellerExport={onConfirmSellerExport}
        />
      )}

      {activeModal === "input_meet" && (
        <WorkspaceInputMeetModal
          meetEmail={meetEmail}
          setMeetEmail={setMeetEmail}
          meetSearchTerm={meetSearchTerm}
          setMeetSearchTerm={setMeetSearchTerm}
          selectedMeetEmails={selectedMeetEmails}
          onToggleMeetEmail={onToggleMeetEmail}
          filteredMeetSellers={filteredMeetSellers}
          loadingMeet={loadingMeet}
          onClose={onClose}
          onConfirmMeetSchedule={onConfirmMeetSchedule}
        />
      )}
    </>
  );
};
