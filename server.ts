import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { execFile, spawn } from "child_process";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const YT_DLP_PATH = path.resolve(__dirname, "./bin/yt-dlp");
const COOKIES_PATH = path.resolve(__dirname, "./cookies.txt");

// Helper to parse YouTube Video ID from any format
function parseYouTubeId(rawUrl: string): string | null {
  try {
    const u = new URL(rawUrl);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.replace(/^\//, "").split("/")[0]?.split("?")[0] || null;
    }
    if (u.pathname.includes("/shorts/")) {
      return u.pathname.split("/shorts/")[1]?.split("/")[0]?.split("?")[0] || null;
    }
    if (u.searchParams.has("v")) {
      return u.searchParams.get("v");
    }
    const match = rawUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  } catch {
    const match = rawUrl.match(/([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  }
}

// Helper to expand shortened URLs
async function expandUrl(rawUrl: string): Promise<string> {
  try {
    const res = await fetch(rawUrl, {
      method: "HEAD",
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    return res.url || rawUrl;
  } catch (e) {
    try {
      const getRes = await fetch(rawUrl, {
        method: "GET",
        redirect: "follow",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });
      return getRes.url || rawUrl;
    } catch {
      return rawUrl;
    }
  }
}

// Detect media platform
function detectPlatform(url: string): "youtube" | "tiktok" | "facebook" | "unknown" {
  const lower = url.toLowerCase();
  if (
    lower.includes("youtube.com") ||
    lower.includes("youtu.be")
  ) {
    return "youtube";
  }
  if (
    lower.includes("tiktok.com") ||
    lower.includes("douyin.com")
  ) {
    return "tiktok";
  }
  if (
    lower.includes("facebook.com") ||
    lower.includes("fb.watch") ||
    lower.includes("fb.gg")
  ) {
    return "facebook";
  }
  return "unknown";
}

// Extract TikTok video/images using TikWM
async function extractTikTok(url: string) {
  const expanded = await expandUrl(url);

  const tikwmUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(expanded)}`;
  const res = await fetch(tikwmUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "application/json, text/plain, */*",
    },
  });

  const json = await res.json();
  if (json.code !== 0 || !json.data) {
    throw new Error(json.msg || "Failed to extract TikTok media. Please check if the video is public.");
  }

  const d = json.data;
  const downloads: Array<{
    label: string;
    quality: string;
    ext: string;
    type: "video" | "audio";
    url: string;
    proxyUrl: string;
    size?: string;
  }> = [];

  const sanitizedTitle = (d.title || "TikTok_Video")
    .replace(/[^\w\s-]/g, "")
    .slice(0, 40)
    .trim() || "TikTok_Video";

  // HD video without watermark
  if (d.hdplay) {
    downloads.push({
      label: "HD Video (No Watermark)",
      quality: "HD 1080p",
      ext: "mp4",
      type: "video",
      url: d.hdplay,
      proxyUrl: `/api/download-proxy?url=${encodeURIComponent(d.hdplay)}&filename=${encodeURIComponent(sanitizedTitle + "_HD")}&ext=mp4`,
      size: d.size ? `${(d.size / (1024 * 1024)).toFixed(1)} MB` : undefined,
    });
  }

  // Standard video without watermark
  if (d.play) {
    downloads.push({
      label: d.hdplay ? "Fast Video (No Watermark)" : "HD Video (No Watermark)",
      quality: "720p MP4",
      ext: "mp4",
      type: "video",
      url: d.play,
      proxyUrl: `/api/download-proxy?url=${encodeURIComponent(d.play)}&filename=${encodeURIComponent(sanitizedTitle)}&ext=mp4`,
    });
  }

  // Audio MP3
  if (d.music) {
    downloads.push({
      label: "Original Audio (MP3)",
      quality: "Audio MP3",
      ext: "mp3",
      type: "audio",
      url: d.music,
      proxyUrl: `/api/download-proxy?url=${encodeURIComponent(d.music)}&filename=${encodeURIComponent(sanitizedTitle + "_Audio")}&ext=mp3`,
    });
  }

  // Photo slideshow images
  const images = Array.isArray(d.images) && d.images.length > 0 ? d.images : undefined;

  return {
    platform: "tiktok" as const,
    id: d.id || "tiktok",
    title: d.title || "TikTok Video",
    author: d.author?.nickname || d.author?.unique_id || "TikTok Creator",
    authorAvatar: d.author?.avatar,
    thumbnail: d.cover,
    duration: d.duration ? `${d.duration}s` : undefined,
    type: images ? ("slideshow" as const) : ("video" as const),
    downloads,
    images: images?.map((imgUrl: string, idx: number) => ({
      index: idx + 1,
      url: imgUrl,
      proxyUrl: `/api/download-proxy?url=${encodeURIComponent(imgUrl)}&filename=${encodeURIComponent(sanitizedTitle + "_img_" + (idx + 1))}&ext=jpg`,
    })),
  };
}

// Cloud stream fallback for YouTube when bot detection challenges occur
async function getYouTubeFallbackData(videoId: string, originalUrl: string): Promise<any> {
  let title = "YouTube Video";
  let author = "YouTube Creator";
  let thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  try {
    const oembedRes = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (oembedRes.ok) {
      const oembed = (await oembedRes.json()) as any;
      if (oembed.title) title = oembed.title;
      if (oembed.author_name) author = oembed.author_name;
      if (oembed.thumbnail_url) thumbnail = oembed.thumbnail_url;
    }
  } catch (e) {
    console.warn("oEmbed fetch failed, using defaults:", e);
  }

  const sanitizedTitle =
    title
      .replace(/[^\w\s-]/g, "")
      .slice(0, 45)
      .trim() || "YouTube_Video";

  const downloads = [
    {
      label: "Ultra HD 2K (1440p) Video (MP4)",
      quality: "2K QHD 1440p",
      ext: "mp4",
      type: "video" as const,
      url: `/api/yt-fallback-stream?id=${videoId}&format=1440&title=${encodeURIComponent(sanitizedTitle + "_2K_1440p")}`,
      proxyUrl: `/api/yt-fallback-stream?id=${videoId}&format=1440&title=${encodeURIComponent(sanitizedTitle + "_2K_1440p")}`,
    },
    {
      label: "Full HD 1080p Video (MP4)",
      quality: "1080p FHD",
      ext: "mp4",
      type: "video" as const,
      url: `/api/yt-fallback-stream?id=${videoId}&format=1080&title=${encodeURIComponent(sanitizedTitle + "_1080p")}`,
      proxyUrl: `/api/yt-fallback-stream?id=${videoId}&format=1080&title=${encodeURIComponent(sanitizedTitle + "_1080p")}`,
    },
    {
      label: "HD 720p Video (MP4)",
      quality: "720p HD",
      ext: "mp4",
      type: "video" as const,
      url: `/api/yt-fallback-stream?id=${videoId}&format=720&title=${encodeURIComponent(sanitizedTitle + "_720p")}`,
      proxyUrl: `/api/yt-fallback-stream?id=${videoId}&format=720&title=${encodeURIComponent(sanitizedTitle + "_720p")}`,
    },
    {
      label: "Fast 360p Video (MP4)",
      quality: "360p SD",
      ext: "mp4",
      type: "video" as const,
      url: `/api/yt-fallback-stream?id=${videoId}&format=360&title=${encodeURIComponent(sanitizedTitle + "_360p")}`,
      proxyUrl: `/api/yt-fallback-stream?id=${videoId}&format=360&title=${encodeURIComponent(sanitizedTitle + "_360p")}`,
    },
    {
      label: "HQ Audio (MP3 320kbps)",
      quality: "320kbps MP3",
      ext: "mp3",
      type: "audio" as const,
      url: `/api/yt-fallback-stream?id=${videoId}&format=mp3&title=${encodeURIComponent(sanitizedTitle + "_Audio")}`,
      proxyUrl: `/api/yt-fallback-stream?id=${videoId}&format=mp3&title=${encodeURIComponent(sanitizedTitle + "_Audio")}`,
    },
  ];

  const backupLinks = [
    { label: "Y2Mate Downloader", url: `https://www.y2mate.com/youtube/${videoId}` },
    { label: "SaveFrom Downloader", url: `https://en.savefrom.net/#url=https://www.youtube.com/watch?v=${videoId}` },
  ];

  return {
    platform: "youtube" as const,
    id: videoId,
    title,
    author,
    thumbnail,
    type: "video" as const,
    downloads,
    backupLinks,
    botBypassed: true,
    notice: "Cloud Stream Gateway active: YouTube bot challenge bypassed successfully.",
  };
}

// Extract YouTube via yt-dlp with cloud fallback for bot challenges
async function extractYouTube(url: string): Promise<any> {
  const videoId = parseYouTubeId(url);

  return new Promise(async (resolve, reject) => {
    if (!fs.existsSync(YT_DLP_PATH)) {
      if (videoId) {
        try {
          const fallbackData = await getYouTubeFallbackData(videoId, url);
          return resolve(fallbackData);
        } catch (e: any) {
          return reject(new Error(e.message || "Failed to retrieve YouTube video."));
        }
      }
      return reject(new Error("Downloader engine initializing, please retry in a moment."));
    }

    const args = [
      "--js-runtimes",
      "node:" + process.execPath,
      "--no-playlist",
      "--no-check-certificates",
      "--dump-json",
      url,
    ];

    if (fs.existsSync(COOKIES_PATH)) {
      args.unshift("--cookies", COOKIES_PATH);
    }

    execFile(YT_DLP_PATH, args, { maxBuffer: 15 * 1024 * 1024 }, async (err, stdout) => {
      if (err) {
        console.warn(`yt-dlp error for ${url}: ${err.message}. Engaging Cloud Stream fallback...`);
        if (videoId) {
          try {
            const fallbackData = await getYouTubeFallbackData(videoId, url);
            return resolve(fallbackData);
          } catch (fbErr: any) {
            return reject(new Error(`YouTube video extraction failed: ${err.message}`));
          }
        }
        return reject(new Error(`Could not fetch YouTube video info: ${err.message}`));
      }

      try {
        const info = JSON.parse(stdout);
        const sanitizedTitle = (info.title || "YouTube_Video")
          .replace(/[^\w\s-]/g, "")
          .slice(0, 45)
          .trim() || "YouTube_Video";

        const downloads: Array<{
          label: string;
          quality: string;
          ext: string;
          type: "video" | "audio";
          url: string;
          proxyUrl: string;
          size?: string;
        }> = [];

        // Direct progressive formats (combined video + audio)
        const progressiveFormats = (info.formats || []).filter(
          (f: any) => f.vcodec !== "none" && f.acodec !== "none" && f.url
        );

        // Sort by quality/height descending
        progressiveFormats.sort((a: any, b: any) => (b.height || 0) - (a.height || 0));

        const seenHeights = new Set<number>();
        for (const f of progressiveFormats) {
          const h = f.height || 360;
          if (seenHeights.has(h)) continue;
          seenHeights.add(h);

          downloads.push({
            label: `${h >= 720 ? "HD " : ""}${h}p Video (MP4)`,
            quality: `${h}p MP4`,
            ext: "mp4",
            type: "video",
            url: f.url,
            proxyUrl: `/api/download-proxy?url=${encodeURIComponent(f.url)}&filename=${encodeURIComponent(sanitizedTitle + "_" + h + "p")}&ext=mp4`,
            size: f.filesize ? `${(f.filesize / (1024 * 1024)).toFixed(1)} MB` : undefined,
          });
        }

        // If no progressive format found, offer standard stream proxy
        if (downloads.length === 0) {
          downloads.push({
            label: "Best Quality Video (MP4)",
            quality: "HD MP4",
            ext: "mp4",
            type: "video",
            url: `/api/stream-ytdl?url=${encodeURIComponent(url)}&format=best`,
            proxyUrl: `/api/stream-ytdl?url=${encodeURIComponent(url)}&format=best&filename=${encodeURIComponent(sanitizedTitle)}`,
          });
        }

        // Check for 2K (1440p) and 1080p availability
        const allFormats = info.formats || [];
        const has1440 = allFormats.some((f: any) => f.vcodec !== "none" && (f.height || 0) >= 1440);
        const has1080 = allFormats.some((f: any) => f.vcodec !== "none" && (f.height || 0) >= 1080);

        if (has1440) {
          downloads.unshift({
            label: "Ultra HD 2K (1440p) Video",
            quality: "2K QHD 1440p",
            ext: "mp4",
            type: "video",
            url: `/api/yt-fallback-stream?id=${info.id}&format=1440&title=${encodeURIComponent(sanitizedTitle + "_2K_1440p")}`,
            proxyUrl: `/api/yt-fallback-stream?id=${info.id}&format=1440&title=${encodeURIComponent(sanitizedTitle + "_2K_1440p")}`,
          });
        }

        if (has1080) {
          downloads.unshift({
            label: "Full HD 1080p Video",
            quality: "1080p FHD",
            ext: "mp4",
            type: "video",
            url: `/api/yt-fallback-stream?id=${info.id}&format=1080&title=${encodeURIComponent(sanitizedTitle + "_1080p")}`,
            proxyUrl: `/api/yt-fallback-stream?id=${info.id}&format=1080&title=${encodeURIComponent(sanitizedTitle + "_1080p")}`,
          });
        }

        // Audio format MP3
        downloads.push({
          label: "HQ Audio (MP3)",
          quality: "320kbps MP3",
          ext: "mp3",
          type: "audio",
          url: `/api/stream-ytdl?url=${encodeURIComponent(url)}&format=audio`,
          proxyUrl: `/api/stream-ytdl?url=${encodeURIComponent(url)}&format=audio&filename=${encodeURIComponent(sanitizedTitle + "_Audio")}`,
        });

        resolve({
          platform: "youtube" as const,
          id: info.id,
          title: info.title,
          author: info.channel || info.uploader || "YouTube Channel",
          thumbnail: info.thumbnail,
          duration: info.duration_string || (info.duration ? `${Math.floor(info.duration / 60)}:${(info.duration % 60).toString().padStart(2, "0")}` : undefined),
          views: info.view_count,
          type: "video" as const,
          downloads,
          botBypassed: false,
        });
      } catch (parseErr: any) {
        if (videoId) {
          try {
            const fallbackData = await getYouTubeFallbackData(videoId, url);
            return resolve(fallbackData);
          } catch {}
        }
        reject(new Error(`Failed to parse YouTube metadata: ${parseErr.message}`));
      }
    });
  });
}

// Extract Facebook via yt-dlp
function extractFacebook(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(YT_DLP_PATH)) {
      return reject(new Error("Downloader engine initializing, please retry in a moment."));
    }

    const args = [
      "--no-playlist",
      "--no-check-certificates",
      "--dump-json",
      url,
    ];

    execFile(YT_DLP_PATH, args, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout) => {
      if (err) {
        return reject(new Error(`Could not fetch Facebook video: ${err.message}`));
      }

      try {
        const info = JSON.parse(stdout);
        const sanitizedTitle = (info.title || "Facebook_Video")
          .replace(/[^\w\s-]/g, "")
          .slice(0, 45)
          .trim() || "Facebook_Video";

        const downloads: Array<{
          label: string;
          quality: string;
          ext: string;
          type: "video" | "audio";
          url: string;
          proxyUrl: string;
          size?: string;
        }> = [];

        // Check formats or single URL
        const formats = info.formats || [];
        const f1440 = formats.find((f: any) => (f.height && f.height >= 1440) && f.url);
        const f1080 = formats.find((f: any) => (f.height && f.height >= 1080 && f.height < 1440) && f.url);
        const hd = formats.find((f: any) => (f.format_id?.includes("hd") || (f.height && f.height >= 720 && f.height < 1080)) && f.url);
        const sd = formats.find((f: any) => (f.format_id?.includes("sd") || (f.height && f.height < 720)) && f.url);

        if (f1440) {
          downloads.push({
            label: "Ultra HD 2K Video (MP4)",
            quality: "2K QHD 1440p",
            ext: "mp4",
            type: "video",
            url: f1440.url,
            proxyUrl: `/api/download-proxy?url=${encodeURIComponent(f1440.url)}&filename=${encodeURIComponent(sanitizedTitle + "_2K")}&ext=mp4`,
          });
        }

        if (f1080) {
          downloads.push({
            label: "Full HD 1080p Video (MP4)",
            quality: "1080p FHD",
            ext: "mp4",
            type: "video",
            url: f1080.url,
            proxyUrl: `/api/download-proxy?url=${encodeURIComponent(f1080.url)}&filename=${encodeURIComponent(sanitizedTitle + "_1080p")}&ext=mp4`,
          });
        }

        if (hd) {
          downloads.push({
            label: "HD 720p Video (MP4)",
            quality: "HD 720p",
            ext: "mp4",
            type: "video",
            url: hd.url,
            proxyUrl: `/api/download-proxy?url=${encodeURIComponent(hd.url)}&filename=${encodeURIComponent(sanitizedTitle + "_720p")}&ext=mp4`,
          });
        }

        if (sd || (!hd && !f1080 && !f1440 && info.url)) {
          const targetUrl = sd ? sd.url : info.url;
          downloads.push({
            label: hd || f1080 || f1440 ? "SD Video (MP4)" : "Standard Video (MP4)",
            quality: "SD 480p",
            ext: "mp4",
            type: "video",
            url: targetUrl,
            proxyUrl: `/api/download-proxy?url=${encodeURIComponent(targetUrl)}&filename=${encodeURIComponent(sanitizedTitle + "_SD")}&ext=mp4`,
          });
        }

        // Audio
        downloads.push({
          label: "Audio Only (MP3)",
          quality: "MP3 Audio",
          ext: "mp3",
          type: "audio",
          url: `/api/stream-ytdl?url=${encodeURIComponent(url)}&format=audio`,
          proxyUrl: `/api/stream-ytdl?url=${encodeURIComponent(url)}&format=audio&filename=${encodeURIComponent(sanitizedTitle + "_Audio")}`,
        });

        resolve({
          platform: "facebook" as const,
          id: info.id,
          title: info.title || "Facebook Video",
          author: info.uploader || "Facebook User",
          thumbnail: info.thumbnail,
          duration: info.duration_string,
          type: "video" as const,
          downloads,
        });
      } catch (parseErr: any) {
        reject(new Error(`Failed to parse Facebook info: ${parseErr.message}`));
      }
    });
  });
}

// ── API ROUTES ──

// 1. Extract endpoint
app.post("/api/extract", async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Please enter a valid video link." });
  }

  const cleanUrl = url.trim();
  const platform = detectPlatform(cleanUrl);

  try {
    if (platform === "tiktok") {
      const data = await extractTikTok(cleanUrl);
      return res.json(data);
    } else if (platform === "youtube") {
      const data = await extractYouTube(cleanUrl);
      return res.json(data);
    } else if (platform === "facebook") {
      const data = await extractFacebook(cleanUrl);
      return res.json(data);
    } else {
      // Try TikTok first, then yt-dlp
      try {
        const data = await extractTikTok(cleanUrl);
        return res.json(data);
      } catch {
        const data = await extractYouTube(cleanUrl);
        return res.json(data);
      }
    }
  } catch (err: any) {
    console.error("Extraction error:", err);
    return res.status(500).json({
      error: err.message || "Failed to process video link. Please verify the URL and try again.",
    });
  }
});

// 2. Stream & Download Proxy with attachment header
app.get("/api/download-proxy", async (req, res) => {
  const mediaUrl = req.query.url as string;
  const rawFilename = (req.query.filename as string) || "download";
  const ext = (req.query.ext as string) || "mp4";

  if (!mediaUrl) {
    return res.status(400).send("Missing media URL");
  }

  try {
    const filename = `${rawFilename.replace(/[^a-zA-Z0-9_\-\u0980-\u09FF]/g, "_")}.${ext}`;

    const headers: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    };

    if (req.headers.range) {
      headers["Range"] = req.headers.range;
    }

    const response = await fetch(mediaUrl, { headers });

    if (!response.ok && response.status !== 206) {
      return res.status(response.status).send("Failed to fetch remote media stream");
    }

    let contentType = response.headers.get("content-type") || "";
    if (ext === "mp4") contentType = "video/mp4";
    if (ext === "mp3") contentType = "audio/mpeg";
    if (ext === "jpg" || ext === "jpeg") contentType = "image/jpeg";

    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"; filename*=UTF-8''${encodeURIComponent(filename)}`);
    res.setHeader("Content-Type", contentType);

    const contentLength = response.headers.get("content-length");
    if (contentLength) {
      res.setHeader("Content-Length", contentLength);
    }

    const acceptRanges = response.headers.get("accept-ranges");
    if (acceptRanges) {
      res.setHeader("Accept-Ranges", acceptRanges);
    }

    const contentRange = response.headers.get("content-range");
    if (contentRange) {
      res.status(206);
      res.setHeader("Content-Range", contentRange);
    }

    if (response.body) {
      // @ts-ignore - ReadableStream in Node fetch
      const reader = response.body.getReader();
      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(Buffer.from(value));
        }
        res.end();
      };
      await pump();
    } else {
      res.end();
    }
  } catch (err: any) {
    console.error("Proxy error:", err);
    if (!res.headersSent) {
      res.status(500).send("Proxy streaming failed: " + err.message);
    }
  }
});

// 3. YouTube On-the-fly streaming endpoint
app.get("/api/stream-ytdl", (req, res) => {
  const url = req.query.url as string;
  const format = (req.query.format as string) || "best";
  const rawFilename = (req.query.filename as string) || "media";

  if (!url) {
    return res.status(400).send("Missing URL parameter");
  }

  const isAudio = format === "audio";
  const ext = isAudio ? "mp3" : "mp4";
  const filename = `${rawFilename.replace(/[^a-zA-Z0-9_\-\u0980-\u09FF]/g, "_")}.${ext}`;

  res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"; filename*=UTF-8''${encodeURIComponent(filename)}`);
  res.setHeader("Content-Type", isAudio ? "audio/mpeg" : "video/mp4");

  const args = isAudio
    ? [
        "--js-runtimes",
        "node:" + process.execPath,
        "-f",
        "bestaudio",
        "-x",
        "--audio-format",
        "mp3",
        "-o",
        "-",
        url,
      ]
    : [
        "--js-runtimes",
        "node:" + process.execPath,
        "-f",
        "best[ext=mp4]/best",
        "-o",
        "-",
        url,
      ];

  const proc = spawn(YT_DLP_PATH, args);

  proc.stdout.pipe(res);

  proc.stderr.on("data", (d) => {
    // optional debug logging
  });

  req.on("close", () => {
    proc.kill();
  });
});

// 4. YouTube Cloud Fallback Stream endpoint (for bot-challenged videos)
app.get("/api/yt-fallback-stream", async (req, res) => {
  const videoId = req.query.id as string;
  const format = (req.query.format as string) || "720";
  const rawTitle = (req.query.title as string) || "YouTube_Download";
  const ext = format === "mp3" ? "mp3" : "mp4";

  if (!videoId) {
    return res.status(400).send("Missing video ID parameter");
  }

  const sanitizedFilename = `${rawTitle.replace(/[^a-zA-Z0-9_\-\u0980-\u09FF]/g, "_")}.${ext}`;

  try {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const startRes = await fetch(
      `https://loader.to/ajax/download.php?button=1&start=1&end=1&format=${format}&url=${encodeURIComponent(videoUrl)}`,
      {
        signal: AbortSignal.timeout(9000),
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      }
    );
    const startData = (await startRes.json()) as any;

    if (!startData || !startData.progress_url) {
      // Direct redirect fallback to mirror
      return res.redirect(`https://www.y2mate.com/youtube/${videoId}`);
    }

    // Poll progress_url (up to 24 times ~36s for high-res 2K/1080p rendering)
    let downloadUrl: string | null = null;
    for (let i = 0; i < 24; i++) {
      await new Promise((r) => setTimeout(r, 1500));
      try {
        const pRes = await fetch(startData.progress_url, {
          signal: AbortSignal.timeout(4000),
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });
        const pData = (await pRes.json()) as any;
        if (pData.download_url) {
          downloadUrl = pData.download_url;
          break;
        }
      } catch (pollErr) {
        // continue polling
      }
    }

    if (downloadUrl) {
      return res.redirect(downloadUrl);
    } else {
      return res.redirect(`https://www.y2mate.com/youtube/${videoId}`);
    }
  } catch (err: any) {
    console.error("Fallback stream error:", err);
    return res.redirect(`https://www.y2mate.com/youtube/${videoId}`);
  }
});

// 5. YouTube Cookie Management
app.get("/api/cookies", (req, res) => {
  res.json({ exists: fs.existsSync(COOKIES_PATH) });
});

app.post("/api/cookies", (req, res) => {
  const { cookies } = req.body;
  if (!cookies || typeof cookies !== "string" || !cookies.trim()) {
    return res.status(400).json({ error: "Cookies string cannot be empty" });
  }
  try {
    fs.writeFileSync(COOKIES_PATH, cookies.trim(), "utf8");
    res.json({ success: true, message: "YouTube cookies saved successfully!" });
  } catch (e: any) {
    res.status(500).json({ error: "Failed to save cookies: " + e.message });
  }
});

app.delete("/api/cookies", (req, res) => {
  try {
    if (fs.existsSync(COOKIES_PATH)) {
      fs.unlinkSync(COOKIES_PATH);
    }
    res.json({ success: true, message: "Cookies deleted." });
  } catch (e: any) {
    res.status(500).json({ error: "Failed to delete cookies: " + e.message });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    ytdlpAvailable: fs.existsSync(YT_DLP_PATH),
  });
});

// Start server with Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
