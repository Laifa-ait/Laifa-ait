import React from "react";
import { useParams } from "react-router-dom";
import { PremiumCollection } from "./PremiumCollection";

export const DynamicCollectionPage: React.FC = () => {
  const { collectionName } = useParams<{ collectionName?: string }>();
  return <PremiumCollection forcedCollectionName={collectionName} />;
};
