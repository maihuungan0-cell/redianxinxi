import React, { useEffect, useState, useRef } from 'react';
import { TrendingUp, RefreshCw, ExternalLink, Search, Menu, Bell, User, Sparkles, ArrowRight, Copy, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HotItem {
  title: string;
  link: string;
  heat: string;
}

interface HotBoard {
  title: string;
  icon: string;
  items: HotItem[];
}

interface AIResult {
  titles: string[];
  keywords: string[];
  strategy: string;
}

export default function App() {
  const [boards, setBoards] = useState<HotBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const resultsRef = useRef<HTMLDivElement>(null);

  const fetchBoards = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/hot-boards');
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setBoards(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError('无法获取热榜数据，请稍后再试。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
    const interval = setInterval(fetchBoards, 1000 * 60 * 30); // Refresh every 30 mins
    return () => clearInterval(interval);
  }, []);

  const handleAIMining = async () => {
    if (!searchTerm.trim()) return;
    
    setIsGeneratingAI(true);
    setAiResult(null);
    setError(null);
    
    try {
      const response = await fetch('/api/ai-mining', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchTerm }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "AI 挖掘失败，请稍后再试。");
      }
      
      const data = await response.json();
      setAiResult(data);
      
      // Scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error("AI Generation Error:", err);
      const msg = err instanceof Error ? err.message : "AI 挖掘失败，请检查网络或稍后再试。";
      setError(msg);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const filteredBoards = boards.filter(board => 
    board.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    board.items.some(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200 px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-xl shadow-lg shadow-indigo-200">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">TrendBurst</h1>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchBoards}
            disabled={loading}
            className="p-2 hover:bg-slate-100 rounded-full transition-all disabled:opacity-50 text-slate-500"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="h-4 w-[1px] bg-slate-200 mx-1"></div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live</span>
          </div>
        </div>
      </nav>

      {/* Hero Section - Search Moved to Top Center */}
      <header className="relative pt-16 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-50 rounded-full blur-[120px] opacity-50"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[100px] opacity-30"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-[0.2em] mb-6 border border-indigo-100">
              DeepSeek AI 爆款挖掘机
            </span>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 mb-8 leading-[0.9]">
              热点信息
            </h2>
            
            {/* Main Search Bar */}
            <div className="relative max-w-2xl mx-auto group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000 group-focus-within:duration-200"></div>
              <div className="relative flex items-center bg-white rounded-2xl shadow-xl border border-slate-200 p-2">
                <Search className="w-6 h-6 text-slate-400 ml-4" />
                <input 
                  type="text" 
                  placeholder="输入关键词，开启爆款挖掘..." 
                  className="flex-1 bg-transparent border-none px-4 py-3 text-lg outline-none text-slate-800 placeholder:text-slate-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAIMining()}
                />
                <button 
                  onClick={handleAIMining}
                  disabled={isGeneratingAI || !searchTerm.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none"
                >
                  {isGeneratingAI ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                  <span>AI 挖掘</span>
                </button>
              </div>
            </div>
            
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {['AI 绘画', '自媒体创业', '春季穿搭', '数码测评', '职场避雷'].map(tag => (
                <button 
                  key={tag}
                  onClick={() => setSearchTerm(tag)}
                  className="text-xs font-medium text-slate-500 hover:text-indigo-600 px-3 py-1.5 bg-white rounded-full border border-slate-200 hover:border-indigo-200 transition-all"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 pb-32">
        {/* AI Results Section */}
        <AnimatePresence>
          {aiResult && (
            <motion.section 
              ref={resultsRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-20"
            >
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-indigo-100 overflow-hidden">
                <div className="p-6 md:p-8 border-b border-slate-100 bg-gradient-to-br from-indigo-50/50 to-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black tracking-tight text-slate-900">AI 挖掘结果</h3>
                      <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">DeepSeek AI Engine</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setAiResult(null)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    清除结果
                  </button>
                </div>
                
                <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Explosive Titles */}
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      爆款标题建议
                    </h4>
                    <div className="space-y-4">
                      {aiResult.titles.map((title, i) => (
                        <div key={i} className="group relative bg-slate-50 rounded-2xl p-4 border border-slate-100 hover:border-indigo-200 transition-all">
                          <p className="text-slate-800 font-bold leading-relaxed pr-10">{title}</p>
                          <button 
                            onClick={() => copyToClipboard(title, i)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white rounded-lg shadow-sm border border-slate-200 opacity-0 group-hover:opacity-100 transition-all text-slate-400 hover:text-indigo-600"
                          >
                            {copiedIndex === i ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Long-tail Keywords & Strategy */}
                  <div className="space-y-12">
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        长尾热词挖掘
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {aiResult.keywords.map((kw, i) => (
                          <span key={i} className="px-4 py-2 bg-white rounded-xl border border-slate-200 text-sm font-bold text-slate-700 shadow-sm">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl"></div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-indigo-300 mb-4">运营策略建议</h4>
                      <p className="text-lg font-medium leading-relaxed italic">
                        "{aiResult.strategy}"
                      </p>
                      <div className="mt-6 flex items-center gap-2 text-indigo-300 text-xs font-bold">
                        <ArrowRight className="w-4 h-4" />
                        <span>建议立即发布，抓住流量窗口期</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Today's Hot List Section - Renamed to "今日趋势参考" */}
        <section>
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-3xl font-black tracking-tighter text-slate-900">今日趋势参考</h3>
              <p className="text-slate-500 font-medium mt-1">聚合全网实时热点，发现下一个爆款灵感</p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-400 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
              <RefreshCw className="w-3 h-3" />
              <span>最后更新: {lastUpdated.toLocaleTimeString()}</span>
            </div>
          </div>

          {loading && boards.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm animate-pulse">
                  <div className="h-6 w-32 bg-slate-100 rounded-lg mb-6"></div>
                  <div className="space-y-4">
                    {[...Array(8)].map((_, j) => (
                      <div key={j} className="h-4 bg-slate-50 rounded w-full"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredBoards.map((board, index) => (
                  <motion.section
                    key={board.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all overflow-hidden flex flex-col group"
                  >
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <h3 className="font-black text-xs uppercase tracking-widest text-slate-900">{board.title}</h3>
                      <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                    </div>
                    
                    <div className="flex-1 p-3">
                      <ul className="space-y-1">
                        {board.items.slice(0, 10).map((item, i) => (
                          <li key={i}>
                            <a 
                              href={item.link.startsWith('http') ? item.link : `https://tophub.today${item.link}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group/item flex items-start gap-3 p-2.5 rounded-2xl hover:bg-indigo-50 transition-all"
                            >
                              <span className={`text-[10px] font-black mt-1 w-4 flex-shrink-0 text-center ${
                                i < 3 ? 'text-indigo-600' : 'text-slate-300'
                              }`}>
                                {String(i + 1).padStart(2, '0')}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold leading-snug text-slate-700 group-hover/item:text-indigo-900 transition-colors line-clamp-2">
                                  {item.title}
                                </p>
                                {item.heat && (
                                  <span className="text-[10px] font-black text-slate-300 mt-1 block uppercase tracking-tighter">
                                    {item.heat}
                                  </span>
                                )}
                              </div>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.section>
                ))}
              </AnimatePresence>
            </div>
          )}

          {filteredBoards.length === 0 && !loading && (
            <div className="py-32 text-center">
              <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">未找到相关趋势</h3>
              <p className="text-slate-500 mt-2 font-medium">换个词试试，或者点击刷新获取最新动态</p>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 py-20 px-4 md:px-8 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-12">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-2xl">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <span className="text-2xl font-black tracking-tighter block">TrendBurst</span>
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">AI Trend Intelligence</span>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-10 text-sm font-bold text-slate-400">
              <a href="#" className="hover:text-white transition-colors">爆款挖掘</a>
              <a href="#" className="hover:text-white transition-colors">趋势参考</a>
              <a href="#" className="hover:text-white transition-colors">数据来源</a>
              <a href="#" className="hover:text-white transition-colors">联系我们</a>
            </div>
          </div>
          <div className="h-[1px] bg-slate-800 w-full mb-12"></div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <p>© 2026 TrendBurst. Powered by DeepSeek AI.</p>
            <p>Data aggregated from TopHub & Social Media.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
