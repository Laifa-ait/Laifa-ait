/**
 * Utility to suppress benign HMR and Firestore WebSocket warnings/errors in console.
 * Imported in main.tsx so index.html doesn't require inline scripts.
 */
(function () {
  if (typeof window === "undefined") return;

  const isBenignNoise = (args: unknown[]) => {
    const text = args
      .map((a) => {
        if (typeof a === "string") return a;
        if (a && typeof a === "object") {
          if ("message" in a && typeof (a as { message: unknown }).message === "string") {
            return (a as { message: string }).message;
          }
          try {
            return JSON.stringify(a);
          } catch {
            return "";
          }
        }
        return String(a || "");
      })
      .join(" ");

    return (
      text.includes("[vite] failed to connect to websocket") ||
      text.includes("WebSocket connection to") ||
      text.includes("WebSocket closed without opened") ||
      text.includes("WebChannelConnection") ||
      text.includes("RPC 'Listen' stream") ||
      text.includes("transport errored") ||
      (text.includes("@firebase/firestore") && text.includes("WebChannel"))
    );
  };

  const originalError = console.error;
  console.error = function (...args: unknown[]) {
    if (isBenignNoise(args)) {
      return;
    }
    originalError.apply(console, args as Parameters<typeof console.error>);
  };

  const originalWarn = console.warn;
  console.warn = function (...args: unknown[]) {
    if (isBenignNoise(args)) {
      return;
    }
    originalWarn.apply(console, args as Parameters<typeof console.warn>);
  };

  // Suppress benign WebSocket/HMR errors in development proxy
  window.addEventListener("unhandledrejection", function (event) {
    const reasonStr = event.reason
      ? typeof event.reason === "string"
        ? event.reason
        : event.reason.message || String(event.reason) || ""
      : "";

    if (
      reasonStr.includes("WebSocket") ||
      reasonStr.includes("websocket") ||
      reasonStr.includes("closed without opened") ||
      reasonStr.includes("failed to connect")
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  window.addEventListener(
    "error",
    function (event) {
      const msg = event.message || "";
      if (
        msg.includes("WebSocket") ||
        msg.includes("websocket") ||
        msg.includes("closed without opened") ||
        msg.includes("failed to connect") ||
        msg.includes("HMR")
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );
})();
