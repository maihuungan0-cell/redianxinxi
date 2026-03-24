import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

    const topBoardIndex = boards.findIndex(b => b.title === "实时榜中榜");
    if (topBoardIndex > -1) {
      const topBoard = boards.splice(topBoardIndex, 1)[0];
      boards.unshift(topBoard);
    }

    res.status(200).json(boards);
  } catch (error) {
    console.error("Scraping error:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
}
