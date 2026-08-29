import { Router, Request, Response } from "express";
import { db } from "../../config/firebase-admin";
import { CoreService, LogErrorBody } from "../../services/CoreService";

const router = Router();

// GET proxy video with whitelist protection
router.get("/api/v1/proxy-video", async (req: Request, res: Response) => {
  try {
    const videoUrl = req.query.url as string;
    if (!videoUrl) {
      return res.status(400).json({ error: "Missing url parameter" });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(videoUrl);
    } catch {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return res.status(400).json({ error: "Invalid protocol" });
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    const isLocalhost =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname === "[::1]";

    if (isLocalhost) {
      return res.status(403).json({ error: "Access to local network resources is forbidden" });
    }

    const ALLOWED_VIDEO_HOSTS = [
      "commondatastorage.googleapis.com",
      "storage.googleapis.com",
      "firebasestorage.googleapis.com",
      "videos.pexels.com",
      "assets.mixkit.co",
      "cdn.pixabay.com",
      "vimeo.com",
      "player.vimeo.com",
      "cloudinary.com",
      "res.cloudinary.com",
    ];

    const isAllowedHost = ALLOWED_VIDEO_HOSTS.some(
      (allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`)
    );

    if (!isAllowedHost) {
      return res.status(403).json({ error: "Video host not in allowed proxy list" });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const headers: Record<string, string> = {
      "User-Agent": "Olmart-Video-Proxy/1.0",
    };
    if (req.headers.range) {
      headers["Range"] = req.headers.range;
    }

    const response = await fetch(videoUrl, {
      signal: controller.signal,
      headers,
    });
    clearTimeout(timeoutId);

    if (!response.ok && response.status !== 206) {
      return res.status(response.status).json({ error: `Upstream returned status ${response.status}` });
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType && !contentType.startsWith("video/") && !contentType.startsWith("application/octet-stream")) {
      return res.status(400).json({ error: "Requested resource is not a video" });
    }

    res.status(response.status);
    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (
        [
          "content-type",
          "content-length",
          "accept-ranges",
          "content-range",
          "cache-control",
          "etag",
          "last-modified",
        ].includes(lowerKey)
      ) {
        res.setHeader(key, value);
      }
    });

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Range");
    res.setHeader("Access-Control-Expose-Headers", "Content-Range, Content-Length, Accept-Ranges");

    if (!response.body) {
      return res.end();
    }

    const reader = response.body.getReader();
    const pump = async (): Promise<void> => {
      try {
        const { done, value } = await reader.read();
        if (done) {
          res.end();
          return;
        }
        res.write(Buffer.from(value));
        return pump();
      } catch {
        res.end();
      }
    };
    return pump();
  } catch (error: unknown) {
    if (!res.headersSent) {
      return res.status(502).json({ error: error instanceof Error ? error.message : "Erreur proxy vidéo" });
    }
  }
});

// GET public homepage data
router.get("/api/v1/public/home-data", async (_req: Request, res: Response) => {
  try {
    const data = await CoreService.getHomeData();
    return res.json(data);
  } catch (err: unknown) {
    return res.status(500).json({ error: err instanceof Error ? err.message : "Erreur interne" });
  }
});

// GET public settings
router.get("/api/v1/public/settings", async (_req: Request, res: Response) => {
  try {
    const data = await CoreService.getPublicSettings();
    return res.json(data);
  } catch (err: unknown) {
    return res.status(500).json({ error: err instanceof Error ? err.message : "Erreur interne" });
  }
});

// POST log client site errors
router.post("/api/v1/logs/error", async (req: Request, res: Response) => {
  try {
    await CoreService.logError(req.body as LogErrorBody);
    return res.json({ success: true });
  } catch (err: unknown) {
    return res.status(500).json({ error: err instanceof Error ? err.message : "Erreur interne" });
  }
});

// GET public profiles list
router.get("/api/v1/public-profiles", async (_req: Request, res: Response) => {
  try {
    const snap = await db.collection("publicProfiles").limit(100).get();
    const profiles = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.json({ profiles });
  } catch (err: unknown) {
    return res.status(500).json({ error: err instanceof Error ? err.message : "Erreur interne" });
  }
});

export default router;
