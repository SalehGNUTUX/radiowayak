import React, { useState, useEffect } from 'react';
import { ChevronLeft, FileText, Plus, Minus, AlertCircle, User, Info, ExternalLink, RefreshCw } from 'lucide-react';
import { NewsItem } from '../types';
import { fetchDailyMuslimArticles } from '../services/newsService';

interface ArticlesTabProps {
  articles: NewsItem[]; 
  onClose: () => void;
}

const FONT_SIZE_KEY = 'wayak_article_font_size';

const ArticlesTab: React.FC<ArticlesTabProps> = ({ onClose }) => {
  const [localArticles, setLocalArticles] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [fontSize, setFontSize] = useState(() => {
    const saved = sessionStorage.getItem(FONT_SIZE_KEY);
    return saved ? parseFloat(saved) : 1.2;
  });

  const loadArticles = async () => {
    setLoading(true);
    const data = await fetchDailyMuslimArticles();
    setLocalArticles(data);
    setLoading(false);
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const changeFontSize = (delta: number) => {
    setFontSize(prev => {
      const next = Math.min(Math.max(prev + delta, 0.8), 2.5);
      sessionStorage.setItem(FONT_SIZE_KEY, next.toString());
      return next;
    });
  };

  const handleImageError = (id: string) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  const renderContent = (html: string) => {
    if (!html) return { __html: '' };
    // تنسيق الفقرات للمحتوى الأصلي لضمان تجربة قراءة مريحة
    const styledHtml = html
      .replace(/<p>/g, `<p style="margin-bottom: 1.5em; line-height: 1.8; font-size: ${fontSize}rem; color: rgba(255,255,255,0.9);">`)
      .replace(/<img[^>]*>/g, ""); // نفضل عرض الصورة الرئيسية فقط في الأعلى
    return { __html: styledHtml };
  };

  return (
    <div className="w-full h-full flex flex-col bg-transparent text-white relative">
      {/* Header */}
      <div className="p-6 md:p-8 flex items-center justify-between z-10 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-lg">
            <FileText className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-normal tracking-tight">تأملات حية</h1>
            <p className="text-[10px] text-emerald-400/50 uppercase tracking-[0.3em] mt-1 font-bold">المصدر: مقالات راديو وياك</p>
          </div>
        </div>
        <button 
          onClick={loadArticles}
          disabled={loading}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/10 active:scale-90"
          title="تحديث المحتوى"
        >
          <RefreshCw className={`w-5 h-5 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 md:px-12 pb-44 custom-scrollbar">
        <div className="max-w-7xl mx-auto w-full">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-64 rounded-[40px] ios-glass animate-pulse border border-white/5"></div>
              ))}
            </div>
          ) : localArticles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <AlertCircle className="w-16 h-16 text-emerald-400/50 mb-6" />
              <p className="text-gray-400 text-lg">لم نتمكن من جلب المقالات حالياً.</p>
              <button onClick={loadArticles} className="mt-4 text-emerald-400 underline">إعادة المحاولة</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
              {localArticles.map((item, index) => {
                const hasImageError = imageErrors[item.id] || !item.image;
                return (
                  <div 
                    key={item.id || index} 
                    onClick={() => setSelectedArticle(item)} 
                    className="ios-glass rounded-[40px] overflow-hidden border border-white/5 hover:border-white/20 transition-all cursor-pointer group active:scale-[0.98] shadow-2xl flex flex-col h-full animate-soft-enter"
                  >
                    {!hasImageError && (
                      <div className="h-48 w-full overflow-hidden relative">
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          onError={() => handleImageError(item.id)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                      </div>
                    )}
                    <div className="p-8 flex-1 flex flex-col">
                      <h2 className="text-lg md:text-xl font-normal text-white mb-4 leading-tight group-hover:text-emerald-300 transition-colors line-clamp-3">
                        {item.title}
                      </h2>
                      <div className="text-sm text-gray-400/70 leading-relaxed font-normal line-clamp-3 mb-6">
                        {item.summary}
                      </div>
                      
                      <div className="mt-auto flex items-center justify-between text-[10px] text-white/20 uppercase tracking-widest font-bold border-t border-white/5 pt-4">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" /> {item.author}</span>
                        <span className="flex items-center gap-1"><ExternalLink className="w-3 h-3" /> راديو وياك</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className={`fixed inset-0 z-[110] ios-glass-heavy transition-all duration-700 flex flex-col items-center justify-center ${selectedArticle ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}>
        <div className="w-full h-full max-w-5xl bg-black/95 backdrop-blur-3xl flex flex-col shadow-2xl relative border-x border-white/5">
          <div className="p-6 md:p-10 flex items-center justify-between border-b border-white/5">
            <button 
              onClick={() => setSelectedArticle(null)}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all active:scale-90 border border-white/5"
            >
              <ChevronLeft className="w-6 h-6 text-white rotate-180" />
            </button>
            <div className="flex items-center gap-4">
              <button onClick={() => changeFontSize(-0.1)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg"><Minus className="w-4 h-4" /></button>
              <span className="text-xs text-white/40 uppercase tracking-widest font-bold">حجم الخط</span>
              <button onClick={() => changeFontSize(0.1)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg"><Plus className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12">
            <div className="max-w-3xl mx-auto space-y-8">
              {selectedArticle?.image && !imageErrors[selectedArticle.id] && (
                <div className="rounded-[40px] overflow-hidden shadow-2xl border border-white/10">
                  <img src={selectedArticle.image} alt={selectedArticle.title} className="w-full h-auto object-cover max-h-[50vh]" />
                </div>
              )}
              
              <h1 className="text-2xl md:text-4xl font-normal text-white leading-tight">
                {selectedArticle?.title}
              </h1>

              <div className="flex items-center gap-4 text-emerald-400/60 text-sm">
                <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {selectedArticle?.author}</span>
                <span className="w-1 h-1 rounded-full bg-white/10" />
                <span className="flex items-center gap-1.5"><Info className="w-4 h-4" /> محتوى أصلي</span>
              </div>

              <div 
                className="article-content" 
                dangerouslySetInnerHTML={renderContent(selectedArticle?.content || '')} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticlesTab;
