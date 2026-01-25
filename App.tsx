
import React, { useState, useEffect, useCallback, useRef } from 'react';
import RadioPlayer from './components/RadioPlayer';
import FullRadioPlayer from './components/FullRadioPlayer';
import AiDj from './components/AiDj';
import ScheduleTab from './components/ScheduleTab';
import MiniWaveform from './components/MiniWaveform';
import { MessageSquare, CalendarDays, Square, Play, X, Moon, CheckCircle2, Newspaper, Image as ImageIcon, Settings2, Clock, Type, ChevronLeft, Minus, Plus, User, Info, Maximize2 } from 'lucide-react';
import { initializeChat } from './services/geminiService';
import { TabType, NewsItem } from './types';

const TABS_ORDER: TabType[] = ['radio2', 'schedule'];

const ToggleSwitch = ({ active, onToggle, label, icon: Icon }: { active: boolean, onToggle: () => void, label: string, icon: any }) => (
  <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg transition-colors ${active ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-white/20 group-hover:text-white/40'}`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-sm font-medium text-white/80">{label}</span>
    </div>
    <button 
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 ${active ? 'bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.3)]' : 'bg-white/10'}`}
    >
      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm ${active ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  </div>
);

export default function App() {
  const [showChat, setShowChat] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('radio2');
  
  const [quality, setQuality] = useState(() => localStorage.getItem('wayak_radio_quality') || '32');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [sleepRemaining, setSleepRemaining] = useState<number | null>(null);
  
  const [showNewsInRadio, setShowNewsInRadio] = useState(() => {
    const saved = localStorage.getItem('wayak_show_news');
    return saved !== null ? saved === 'true' : true;
  });
  const [showAlbumArt, setShowAlbumArt] = useState(() => {
    const saved = localStorage.getItem('wayak_show_art');
    return saved !== null ? saved === 'true' : true;
  });
  
  const [immersiveArt, setImmersiveArt] = useState(() => {
    const saved = localStorage.getItem('wayak_immersive_art');
    return saved !== null ? saved === 'true' : true;
  });

  const [newsFontSize, setNewsFontSize] = useState(() => {
    const saved = localStorage.getItem('wayak_news_font_size');
    return saved !== null ? parseInt(saved) : 11;
  });

  const [newsSpeed, setNewsSpeed] = useState(() => {
    const saved = localStorage.getItem('wayak_news_speed');
    return saved !== null ? parseInt(saved) : 450;
  });

  const [selectedNews, setSelectedNews] = useState<any | null>(null);
  const [articleFontSize, setArticleFontSize] = useState(1.2);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const [audioSync, setAudioSync] = useState({
    isPlaying: false,
    isMuted: false,
    title: 'راديو وياك',
    artist: 'بث مباشر',
    album: 'ألبوم البث المباشر',
    analyser: null as AnalyserNode | null,
    togglePlay: () => {},
    toggleMute: () => {}
  });

  const [liveMetadata, setLiveMetadata] = useState({
    title: 'راديو وياك',
    artist: 'بث مباشر',
    album: 'ألبوم البث المباشر',
    art: ''
  });

  const syncState = useCallback((state: any) => setAudioSync(state), []);

  useEffect(() => {
    initializeChat();
  }, []);

  const getTabStyle = (tab: TabType) => {
    const currentIndex = TABS_ORDER.indexOf(activeTab);
    const targetIndex = TABS_ORDER.indexOf(tab);
    const offset = (currentIndex - targetIndex) * 100;
    const isActive = activeTab === tab;
    return {
      transform: `translateX(${offset}%) scale(${isActive ? 1 : 0.94})`,
      opacity: isActive ? 1 : 0,
      filter: isActive ? 'blur(0px)' : 'blur(10px)',
      pointerEvents: isActive ? 'auto' : 'none',
      visibility: isActive || Math.abs(currentIndex - targetIndex) <= 1 ? 'visible' : 'hidden',
      transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.5s ease, filter 0.5s ease'
    } as React.CSSProperties;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 70;
    const isRightSwipe = distance < -70;

    if (isRightSwipe && activeTab === 'radio2') {
      setActiveTab('schedule');
    } else if (isLeftSwipe && activeTab === 'schedule') {
      setActiveTab('radio2');
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleToggleNews = () => {
    const newValue = !showNewsInRadio;
    setShowNewsInRadio(newValue);
    localStorage.setItem('wayak_show_news', String(newValue));
  };

  const handleToggleArt = () => {
    const newValue = !showAlbumArt;
    setShowAlbumArt(newValue);
    localStorage.setItem('wayak_show_art', String(newValue));
  };

  const handleToggleImmersive = () => {
    const newValue = !immersiveArt;
    setImmersiveArt(newValue);
    localStorage.setItem('wayak_immersive_art', String(newValue));
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setNewsFontSize(val);
    localStorage.setItem('wayak_news_font_size', String(val));
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setNewsSpeed(val);
    localStorage.setItem('wayak_news_speed', String(val));
  };

  const qualities = [
    { id: '32', label: 'جودة اقتصادية (32k)', info: '15 كيلوبايت/ساعة' },
    { id: '64', label: 'جودة متوازنة (64k)', info: '30 كيلوبايت/ساعة' },
    { id: '96', label: 'جودة فائقة (96k)', info: '45 كيلوبايت/ساعة' }
  ];

  const sleepOptions = [
    { label: 'إيقاف المؤقت', value: null },
    { label: '15 دقيقة', value: 15 * 60 },
    { label: '30 دقيقة', value: 30 * 60 },
    { label: '45 دقيقة', value: 45 * 60 },
    { label: '60 دقيقة', value: 60 * 60 },
  ];

  const renderArticleContent = (html: string) => {
    if (!html) return { __html: '' };
    const styledHtml = html
      .replace(/<p>/g, `<p style="margin-bottom: 1.5em; line-height: 1.8; font-size: ${articleFontSize}rem; color: rgba(255,255,255,0.9);">`)
      .replace(/<img[^>]*>/g, ""); 
    return { __html: styledHtml };
  };

  return (
    <div 
      className="h-[100dvh] w-full relative overflow-hidden flex flex-col bg-black font-[IBM Plex Sans Arabic]"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <RadioPlayer syncState={syncState} quality={quality} sleepRemaining={sleepRemaining} setSleepRemaining={setSleepRemaining} onMetadataUpdate={setLiveMetadata} />

      <style>{`
        @keyframes marquee-mini-reverse { 
          0% { transform: translateX(0%); } 
          100% { transform: translateX(-50%); } 
        }
        .scrolling-track { 
          display: inline-block; 
          white-space: nowrap; 
          animation: marquee-mini-reverse 20s linear infinite; 
          will-change: transform; 
        }
        @keyframes play-btn-pulse {
          0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); transform: scale(1); }
          70% { box-shadow: 0 0 0 12px rgba(255, 255, 255, 0); transform: scale(1.05); }
          100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); transform: scale(1); }
        }
        .animate-play-pulse {
          animation: play-btn-pulse 2s infinite cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes immersive-zoom {
          0% { transform: scale(1); }
          50% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        .bg-immersive-full {
          animation: immersive-zoom 30s ease-in-out infinite;
        }
      `}</style>

      {/* STATIC ALBUM ART BACKGROUND - PERSISTENT ACROSS ALL TABS */}
      <div className="fixed inset-0 overflow-hidden z-0 bg-black">
        {showAlbumArt && liveMetadata.art && (
          <div className="absolute inset-0 w-full h-full">
            <img 
              key={liveMetadata.art} 
              src={liveMetadata.art} 
              className={`w-full h-full object-cover transition-all duration-1000 ${immersiveArt ? 'opacity-40 blur-none bg-immersive-full' : 'opacity-20 blur-3xl scale-110'} animate-in fade-in`}
              alt="Background Art" 
            />
            {/* VIGNETTE & SHADOW LAYER - Added strictly to darken and improve text visibility */}
            <div className="absolute inset-0 bg-black/60 bg-gradient-to-b from-black/80 via-transparent to-black/90 pointer-events-none" />
          </div>
        )}
      </div>

      <div className="flex-1 relative z-10 w-full overflow-hidden">
        <div className="tab-content absolute inset-0" style={getTabStyle('radio2')}>
          <main className="w-full h-full flex items-center justify-center">
            <FullRadioPlayer 
              syncState={audioSync} 
              metadata={liveMetadata} 
              quality={quality} 
              setQuality={(q) => { setQuality(q); localStorage.setItem('wayak_radio_quality', q); setShowQualityMenu(false); }} 
              setShowQualityMenu={setShowQualityMenu} 
              setShowSleepModal={setShowSleepModal} 
              sleepRemaining={sleepRemaining}
              showNews={showNewsInRadio}
              setShowNews={handleToggleNews}
              showAlbumArt={showAlbumArt}
              newsFontSize={newsFontSize}
              newsSpeed={newsSpeed}
              immersiveArt={immersiveArt}
              onNewsClick={setSelectedNews}
            />
          </main>
        </div>
        <div className="tab-content absolute inset-0" style={getTabStyle('schedule')}><ScheduleTab onClose={() => setActiveTab('radio2')} /></div>
      </div>

      {/* الشريط السفلي */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] px-3 pb-6 pt-2 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none">
        <div className="max-w-3xl mx-auto ios-glass rounded-full p-2 flex items-center justify-between shadow-2xl border border-white/10 pointer-events-auto overflow-hidden">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button onClick={() => setShowChat(true)} className="w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white transition-all active:scale-90 border border-blue-500/20 shadow-lg"><MessageSquare className="w-6 h-6" /></button>
            <div className={`expandable-player flex items-center bg-white/5 rounded-full border border-white/5 overflow-hidden h-14 shadow-inner group ${activeTab === 'radio2' ? 'w-14 p-2' : 'flex-1 max-w-[400px] p-2 pl-4 cursor-pointer hover:bg-white/10'}`} onClick={() => activeTab !== 'radio2' && setActiveTab('radio2')}>
              <button 
                onClick={(e) => { if (activeTab !== 'radio2') e.stopPropagation(); audioSync.togglePlay(); }} 
                className={`w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 text-black active:scale-95 transition-all shadow-md z-10 relative hover:bg-gray-200 overflow-hidden ${audioSync.isPlaying ? 'animate-play-pulse' : ''}`}
              >
                {audioSync.isPlaying ? (
                  <Square key="stop-icon" className="w-4 h-4 fill-current animate-in zoom-in-50 fade-in duration-300" />
                ) : (
                  <Play key="play-icon" className="w-4 h-4 fill-current rotate-180 ml-0.5 animate-in zoom-in-50 fade-in duration-300" />
                )}
              </button>
              <div className={`flex-1 min-w-0 flex flex-col justify-center transition-all duration-700 ml-3 ${activeTab === 'radio2' ? 'opacity-0 invisible w-0' : 'opacity-100 visible w-auto'}`}>
                <div className="w-full h-5 relative scrolling-text-mask overflow-hidden" dir="ltr">
                  <div className="scrolling-track">
                    <div className="flex items-center whitespace-nowrap px-6">
                      <span className="text-white/40 text-[9px] uppercase tracking-wider font-medium">{audioSync.album}</span>
                      <span className="mx-2 text-white/10 text-[8px]">•</span>
                      <span className="text-white text-[12px] font-bold tracking-wide">{audioSync.title}</span>
                      <span className="mx-2 text-white/10 text-[8px]">•</span>
                      <span className="text-blue-300/90 text-[10px] font-medium">{audioSync.artist}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center mt-1 opacity-50 pl-1 group-hover:opacity-100 transition-opacity" dir="ltr"><MiniWaveform analyser={audioSync.analyser} isPlaying={audioSync.isPlaying} /></div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 pr-2">
            <button onClick={() => setActiveTab('schedule')} className={`w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-full transition-all ${activeTab === 'schedule' ? 'bg-blue-500/20 text-blue-400' : 'text-white/40 hover:text-white'}`}><CalendarDays className="w-6 h-6" /></button>
          </div>
        </div>
      </div>

      {/* ... باقي المودالز (Settings, Sleep, News, Chat) كما هي ... */}
      {showQualityMenu && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowQualityMenu(false)} />
          <div className="relative w-full max-w-[320px] ios-glass rounded-[32px] p-6 space-y-4 shadow-2xl border border-white/10 overflow-y-auto max-h-[85vh] custom-scrollbar">
            <div className="text-center">
              <h3 className="text-lg font-bold text-white tracking-tight">التفضيلات</h3>
              <p className="text-[9px] text-white/20 uppercase tracking-[0.3em] font-black mt-0.5">Settings</p>
            </div>
            
            <div className="space-y-2">
               <ToggleSwitch 
                  active={showNewsInRadio} 
                  onToggle={handleToggleNews} 
                  label="شريط الأخبار" 
                  icon={Newspaper}
               />
               
               {showNewsInRadio && (
                 <div className="p-3 bg-white/5 rounded-2xl border border-white/5 space-y-3 animate-in fade-in slide-in-from-top-2">
                   <div className="space-y-2">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                           <Type className="w-3.5 h-3.5" />
                         </div>
                         <span className="text-[12px] font-medium text-white/80">حجم الخط</span>
                       </div>
                       <span className="text-[10px] font-bold text-blue-400 tabular-nums">{newsFontSize}px</span>
                     </div>
                     <input 
                       type="range" 
                       min="10" 
                       max="18" 
                       value={newsFontSize} 
                       onChange={handleFontSizeChange}
                       className="w-full accent-blue-600 h-1.5 rounded-full"
                     />
                   </div>

                   <div className="space-y-2 pt-1 border-t border-white/5">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                           <Clock className="w-3.5 h-3.5" />
                         </div>
                         <span className="text-[12px] font-medium text-white/80">سرعة الشريط</span>
                       </div>
                       <span className="text-[10px] font-bold text-purple-400">
                         {newsSpeed > 600 ? 'بطيء جداً' : newsSpeed > 400 ? 'بطيء' : newsSpeed > 250 ? 'متوسط' : 'سريع'}
                       </span>
                     </div>
                     <input 
                       type="range" 
                       min="100" 
                       max="800" 
                       step="50"
                       value={newsSpeed} 
                       onChange={handleSpeedChange}
                       className="w-full accent-purple-600 h-1.5 rounded-full"
                       dir="ltr"
                     />
                   </div>
                 </div>
               )}

               <ToggleSwitch 
                  active={showAlbumArt} 
                  onToggle={handleToggleArt} 
                  label="صورة الألبوم" 
                  icon={ImageIcon}
               />

               {showAlbumArt && (
                  <ToggleSwitch 
                    active={immersiveArt} 
                    onToggle={handleToggleImmersive} 
                    label="خلفية غامرة (كامل الشاشة)" 
                    icon={Maximize2}
                  />
               )}
            </div>

            <div className="pt-3 border-t border-white/5 space-y-3">
              <h4 className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] text-center">جودة البث</h4>
              <div className="grid gap-1.5">
                {qualities.map((q) => (
                  <button 
                    key={q.id} 
                    onClick={() => { setQuality(q.id); localStorage.setItem('wayak_radio_quality', q.id); setShowQualityMenu(false); }} 
                    className={`w-full p-2.5 rounded-xl flex items-center justify-between transition-all active:scale-95 border ${quality === q.id ? 'bg-blue-600/20 border-blue-500/50 text-white' : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'}`}
                  >
                    <div className="flex flex-col items-start text-right" dir="rtl">
                      <span className="text-[11px] font-bold">{q.label}</span>
                      <span className="text-[8px] text-white/40 font-medium">{q.info}</span>
                    </div>
                    {quality === q.id && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => setShowQualityMenu(false)} className="w-full py-2.5 text-white/30 hover:text-white transition-colors text-[10px] font-black tracking-widest uppercase border-t border-white/5 mt-1">إغلاق</button>
          </div>
        </div>
      )}

      {showSleepModal && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowSleepModal(false)} />
          <div className="relative w-full max-w-[320px] ios-glass rounded-[32px] p-6 space-y-5 shadow-2xl border border-white/10 overflow-hidden">
            <div className="text-center">
              <h3 className="text-lg font-bold text-white tracking-tight">مؤقت النوم</h3>
              <p className="text-[9px] text-white/20 uppercase tracking-[0.3em] font-black mt-0.5">Sleep Timer</p>
            </div>
            
            <div className="grid gap-2">
              {sleepOptions.map((opt, idx) => (
                <button 
                  key={idx} 
                  onClick={() => { setSleepRemaining(opt.value); setShowSleepModal(false); }} 
                  className={`w-full p-3.5 rounded-2xl flex items-center gap-4 transition-all active:scale-95 border ${((opt.value === null && sleepRemaining === null) || (opt.value !== null && sleepRemaining !== null && Math.abs(sleepRemaining - opt.value) < 60)) ? 'bg-purple-600/20 border-purple-500/50 text-white' : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'}`}
                >
                  <div className={`p-2 rounded-lg ${((opt.value === null && sleepRemaining === null) || (opt.value !== null && sleepRemaining !== null)) ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-white/20'}`}>
                    {opt.value === null ? <X className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>
                  <span className="text-sm font-medium">{opt.label}</span>
                  {((opt.value === null && sleepRemaining === null) || (opt.value !== null && sleepRemaining !== null && Math.abs(sleepRemaining - opt.value) < 60)) && <CheckCircle2 className="w-4 h-4 mr-auto text-purple-400" />}
                </button>
              ))}
            </div>

            <button onClick={() => setShowSleepModal(false)} className="w-full py-2.5 text-white/30 hover:text-white transition-colors text-[10px] font-black tracking-widest uppercase border-t border-white/5 mt-2">إلغاء</button>
          </div>
        </div>
      )}

      {selectedNews && (
        <div className={`fixed inset-0 z-[210] ios-glass-heavy transition-all duration-700 flex flex-col items-center justify-center ${selectedNews ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}>
          <div className="w-full h-full max-w-5xl bg-black/95 backdrop-blur-3xl flex flex-col shadow-2xl relative border-x border-white/5">
            <div className="p-6 md:p-10 flex items-center justify-between border-b border-white/5">
              <button onClick={() => setSelectedNews(null)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all active:scale-90 border border-white/5"><ChevronLeft className="w-6 h-6 text-white rotate-180" /></button>
              <div className="flex items-center gap-4">
                <button onClick={() => setArticleFontSize(prev => Math.max(0.8, prev - 0.1))} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg"><Minus className="w-4 h-4" /></button>
                <span className="text-xs text-white/40 uppercase tracking-widest font-bold">الخط</span>
                <button onClick={() => setArticleFontSize(prev => Math.min(2.5, prev + 0.1))} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg"><Plus className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12">
              <div className="max-w-3xl mx-auto space-y-8">
                <h1 className="text-2xl md:text-4xl font-normal text-white leading-tight">{selectedNews?.title}</h1>
                <div className="flex items-center gap-4 text-blue-400/60 text-sm">
                  <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {selectedNews?.author}</span>
                  <span className="w-1 h-1 rounded-full bg-white/10" />
                  <span className="flex items-center gap-1.5"><Info className="w-4 h-4" /> مصدر: RSS</span>
                </div>
                <div className="article-content select-text" dangerouslySetInnerHTML={renderArticleContent(selectedNews?.content || '')} />
                {selectedNews?.link && (
                  <div className="pt-10">
                    <a href={selectedNews.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600/20 text-blue-400 rounded-full border border-blue-500/30 hover:bg-blue-600 hover:text-white transition-all text-sm">عرض المصدر الأصلي</a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`fixed inset-0 z-[200] p-4 transition-all duration-500 ${showChat ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
         <div className="absolute inset-0 bg-black/70 backdrop-blur-xl" onClick={() => setShowChat(false)} />
         <div className={`relative h-full max-w-lg mx-auto transition-all duration-700 ${showChat ? 'translate-y-0 scale-100' : 'translate-y-full scale-95'}`}>
            <AiDj onClose={() => setShowChat(false)} />
         </div>
      </div>
    </div>
  );
}
