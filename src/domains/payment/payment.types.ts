import { AppTimestamp } from "../../utils/date";

export type PaymentMethod = "CIB_EDAHABIA" | "BARIDIMOB" | "COD_AMAN" | "WALLET";

export type EscrowStatus = "HELD" | "RELEASED" | "DISPUTED" | "REFUNDED" | "PARTIALLY_REFUNDED";

export interface EscrowAccount {
  id: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  totalAmountDZD: number;
  platformFeeRatePercent: number; // e.g. 5%
  platformFeeDZD: number;
  sellerPayoutAmountDZD: number;
  status: EscrowStatus;
  paymentMethod: PaymentMethod;
  heldAt: AppTimestamp;
  releasedAt?: AppTimestamp;
  refundedAt?: AppTimestamp;
  autoReleaseAt?: AppTimestamp;
  disputeId?: string;
  notes?: string;
}

export interface WalletAccount {
  sellerId: string;
  availableBalanceDZD: number;
  pendingEscrowBalanceDZD: number;
  totalEarningsDZD: number;
  totalWithdrawnDZD: number;
  currency: "DZD";
  updatedAt: AppTimestamp;
}

export type WalletTransactionType =
  | "ESCROW_RELEASE"
  | "WITHDRAWAL_REQUEST"
  | "WITHDRAWAL_PAID"
  | "WITHDRAWAL_REJECTED_REFUND"
  | "DISPUTE_DEDUCTION"
  | "ADMIN_ADJUSTMENT"
  | "SPONSORSHIP_PAYMENT";

export interface WalletTransaction {
  id: string;
  sellerId: string;
  type: WalletTransactionType;
  amountDZD: number;
  orderId?: string;
  withdrawalId?: string;
  balanceAfterDZD: number;
  description: string;
  createdAt: AppTimestamp;
}

export type PayoutMethod = "CCP_BARIDIMOB" | "VIREMENT_BANCAIRE";
export type PayoutStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "REJECTED";

export interface PayoutRequest {
  id: string;
  sellerId: string;
  amountDZD: number;
  method: PayoutMethod;
  accountDetails: string; // RIP / CCP / BaridiMob RIP
  accountHolderName: string;
  status: PayoutStatus;
  receiptUrl?: string;
  adminNotes?: string;
  createdAt: AppTimestamp;
  processedAt?: AppTimestamp;
}
