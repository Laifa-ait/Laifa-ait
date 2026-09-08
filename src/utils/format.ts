export const formatPrice = (price: number) => {
  // Use LRM (Left-to-Right Mark) to ensure the number and DA don't get scrambled in RTL
  return "\u200E" + new Intl.NumberFormat("en-US").format(price) + "\u00A0DA";
};

export const formatDZD = (amount: number): string => {
  if (typeof amount !== 'number' || isNaN(amount)) return '0 DZD';
  return `${new Intl.NumberFormat('fr-DZ', { maximumFractionDigits: 0 }).format(amount)} DZD`;
};

