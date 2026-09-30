import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from "react-i18next";
import toast from 'react-hot-toast';
import { apiGet, apiPut } from '../../../../lib/api';

export const useSearchCredentials = () => {
  const { t } = useTranslation();

  const [selectedFormat, setSelectedFormat] = useState<'algolia' | 'typesense' | 'elasticsearch'>('algolia');
  const [algoliaAppId, setAlgoliaAppId] = useState('');
  const [algoliaAdminKey, setAlgoliaAdminKey] = useState('');
  const [algoliaIndexName, setAlgoliaIndexName] = useState('');
  const [typesenseHost, setTypesenseHost] = useState('');
  const [typesenseApiKey, setTypesenseApiKey] = useState('');
  const [typesenseCollection, setTypesenseCollection] = useState('');

  useEffect(() => {
    let isCancelled = false;
    const initCredentials = async () => {
      try {
        const configRes = await apiGet<{ config: Record<string, string> }>("/api/v1/admin/search/config");
        if (configRes && configRes.config && !isCancelled) {
          const creds = configRes.config;
          if (creds.selectedFormat) setSelectedFormat(creds.selectedFormat as "algolia" | "typesense" | "elasticsearch");
          if (creds.algoliaAppId) setAlgoliaAppId(creds.algoliaAppId);
          if (creds.algoliaAdminKey) setAlgoliaAdminKey(creds.algoliaAdminKey);
          if (creds.algoliaIndexName) setAlgoliaIndexName(creds.algoliaIndexName);
          if (creds.typesenseHost) setTypesenseHost(creds.typesenseHost);
          if (creds.typesenseApiKey) setTypesenseApiKey(creds.typesenseApiKey);
          if (creds.typesenseCollection) setTypesenseCollection(creds.typesenseCollection);
        }
      } catch (err: unknown) {
        console.error("Error loading search credentials:", err);
      }
    };
    void initCredentials();
    return () => {
      isCancelled = true;
    };
  }, []);

  const saveCredentials = useCallback(async () => {
    try {
      toast.loading(t("Enregistrement des identifiants..."), { id: "save-creds" });
      await apiPut("/api/v1/admin/search/config", {
        selectedFormat,
        algoliaAppId,
        algoliaAdminKey,
        algoliaIndexName,
        typesenseHost,
        typesenseApiKey,
        typesenseCollection,
      });
      toast.success(t("Identifiants enregistrés ! ✨"), { id: "save-creds" });
    } catch (err: unknown) {
      console.error(err);
      toast.error((err as Error)?.message || t("Erreur de sauvegarde"), { id: "save-creds" });
    }
  }, [selectedFormat, algoliaAppId, algoliaAdminKey, algoliaIndexName, typesenseHost, typesenseApiKey, typesenseCollection, t]);

  const configSchemaSnippet = useMemo(() => {
    if (selectedFormat === 'algolia') {
      return JSON.stringify({
        index_settings: {
          searchableAttributes: [`unordered(name)`, `unordered(name_english)`, `unordered(name_arab)`, `unordered(description)`, `tags`, `category`],
          attributesForFaceting: [`searchable(category)`, `searchable(subcategory)`, `searchable(wilaya)`, `filterOnly(stockStatus)`, `filterOnly(hasPromo)`],
          customRanking: [`desc(rankingScore)`, `desc(rating)`, `desc(createdAt_timestamp)`],
          renderingContent: { facetOrdering: { facets: { order: ["category", "wilaya", "stockStatus"] } } }
        }
      }, null, 2);
    } else if (selectedFormat === 'typesense') {
      return JSON.stringify({
        name: "products",
        fields: [
          { name: "id", type: "string" }, { name: "name", type: "string" }, { name: "name_arab", type: "string", optional: true },
          { name: "name_english", type: "string", optional: true }, { name: "description", type: "string" },
          { name: "price", type: "int32", facet: true }, { name: "rating", type: "float", facet: true },
          { name: "category", type: "string", facet: true }, { name: "wilaya", type: "string", facet: true },
          { name: "stockStatus", type: "string", facet: true }, { name: "rankingScore", type: "int32" }
        ],
        default_sorting_field: "rankingScore"
      }, null, 2);
    } else {
      return JSON.stringify({
        mappings: {
          properties: {
            name: { type: "text", analyzer: "french" }, name_arab: { type: "text", analyzer: "arabic" },
            name_english: { type: "text", analyzer: "english" }, description: { type: "text", analyzer: "french" },
            price: { type: "double" }, category: { type: "keyword" }, wilaya: { type: "keyword" }, rankingScore: { type: "integer" }
          }
        }
      }, null, 2);
    }
  }, [selectedFormat]);

  return {
    selectedFormat,
    setSelectedFormat,
    algoliaAppId,
    setAlgoliaAppId,
    algoliaAdminKey,
    setAlgoliaAdminKey,
    algoliaIndexName,
    setAlgoliaIndexName,
    typesenseHost,
    setTypesenseHost,
    typesenseApiKey,
    setTypesenseApiKey,
    typesenseCollection,
    setTypesenseCollection,
    saveCredentials,
    configSchemaSnippet,
  };
};
