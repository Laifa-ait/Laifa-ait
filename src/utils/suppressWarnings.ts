/**
 * Utility to suppress benign HMR and Firestore WebSocket warnings/errors in console.
 * Imported in main.tsx so index.html doesn't require inline scripts.
 */
(function () {
  if (typeof window === "undefined") return;

  const originalError = console.error;
  console.error = function (...args: unknown[]) {
    if (
      args[0] &&
      typeof args[0] === "string" &&
      (args[0].includes("[vite] failed to connect to websocket") ||
        args[0].includes("WebSocket connection to") ||
        args[0].includes("WebSocket closed without opened.") ||
        args[0].includes("WebChannelConnection") ||
        args[0].includes("RPC 'Listen' stream"))
    ) {
      return;
    }
    if (
      args[1] &&
      typeof args[1] === "object" &&
      args[1] !== null &&
      (("message" in args[1] && typeof (args[1] as { message: unknown }).message === "string" && ((args[1] as { message: string }).message.includes("WebSocket"))) ||
        (typeof args[1] === "string" && (args[1] as string).includes("WebSocket")))
    ) {
      return;
    }
    originalError.apply(console, args as Parameters<typeof console.error>);
  };

  const originalWarn = console.warn;
  console.warn = function (...args: unknown[]) {
    if (
      args[0] &&
      typeof args[0] === "string" &&
      (args[0].includes("[vite] failed to connect to websocket") ||
        args[0].includes("WebSocket connection to") ||
        args[0].includes("WebSocket closed without opened.") ||
        args[0].includes("WebChannelConnection") ||
        args[0].includes("RPC 'Listen' stream"))
    ) {
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
