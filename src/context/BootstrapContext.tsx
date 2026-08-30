import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchAppBootstrap, AppBootstrapData } from "../lib/api";
import { safeLogger } from "../utils/logger";

interface BootstrapContextType {
  data: AppBootstrapData | null;
  isLoading: boolean;
  error: string | null;
  refreshBootstrap: () => Promise<void>;
}

const BootstrapContext = createContext<BootstrapContextType | undefined>(undefined);

export const BootstrapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppBootstrapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBootstrapData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = await fetchAppBootstrap();
      setData(payload);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      safeLogger.error("[Bootstrap Context] Failed to fetch consolidated application bootstrap", { err: msg });
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBootstrapData();
  }, []);

  return (
    <BootstrapContext.Provider
      value={{
        data,
        isLoading,
        error,
        refreshBootstrap: loadBootstrapData,
      }}
    >
      {children}
    </BootstrapContext.Provider>
  );
};

export const useBootstrap = (): BootstrapContextType => {
  const context = useContext(BootstrapContext);
  if (!context) {
    throw new Error("useBootstrap must be used within a BootstrapProvider");
  }
  return context;
};
