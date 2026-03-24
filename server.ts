import express from "express";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import * as cheerio from "cheerio";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes
  app.get("/api/hot-boards", async (req, res) => {
    try {
      const response = await axios.get("https://tophub.today/", {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
      });
      const $ = cheerio.load(response.data);
      let boards: any[] = [];
      const excludeList = [
        "淘宝 ‧ 天猫", "IT之家", "掘金", "即刻圈子", "机器之心", 
        "Product Hunt", "GitHub", "游研社", "3DM游戏网", "机核网", 
        "七猫中文网", "IMDb", "高楼迷", "厦门小鱼", "开眼视频", 
        "AcFun", "吾爱破解", "今日热卖", "淘宝", "雪球", 
        "水木社区", "北邮人论坛", "北大未名"
      ];

      $(".cc-cd").each((i, el) => {
        const title = $(el).find(".cc-cd-lb span").text().trim();
        if (excludeList.includes(title)) return;
        
        // Deduplicate: If we already have a board with this title, skip it
        if (boards.some(b => b.title === title)) return;

        const icon = $(el).find(".cc-cd-lb img").attr("src");
        const items: any[] = [];

        $(el).find(".cc-cd-cb-l a").each((j, itemEl) => {
          const itemTitle = $(itemEl).find(".t").text().trim();
          const itemLink = $(itemEl).attr("href");
          const itemHeat = $(itemEl).find(".e").text().trim();
          items.push({ title: itemTitle, link: itemLink, heat: itemHeat });
        });

        if (title && items.length > 0) {
          boards.push({ title, icon, items });
        }
      });

      // Reorder: Put "实时榜中榜" at the front
      const topBoardIndex = boards.findIndex(b => b.title === "实时榜中榜");
      if (topBoardIndex > -1) {
        const topBoard = boards.splice(topBoardIndex, 1)[0];
        boards.unshift(topBoard);
      }

      res.json(boards);
    } catch (error) {
      console.error("Scraping error:", error);
      res.status(500).json({ error: "Failed to fetch data" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
