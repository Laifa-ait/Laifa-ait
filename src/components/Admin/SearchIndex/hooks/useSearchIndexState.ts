import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from "react-i18next";
import toast from 'react-hot-toast';
import { apiGet } from '../../../../lib/api';
import { Product } from "../../../../domains/product/product.types";
import { useSearchCredentials } from './useSearchCredentials';
import { useSearchTuning } from './useSearchTuning';

export const useSearchIndexState = () => {
  const { t } = useTranslation();

  const [products, setProducts] = useState<Product[]>([]);
  const [isFetchingProducts, setIsFetchingProducts] = useState(true);
  const [usingDemoData, setUsingDemoData] = useState(false);
  const [exportedStatus, setExportedStatus] = useState<string>('');
  const [isIndexing, setIsIndexing] = useState(false);

  const creds = useSearchCredentials();
  const tuning = useSearchTuning(products);

  useEffect(() => {
    let isCancelled = false;
    const loadProducts = async () => {
      try {
        const prodRes = await apiGet<{ products: Product[] }>("/api/v1/admin/search/products-preview");
        const fetchedProds: Product[] = prodRes?.products || [];

        if (!isCancelled) {
          setProducts(fetchedProds);
          setUsingDemoData(false);
        }
      } catch (err: unknown) {
        console.error("Error loading products preview:", err);
        if (!isCancelled) {
          setProducts([]);
          setUsingDemoData(false);
        }
      } finally {
        if (!isCancelled) {
          setIsFetchingProducts(false);
        }
      }
    };
    void loadProducts();
    return () => {
      isCancelled = true;
    };
  }, []);

  const handleDownloadExport = useCallback(() => {
    try {
      let exportPayload = "";
      if (creds.selectedFormat === 'algolia') {
        exportPayload = JSON.stringify({
          records: tuning.filteredRecords,
          settings: JSON.parse(creds.configSchemaSnippet)
        }, null, 2);
      } else if (creds.selectedFormat === 'typesense') {
        exportPayload = tuning.filteredRecords.map(r => JSON.stringify(r)).join("\n");
      } else {
        exportPayload = JSON.stringify(tuning.filteredRecords, null, 2);
      }

      const blob = new Blob([exportPayload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `olma_export_search_${creds.selectedFormat}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setExportedStatus(t("Exportation réussie de {{count}} produits !", { count: tuning.filteredRecords.length }));
      setTimeout(() => setExportedStatus(''), 5000);
    } catch (err: unknown) {
      console.error(err);
      toast.error(t("Erreur de téléchargement"));
    }
  }, [creds.selectedFormat, creds.configSchemaSnippet, tuning.filteredRecords, t]);

  const handleIndexPush = useCallback(async () => {
    if (creds.selectedFormat === 'algolia') {
      if (!creds.algoliaAppId || !creds.algoliaAdminKey || !creds.algoliaIndexName) {
        toast.error(t("Veuillez configurer et enregistrer vos clés d'API Algolia Admin."));
        return;
      }
      setIsIndexing(true);
      toast.loading(t("Upload des produits vers l'index Algolia..."), { id: "indexing-push" });

      try {
        const batchUrl = `https://${creds.algoliaAppId}.algolia.net/1/indexes/${creds.algoliaIndexName}/batch`;
        const requests = tuning.filteredRecords.map(rec => ({
          action: "updateObject",
          body: rec
        }));

        const res = await fetch(batchUrl, {
          method: "POST",
          headers: {
            "X-Algolia-Application-Id": creds.algoliaAppId,
            "X-Algolia-API-Key": creds.algoliaAdminKey,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ requests })
        });

        if (!res.ok) throw new Error(await res.text());

        toast.success(t("Indexation réussie ! {{count}} produits poussés sur Algolia. 🚀✨", { count: tuning.filteredRecords.length }), { id: "indexing-push" });
      } catch (err: unknown) {
        console.error(err);
        toast.error(`${t("Échec de l'indexation :")} ${(err as Error)?.message || err}`, { id: "indexing-push" });
      } finally {
        setIsIndexing(false);
      }
    } else {
      toast.error(t("L'indexation directe en un clic est actuellement supportée pour Algolia. Pour d'autres, utilisez l'exportation JSON."));
    }
  }, [creds.selectedFormat, creds.algoliaAppId, creds.algoliaAdminKey, creds.algoliaIndexName, tuning.filteredRecords, t]);

  return {
    products,
    isFetchingProducts,
    usingDemoData,
    ...creds,
    ...tuning,
    exportedStatus,
    isIndexing,
    handleDownloadExport,
    handleIndexPush,
  };
};
