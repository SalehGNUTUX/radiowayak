
import React, { useState, useEffect } from 'react';
import { Newspaper, ChevronLeft, RefreshCw, ArrowDown, X, AlertCircle } from 'lucide-react';
import { NewsItem } from '../types';
// Fix: Import fetchDailyMuslimArticles which is the correct exported function from newsService
import { fetchDailyMuslimArticles } from '../services/newsService';

interface NewsTabProps {
  onClose: () => void;
}

const NewsTab: React.FC<NewsTabProps> = ({ onClose }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moreLoading, setMoreLoading] = useState(false);
  const [page, setPage] = useState(1);
  // Add hasMore state to track if there are more pages available
  const [hasMore, setHasMore] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  // دالة للحصول على التاريخ الهجري الحالي كنص موحد للتحقق
  // Helper function to get the current Hijri date as a string (matching ArticlesTab implementation)
  const getHijriDateString = () => {
    try {
      return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
        day: 'numeric', month: 'long', year: 'numeric'
      }).format(new Date());
    } catch {
      return new Date().toDateString(); // fallback
    }
  };

  const loadNews = async (isRefresh = false) => {
    if (isRefresh) {
      setLoading(true);
      setError(null);
      setPage(1);
      setHasMore(true);
    } else {
      setMoreLoading(true);
    }

    try {
      // Fix: Added the required hijriDate argument to fetchDailyMuslimArticles
      const data = await fetchDailyMuslimArticles(getHijriDateString());
      if (isRefresh) {
        // Corrected: data is the actual array
        setNews(data);
      } else {
        // Corrected: Spread data to append it to previous news
        setNews(prev => [...prev, ...data]);
      }
      // Update hasMore state based on response (fetchDailyMuslimArticles is not paginated in current impl)
      setHasMore(false);
    } catch (err: any) {
      setError("حدث خطأ أثناء جلب الأخبار. يرجى المحاولة لاحقاً.");
    } finally {
      setLoading(false);
      setMoreLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!moreLoading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (page > 1) {
      loadNews(false);
    }
  }, [page]);

  useEffect(() => {
    loadNews(true);
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-transparent text-white relative">
      <div className="p-6 md:p-8 flex items-center justify-between z-10 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-lg">
            <Newspaper className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
          </div>
          <h1 className="text-xl md:text-2xl font-normal tracking-tight">أخبار العالم الإسلامي</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => loadNews(true)} 
            disabled={loading || moreLoading}
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-all active:scale-90 border border-white/5"
            title="تحديث"
          >
            <RefreshCw className={`w-5 h-5 text-white/60 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-all active:scale-90 border border-white/5"
            title="إغلاق"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 md:px-12 pb-40 custom-scrollbar">
        <div className="max-w-7xl mx-auto w-full">
          {loading && news.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-64 rounded-[32px] ios-glass animate-pulse border border-white/5"></div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <AlertCircle className="w-12 h-12 text-red-400/50 mb-4" />
              <p className="text-gray-400 text-sm max-w-xs leading-relaxed">{error}</p>
              <button 
                onClick={() => loadNews(true)}
                className="mt-6 px-6 py-2 bg-white/5 hover:bg-white/10 rounded-full text-xs text-white/60 transition-all border border-white/5"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : (
            <div className="pb-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map((item, index) => (
                  <div 
                    key={`${item.id}-${index}`}
                    onClick={() => setSelectedArticle(item)}
                    className="ios-glass rounded-[32px] p-6 md:p-8 border border-white/5 hover:border-white/20 transition-all cursor-pointer group active:scale-[0.98] shadow-lg flex flex-col h-full animate-soft-enter"
                  >
                    <h2 className="text-lg md:text-xl font-normal text-white mb-4 leading-tight group-hover:text-blue-300 transition-colors">
                      {item.title}
                    </h2>
                    <div className="text-sm text-gray-400/80 leading-relaxed font-normal flex-1">
                      {item.summary}
                    </div>
                  </div>
                ))}
              </div>

              {hasMore && (
                <div className="pt-12 pb-4 flex justify-center">
                  <button 
                    onClick={handleLoadMore}
                    disabled={moreLoading}
                    className="px-12 py-4 bg-white/5 hover:bg-white/10 rounded-full text-sm md:text-base text-white/70 hover:text-white transition-all border border-white/5 shadow-lg active:scale-95 flex items-center gap-2 disabled:opacity-50"
                  >
                    {moreLoading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>عرض المزيد من الأخبار</span>
                        <ArrowDown className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={`
        fixed inset-0 z-[60] ios-glass-heavy transition-all duration-500 flex flex-col items-center justify-center
        ${selectedArticle ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}
      `}>
        <div className="w-full h-full max-w-5xl md:max-w-4xl lg:max-w-5xl bg-black/60 backdrop-blur-3xl flex flex-col p-6 md:p-10 shadow-2xl relative border-x border-white/5">
            <div className="flex items-center gap-4 mb-8">
              <button 
                onClick={() => setSelectedArticle(null)}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all active:scale-90 border border-white/5"
              >
                <ChevronLeft className="w-6 h-6 text-white rotate-180" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 md:pr-4">
              <div className="space-y-8 max-w-4xl mx-auto">
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-normal text-white leading-tight">
                  {selectedArticle?.title}
                </h1>
                
                <div className="border-b border-white/5 w-full"></div>

                <div className="pb-32">
                  <div className="text-gray-200 leading-relaxed text-lg md:text-xl lg:text-2xl font-normal whitespace-pre-wrap">
                    {selectedArticle?.content}
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default NewsTab;
