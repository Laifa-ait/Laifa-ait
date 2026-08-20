import React from "react";
import { ShippingLabelPrinterProps } from "./ShippingLabelPrinter/shippingLabel.types";
import { useShippingLabelPrinter } from "./ShippingLabelPrinter/useShippingLabelPrinter";
import { ShippingLabelHeader } from "./ShippingLabelPrinter/ShippingLabelHeader";
import { ShippingLabelSettings } from "./ShippingLabelPrinter/ShippingLabelSettings";
import { ShippingLabelPreview } from "./ShippingLabelPrinter/ShippingLabelPreview";

export const ShippingLabelPrinter: React.FC<ShippingLabelPrinterProps> = ({ order, onClose }) => {
  const {
    labelSize,
    setLabelSize,
    includeBarcodes,
    setIncludeBarcodes,
    remarks,
    setRemarks,
    actualTracking,
    formats,
    handlePrint,
    printAreaRef,
  } = useShippingLabelPrinter(order);

  return (
    <div className="bg-zinc-50 border border-zinc-200 rounded-[2.5rem] p-6 sm:p-8 space-y-8">
      <ShippingLabelHeader onClose={onClose} onPrint={handlePrint} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <ShippingLabelSettings
          labelSize={labelSize}
          setLabelSize={setLabelSize}
          remarks={remarks}
          setRemarks={setRemarks}
          includeBarcodes={includeBarcodes}
          setIncludeBarcodes={setIncludeBarcodes}
          formats={formats}
        />

        <ShippingLabelPreview
          order={order}
          actualTracking={actualTracking}
          includeBarcodes={includeBarcodes}
          remarks={remarks}
          printAreaRef={printAreaRef}
        />
      </div>
    </div>
  );
};

export default ShippingLabelPrinter;
export * from "./ShippingLabelPrinter/shippingLabel.types";
