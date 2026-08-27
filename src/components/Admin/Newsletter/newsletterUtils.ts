export const getJustifyClass = (align?: string): string => {
  if (align === "left") return "justify-start";
  if (align === "right") return "justify-end";
  return "justify-center";
};

export const getWidthClass = (widthStr?: string): string => {
  const w = widthStr || "100";
  if (w === "30") return "w-full sm:w-[calc(33.333%-1rem)] min-w-[200px] flex-grow sm:flex-grow-0";
  if (w === "50") return "w-full sm:w-[calc(50%-1rem)] min-w-[260px] flex-grow sm:flex-grow-0";
  if (w === "75") return "w-full sm:w-[75%]";
  return "w-full";
};
