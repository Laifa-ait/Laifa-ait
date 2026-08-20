import { Order } from "../../../domains/order/order.types";

export type LabelSize = "a6" | "receipt";

export interface LabelFormatOption {
  id: LabelSize;
  label: string;
}

export interface ShippingLabelPrinterProps {
  order: Order;
  onClose: () => void;
}

export interface ShippingLabelHeaderProps {
  onClose: () => void;
  onPrint: () => void;
}

export interface ShippingLabelSettingsProps {
  labelSize: LabelSize;
  setLabelSize: (size: LabelSize) => void;
  remarks: string;
  setRemarks: (remarks: string) => void;
  includeBarcodes: boolean;
  setIncludeBarcodes: (include: boolean) => void;
  formats: LabelFormatOption[];
}

export interface ShippingLabelPreviewProps {
  order: Order;
  actualTracking: string;
  includeBarcodes: boolean;
  remarks: string;
  printAreaRef: React.RefObject<HTMLDivElement | null>;
}

export interface ShippingLabelBarcodeProps {
  actualTracking: string;
}
