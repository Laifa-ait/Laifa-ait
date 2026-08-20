import React from "react";
import { ShippingLabelBarcodeProps } from "./shippingLabel.types";

const BARCODE_PATTERN = [
  4, 1, 3, 2, 4, 1, 2, 3, 4, 1, 2, 4, 3, 2, 4, 1, 3, 2, 4, 1, 4, 3, 2, 1, 4, 2, 3, 1, 4, 2, 3, 4, 1, 2, 3, 4,
];

export const ShippingLabelBarcode: React.FC<ShippingLabelBarcodeProps> = ({ actualTracking }) => {
  return (
    <div className="pt-2 text-center space-y-1 select-none">
      <div className="h-14 bg-white border-2 border-black w-full flex items-center justify-center rounded overflow-hidden py-1">
        <div className="flex gap-0 items-stretch h-full w-full px-6">
          {BARCODE_PATTERN.map((w, idx) => (
            <div
              key={idx}
              style={{ flexGrow: w }}
              className={`h-full ${idx % 2 === 0 ? "bg-black" : "bg-white"}`}
            />
          ))}
        </div>
      </div>
      <strong className="block text-[12px] font-sans font-bold tracking-[0.2em] text-black">
        {actualTracking}
      </strong>
    </div>
  );
};
