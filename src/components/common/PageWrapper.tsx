import React from "react";
import { useLocation } from "react-router-dom";
import { motion } from "motion/react";

export const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");

  if (isDashboard) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};
