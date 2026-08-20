import React from 'react';
import { ProductCard } from '../../Product/ProductCard';
import { Product } from '../../../domains/product/product.types';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  columns?: '2' | '3' | '4' | '5';
  gap?: string;
  className?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  isLoading, 
  emptyState,
  columns = '4',
  gap = 'gap-4 sm:gap-6',
  className = ''
}) => {
  const getGridCols = () => {
    switch (columns) {
      case '2': return 'grid-cols-2';
      case '3': return 'grid-cols-2 md:grid-cols-3';
      case '4': return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
      case '5': return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
      default: return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
    }
  };

  if (isLoading) {
    return (
      <div className={`grid ${getGridCols()} ${gap} ${className}`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[4/5] bg-zinc-100 animate-pulse rounded-[2rem]"></div>
        ))}
      </div>
    );
  }

  if (products.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className={`grid ${getGridCols()} ${gap} ${className}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
