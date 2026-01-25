import React, { useState, useEffect, useMemo } from 'react';
import { Settings2, Moon, Clock, X, Calendar } from 'lucide-react';
import HorizontalVisualizer from './HorizontalVisualizer';

interface NewsObject {
  title: string;
  content: string;
  link?: string;
  author?: string;
}

interface FullRadioPlayerProps {
  syncState: any;
  metadata: any;
  quality: string;
  setQuality: (q: any) => void;
  setShowQualityMenu: (v: boolean) => void;
  setShowSleepModal: (v: boolean) => void;
  sleepRemaining: number | null;
  showNews: boolean;
  setShowNews: (v: boolean) => void;
  showAlbumArt: boolean;
  newsFontSize?: number;
  newsSpeed?: number;
  immersiveArt?: boolean;
  onNewsClick?: (news: any) => void;
}

const FullRadioPlayer: React.FC<FullRadioPlayerProps> = ({ 
  syncState, 
  metadata, 
  setShowQualityMenu, 
  setShowSleepModal, 
  sleepRemaining,
  showNews,
  setShowNews,
  showAlbumArt,
  newsFontSize = 11,
  newsSpeed = 450,
  immersiveArt = false,
  onNewsClick
}) => {
  const [newsItems, setNewsItems] = useState<NewsObject[]>([]);
  const [hijriDate, setHijriDate] = useState<string>('');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const sources = [
          'https://tg.i-c-a.su/rss/radiowayakart',
          'https://ch2rss.fflow.net/gazanewnow2021',
          'https://tg.i-c-a.su/rss/Sd_News_Network',
          'https://tg.i-c-a.su/rss/AJPalestine'
        ];
        
        const fetchPromises = sources.map(src => 
          fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(src)}`)
            .then(res => res.json())
            .catch(() => ({ status: 'error' }))
        );

        const results = await Promise.all(fetchPromises);
        let allItems: NewsObject[] = [];

        results.forEach(data => {
          if (data.status === 'ok' && data.items) {
            data.items.forEach((item: any) => {
              allItems.push({
                title: item.title.replace(/\s+/g, ' ').trim(),
                content: item.content || item.description || "لا يوجد محتوى متاح لهذا الخبر حالياً.",
                link: item.link,
                author: item.author || data.feed.title
              });
            });
          }
        });

        if (allItems.length > 0) {
          setNewsItems(allItems.sort(() => Math.random() - 0.5));
        } else {
          setNewsItems([{ title: "متابعات مستمرة لأخبار الأمة الإسلامية", content: "راديو وياك صوت واحد يجمع قضايا المسلمين" }]);
        }
      } catch (error) {
        setNewsItems([{ title: "متابعات مستمرة لأخبار الأمة الإسلامية", content: "فشل الاتصال بمصادر الأخبار حالياً" }]);
      }
    };

    const getHijriDate = () => {
      try {
        const date = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }).format(new Date());
        setHijriDate(date);
      } catch (e) {
        setHijriDate('');
      }
    };

    fetchNews();
    getHijriDate();
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col items-center animate-soft-enter bg-transparent">
      <style>{`
        @keyframes marquee-flow {
          0% { transform: translateX(0); }
          100% { transform: translateX(50%); }
        }
        .continuous-news-track {
          display: inline-block;
          white-space: nowrap;
          animation: marquee-flow ${newsSpeed}s linear infinite; 
          will-change: transform;
        }
        .continuous-news-track:hover {
          animation-play-state: paused;
        }
        .news-mask {
          mask-image: linear-gradient(90deg, transparent 0%, #000 5%, #000 95%, transparent 100%);
          -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 5%, #000 95%, transparent 100%);
        }
      `}</style>

      {/* Visualizer Layer */}
      <div className="absolute inset-0 z-10 opacity-30 pointer-events-none">
        <HorizontalVisualizer analyser={syncState.analyser} isPlaying={syncState.isPlaying} />
      </div>

      <div className="relative z-20 flex flex-col items-center h-full w-full py-10 px-6 overflow-hidden">
        
        {/* News Section */}
        {showNews && newsItems.length > 0 && (
          <div className="w-full max-w-2xl mb-4 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="ios-glass rounded-full h-11 px-4 flex items-center gap-3 border border-white/10 shadow-xl overflow-hidden relative bg-blue-950/10" dir="rtl">
              <button 
                onClick={() => setShowNews(false)} 
                className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/40 transition-all active:scale-90"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="flex-1 news-mask overflow-hidden h-full flex items-center">
                <div className="continuous-news-track text-white/95 font-medium flex items-center">
                  {[...newsItems, ...newsItems].map((item, idx) => (
                    <React.Fragment key={idx}>
                      <span 
                        onClick={() => onNewsClick?.(item)}
                        className="cursor-pointer hover:text-blue-400 transition-colors px-1"
                        style={{ fontSize: `${newsFontSize}px` }}
                      >
                        {item.title}
                      </span>
                      <span className="text-white/20 px-4 select-none">•</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-1.5 bg-blue-600/30 px-3 py-1 rounded-full border border-blue-500/40">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">أخبار</span>
              </div>
            </div>
          </div>
        )}

        {/* Top Controls */}
        <div className="w-full max-w-2xl flex items-start justify-between mb-auto">
          <div className="flex flex-col gap-2 items-start">
            <div className="flex items-center gap-2">
              <button onClick={() => setShowQualityMenu(true)} className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:bg-white/20 transition-all active:scale-90 shadow-lg"><Settings2 className="w-5 h-5" /></button>
              {hijriDate && (
                <div className="h-11 px-4 rounded-full bg-white/5 backdrop-blur-md border border-white/5 flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-500 shadow-sm">
                  <Calendar className="w-3.5 h-3.5 text-blue-400/60" />
                  <span className="text-[10px] text-white/70 font-medium whitespace-nowrap" dir="rtl">{hijriDate}</span>
                </div>
              )}
            </div>
            <button 
              onClick={() => setShowSleepModal(true)} 
              className={`h-11 rounded-full backdrop-blur-md border flex items-center justify-center transition-all duration-500 active:scale-90 shadow-lg ${sleepRemaining ? 'w-auto px-4 bg-purple-600/30 text-white border-purple-400/50' : 'w-11 bg-white/10 text-white/80 border-white/10'}`}
            >
                {sleepRemaining ? (
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-purple-300" />
                    <span className="text-[11px] font-bold tabular-nums leading-none">
                      {Math.floor(sleepRemaining / 60)}:{String(sleepRemaining % 60).padStart(2, '0')}
                    </span>
                  </div>
                ) : (
                  <Moon className="w-5 h-5" />
                )}
            </button>
          </div>
          <div className="px-5 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center gap-2 shadow-xl h-11">
            <div className={`w-2 h-2 rounded-full ${syncState.isPlaying ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} /><span className="text-[10px] font-bold uppercase tracking-widest text-white/90">بث مباشر</span>
          </div>
        </div>

        {/* INFO CONTAINER: LEFT-ALIGNED (Reversed direction) */}
        <div 
          className={`flex-1 flex flex-col w-full max-w-5xl transition-all duration-700 animate-in zoom-in-95 items-start pl-8 md:pl-24 ${immersiveArt ? 'justify-end pb-32' : 'justify-center pb-16'}`}
          dir="rtl"
        >
            {/* Song Info Block: Left Aligned */}
            <div 
              className="flex flex-col space-y-3 items-start text-left animate-in slide-in-from-left-10" 
            >
                {/* Song Album */}
                <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold text-white drop-shadow-[0_4px_16px_rgba(0,0,0,1)] tracking-tight leading-tight">
                  {metadata.album || 'راديو وياك'}
                </h1>
                
                {/* Song Title */}
                <p className="text-xl md:text-2xl lg:text-4xl text-blue-300 font-semibold drop-shadow-[0_2px_12px_rgba(0,0,0,1)] opacity-95">
                  {metadata.title || 'بث مباشر'}
                </p>
                
                {/* Song Artist */}
                <div className="flex items-center mt-2 justify-start">
                  <span className="text-sm md:text-xl lg:text-2xl text-white/70 font-light tracking-widest uppercase drop-shadow-md whitespace-nowrap">
                    {metadata.artist || 'أهلاً بك'}
                  </span>
                </div>
            </div>
            
            {/* Empty space for balance if no foreground art */}
            {(!showAlbumArt && !immersiveArt) && <div className="w-full max-w-md h-24 opacity-0" />}
        </div>
      </div>
    </div>
  );
};

export default FullRadioPlayer;