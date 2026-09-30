import { useState, useMemo } from 'react';
import { Product } from "../../../../domains/product/product.types";
import { normalizeTimestamp } from "../../../../utils/date";
import { SearchIndexingModel } from '../types';

export const useSearchTuning = (products: Product[]) => {
  const [weightTitle, setWeightTitle] = useState<number>(10);
  const [weightDesc, setWeightDesc] = useState<number>(4);
  const [weightRatings, setWeightRatings] = useState<number>(5);
  const [weightPromo, setWeightPromo] = useState<number>(3);
  const [weightStock, setWeightStock] = useState<number>(2);

  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [selectedWilaya, setSelectedWilaya] = useState<string>('Tous');
  const [simulatedSearch, setSimulatedSearch] = useState<string>('');

  const { categories, wilayas } = useMemo(() => {
    const cats = new Set<string>();
    const wils = new Set<string>();
    products.forEach(p => {
      if (p.category) cats.add(p.category);
      if (p.wilaya) wils.add(p.wilaya);
    });
    return {
      categories: ['Tous', ...Array.from(cats)],
      wilayas: ['Tous', ...Array.from(wils)]
    };
  }, [products]);

  const modeledRecords: SearchIndexingModel[] = useMemo(() => {
    return products.map(p => {
      let stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
      const stock = typeof p.stock === "number" ? p.stock : (Number((p as Product & Record<string, unknown>).stockCount) || 0);
      if (stock <= 0) stockStatus = 'out_of_stock';
      else if (stock <= 4) stockStatus = 'low_stock';

      const baseRatingBonus = (p.rating || 0) * weightRatings * 1.5;
      const promoBonus = p.promoPrice ? weightPromo * 5 : 0;
      const stockBonus = stock > 0 ? weightStock * 3 : 0;
      const calculatedRankingScore = Math.round(100 + baseRatingBonus + promoBonus + stockBonus);

      return {
        objectID: p.id,
        name: p.name || '',
        name_arab: p.translations?.ar?.name || String((p as Product & Record<string, unknown>).name_arab || "") || `${p.name} (ترجمة)`,
        name_english: p.translations?.en?.name || String((p as Product & Record<string, unknown>).name_english || "") || p.name,
        description: p.description || '',
        price: p.price || 0,
        promoPrice: p.promoPrice,
        hasPromo: !!p.promoPrice,
        category: p.category || 'Tous',
        subcategory: p.subcategory || '',
        image: p.images?.[0] || p.image || '',
        rating: p.rating || 0,
        stockStatus,
        stockCount: stock,
        wilaya: p.wilaya || 'Tous',
        sellerId: p.sellerId || '',
        sellerName: p.sellerName || 'Artisan Olma',
        tags: p.tags || [],
        createdAt_timestamp: p.createdAt ? Math.floor(normalizeTimestamp(p.createdAt as NonNullable<Product["createdAt"]>).toMillis() / 1000) : Math.floor(Date.now() / 1000),
        rankingScore: calculatedRankingScore
      };
    });
  }, [products, weightRatings, weightPromo, weightStock]);

  const filteredRecords = useMemo(() => {
    return modeledRecords.filter(rec => {
      const matchCat = selectedCategory === 'Tous' || rec.category === selectedCategory;
      const matchWilaya = selectedWilaya === 'Tous' || rec.wilaya === selectedWilaya;
      return matchCat && matchWilaya;
    });
  }, [modeledRecords, selectedCategory, selectedWilaya]);

  const simulatedResults = useMemo(() => {
    if (!simulatedSearch.trim()) return filteredRecords.slice(0, 4);
    const queryLower = simulatedSearch.trim().toLowerCase();
    
    return filteredRecords
      .map(rec => {
        let score = 0;
        if (rec.name.toLowerCase().includes(queryLower)) score += 100 * weightTitle;
        if (rec.description.toLowerCase().includes(queryLower)) score += 30 * weightDesc;
        if (rec.category.toLowerCase().includes(queryLower)) score += 50;
        score += rec.rankingScore;
        return { rec, matchScore: score };
      })
      .filter(item => item.matchScore > item.rec.rankingScore)
      .sort((a, b) => b.matchScore - a.matchScore)
      .map(item => ({
        ...item.rec,
        rankingScore: item.matchScore
      }));
  }, [filteredRecords, simulatedSearch, weightTitle, weightDesc]);

  return {
    weightTitle,
    setWeightTitle,
    weightDesc,
    setWeightDesc,
    weightRatings,
    setWeightRatings,
    weightPromo,
    setWeightPromo,
    weightStock,
    setWeightStock,
    selectedCategory,
    setSelectedCategory,
    selectedWilaya,
    setSelectedWilaya,
    simulatedSearch,
    setSimulatedSearch,
    categories,
    wilayas,
    modeledRecords,
    filteredRecords,
    simulatedResults,
  };
};
