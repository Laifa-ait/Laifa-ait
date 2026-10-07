import { Request, Response } from "express";
import { validateExternalUrl } from "../../utils/security";
import { corsOptions } from "../../middlewares/security";

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

export async function handleProxyVideo(req: Request, res: Response): Promise<Response | void> {
  try {
    const videoUrl = req.query.url as string;
    if (!videoUrl) {
      return res.status(400).json({ error: "Missing url parameter" });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = validateExternalUrl(videoUrl, false);
    } catch (err) {
      return res.status(400).json({ error: err instanceof Error ? err.message : "Format d'URL invalide" });
    }

    const hostname = parsedUrl.hostname.toLowerCase();
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

    let response: globalThis.Response;
    try {
      response = await fetch(parsedUrl.toString(), {
        signal: controller.signal,
        headers,
        redirect: "error",
      });
    } finally {
      clearTimeout(timeoutId);
    }

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

    const origin = req.headers.origin;
    if (origin && typeof corsOptions.origin === "function") {
      corsOptions.origin(origin, (err: Error | null, allow?: boolean | string | RegExp | Array<boolean | string | RegExp>) => {
        if (!err && allow) {
          res.setHeader("Access-Control-Allow-Origin", origin);
          res.setHeader("Vary", "Origin");
        }
      });
    }
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
}
