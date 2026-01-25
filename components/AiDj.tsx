
import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { ArrowUp, Download, Share2, Copy, Check, X, Paperclip, FileText, FileAudio, FileVideo, FileImage, Pencil, RotateCcw, AlertTriangle, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { Message, AttachedFile } from '../types';
import { sendMessageToDj, initializeChat } from '../services/geminiService';
import { parse } from 'marked';
import { Part } from '@google/genai';

interface ChatMessageProps {
  msg: Message;
  onCopy: (text: string, id: string) => void;
  onEdit: (msg: Message) => void;
  copiedId: string | null;
  onImageClick: (url: string) => void;
}

let ChatMessage = memo((props: ChatMessageProps) => {
  let msg = props.msg;
  let onCopy = props.onCopy;
  let onEdit = props.onEdit;
  let copiedId = props.copiedId;
  let onImageClick = props.onImageClick;

  let renderMarkdown = (text: string) => {
    try {
      let html = parse(text || '') as string;
      return { __html: html };
    } catch {
      return { __html: text || '' };
    }
  };

  let renderFile = (file: AttachedFile, index: number) => {
    let mimeType = file.mimeType || '';
    let isImage = mimeType.startsWith('image/');
    let isAudio = mimeType.startsWith('audio/');
    let isVideo = mimeType.startsWith('video/');

    if (isImage) {
      return (
        <div key={index} className="mt-2 rounded-xl overflow-hidden border border-white/10 shadow-sm cursor-pointer" onClick={() => onImageClick(file.preview || "data:" + mimeType + ";base64," + file.data)}>
          <img src={file.preview || "data:" + mimeType + ";base64," + file.data} alt={file.name} className="w-full h-auto max-h-60 object-cover" />
        </div>
      );
    }

    if (isAudio) {
      return (
        <div key={index} className="mt-2 p-2 bg-black/20 rounded-xl border border-white/5 flex flex-col gap-1">
          <div className="flex items-center gap-2 px-1">
            <FileAudio className="w-4 h-4 text-green-400" />
            <span className="text-[10px] text-white/60 truncate">{file.name}</span>
          </div>
          <audio controls className="w-full h-8 filter invert opacity-80 scale-95 origin-right">
            <source src={"data:" + mimeType + ";base64," + file.data} type={mimeType} />
          </audio>
        </div>
      );
    }

    if (isVideo) {
      return (
        <div key={index} className="mt-2 rounded-xl overflow-hidden border border-white/10 bg-black/40">
           <video controls className="w-full max-h-60">
             <source src={"data:" + mimeType + ";base64," + file.data} type={mimeType} />
           </video>
           <div className="p-2 flex items-center gap-2">
             <FileVideo className="w-4 h-4 text-purple-400" />
             <span className="text-[10px] text-white/60 truncate">{file.name}</span>
           </div>
        </div>
      );
    }

    return (
      <div key={index} className="mt-2 p-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-white/80 truncate font-medium">{file.name}</p>
          <p className="text-[10px] text-white/40 uppercase tracking-wider">{(mimeType.split('/')[1] || 'FILE')}</p>
        </div>
        <a 
          href={"data:" + mimeType + ";base64," + file.data} 
          download={file.name}
          className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors"
        >
          <Download className="w-4 h-4" />
        </a>
      </div>
    );
  };

  let isUser = msg.sender === 'user';
  return (
    <div className={"flex flex-col " + (isUser ? 'items-end' : 'items-start') + " group mb-8 message-item"}>
      <div
        className={"max-w-[90%] text-[15px] leading-relaxed relative break-words transition-all " + (
          isUser
            ? 'px-4 py-2.5 rounded-[22px] rounded-br-none bg-blue-600/90 text-white shadow-sm border border-white/5'
            : 'px-0 py-0 bg-transparent text-[#e0e0e0]'
        )}
      >
        {msg.text && (
          <div 
            className="markdown-content whitespace-normal break-words select-text cursor-auto" 
            dangerouslySetInnerHTML={renderMarkdown(msg.text)} 
          />
        )}
        
        {msg.files && msg.files.map((file, idx) => renderFile(file, idx))}

        {msg.image && (
          <div 
            className={"mt-3 rounded-xl overflow-hidden border border-white/10 shadow-lg relative cursor-pointer " + (isUser ? '' : 'max-w-md')}
            onClick={() => onImageClick(msg.image!)}
          >
            <img 
              src={msg.image} 
              alt="AI" 
              className="w-full h-auto object-cover max-h-60 animate-in fade-in duration-700" 
              loading="lazy"
            />
          </div>
        )}

        {msg.isEdited && (
          <div className="text-[9px] opacity-40 mt-1 flex items-center gap-1 justify-end italic">
            <Pencil className="w-2.5 h-2.5" /> <span>معدلة</span>
          </div>
        )}
      </div>

      <div className={"flex items-center gap-2 mt-2 transition-all " + (isUser ? 'opacity-0 group-hover:opacity-100' : 'opacity-20 group-hover:opacity-100')}>
          {isUser && (
            <button
                onClick={() => onEdit(msg)}
                className="p-1 hover:bg-white/5 rounded-full transition-all active:scale-95 flex items-center justify-center"
                title="تعديل الرسالة"
            >
                <Pencil className="w-4 h-4 text-gray-500/60 hover:text-gray-400" />
            </button>
          )}
          <button
              onClick={() => onCopy(msg.text, msg.id)}
              className="p-1 hover:bg-white/5 rounded-full transition-all active:scale-95 flex items-center justify-center"
              title="نسخ النص"
          >
              {copiedId === msg.id ? (
                  <Check className="w-4 h-4 text-green-400" />
              ) : (
                  <Copy className="w-4 h-4 text-gray-500/60 hover:text-gray-400" />
              )}
          </button>
      </div>
    </div>
  );
});

interface AiDjProps {
  onClose?: () => void;
}

let AiDj: React.FC<AiDjProps> = (props) => {
  let onClose = props.onClose;
  let [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'السلام عليكم ورحمة الله وبركاته.. يا أهلاً ويا مية مرحباً بيك في راديو وياك! أنا "شات وياك" رفيقك ومذيعك المفضل اللي دايمًا معاك.. بجد منوّرنا وموحشنا جداً! طمنا عليك يا غالي، إيه الأخبار عندك النهاردة؟ إن شاء الله يومك جميل زيك! 🌹✨',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  let [inputText, setInputText] = useState('');
  let [isGenerating, setIsGenerating] = useState(false);
  let [showTypingIndicator, setShowTypingIndicator] = useState(false);
  let [copiedId, setCopiedId] = useState<string | null>(null);
  let [viewingMedia, setViewingMedia] = useState<string | null>(null);
  let [selectedFiles, setSelectedFiles] = useState<AttachedFile[]>([]);
  let [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  let [warning, setWarning] = useState<string | null>(null);
  
  let [zoomScale, setZoomScale] = useState(1);
  let [translatePos, setTranslatePos] = useState({ x: 0, y: 0 });
  let [isDragging, setIsDragging] = useState(false);
  let dragStartRef = useRef({ x: 0, y: 0 });
  let lastTouchDistance = useRef<number | null>(null);

  let scrollContainerRef = useRef<HTMLDivElement>(null);
  let messagesEndRef = useRef<HTMLDivElement>(null);
  let textareaRef = useRef<HTMLTextAreaElement>(null);
  let fileInputRef = useRef<HTMLInputElement>(null);
  let lastLongScrollId = useRef<string | null>(null);

  let smartScroll = useCallback(() => {
    let container = scrollContainerRef.current;
    if (!container) return;

    let items = container.querySelectorAll('.message-item');
    let lastMsgElement = items[items.length - 1] as HTMLElement;
    if (!lastMsgElement || messages.length === 0) return;

    let lastMsg = messages[messages.length - 1];
    let containerHeight = container.clientHeight;
    let messageHeight = lastMsgElement.offsetHeight;

    if (messageHeight >= containerHeight * 0.75) {
      if (lastLongScrollId.current !== lastMsg.id) {
        container.scrollTo({ top: lastMsgElement.offsetTop - 15, behavior: 'smooth' });
        lastLongScrollId.current = lastMsg.id;
      }
    } else {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      if (lastLongScrollId.current === lastMsg.id) lastLongScrollId.current = null;
    }
  }, [messages]);

  useEffect(() => {
    smartScroll();
  }, [messages, showTypingIndicator, warning, smartScroll]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + "px";
    }
  }, [inputText]);

  useEffect(() => {
    initializeChat();
  }, []);

  useEffect(() => {
    if (!viewingMedia) {
      setZoomScale(1);
      setTranslatePos({ x: 0, y: 0 });
    }
  }, [viewingMedia]);

  let handleFileClick = () => {
    if (fileInputRef.current) {
        fileInputRef.current.click();
    }
  };

  let handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let files = e.target.files;
    if (!files) return;

    let newFiles: AttachedFile[] = [];
    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        let reader = new FileReader();
        let filePromise = new Promise<AttachedFile>((resolve) => {
            reader.onload = (event) => {
                let resultStr = event.target?.result;
                if (typeof resultStr === 'string') {
                    let parts = resultStr.split(',');
                    let base64 = parts.length > 1 ? parts[1] : '';
                    let preview = file.type.startsWith('image/') ? resultStr : undefined;
                    resolve({
                        name: file.name,
                        mimeType: file.type,
                        data: base64,
                        preview: preview
                    });
                }
            };
            reader.readAsDataURL(file);
        });
        let attached = await filePromise;
        newFiles.push(attached);
    }
    setSelectedFiles(prev => prev.concat(newFiles));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  let removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  let handleSend = async () => {
    if ((!inputText.trim() && selectedFiles.length === 0) || isGenerating) return;

    let userText = inputText.trim();
    let currentFiles = selectedFiles.slice();
    let isEditing = !!editingMessageId;
    let currentEditId = editingMessageId;

    setInputText('');
    setSelectedFiles([]);
    setEditingMessageId(null);
    setIsGenerating(true);
    
    let typingTimeout = setTimeout(() => setShowTypingIndicator(true), 1000);
    setWarning(null);

    let updatedMessages = messages.slice();
    let aiMsgId = "";

    if (isEditing) {
      updatedMessages = updatedMessages.map(m => 
        m.id === currentEditId 
          ? { ...m, text: userText, isEdited: true, originalText: m.originalText || m.text } 
          : m
      );
      
      let userIdx = updatedMessages.findIndex(m => m.id === currentEditId);
      let nextMsg = updatedMessages[userIdx + 1];
      
      if (nextMsg && nextMsg.sender === 'ai') {
        aiMsgId = nextMsg.id;
        updatedMessages[userIdx + 1] = { ...nextMsg, text: '', image: undefined };
      } else {
        aiMsgId = Date.now().toString() + "-ai";
        updatedMessages.splice(userIdx + 1, 0, { id: aiMsgId, text: '', sender: 'ai', timestamp: new Date() });
      }
    } else {
      let userMsgId = Date.now().toString();
      aiMsgId = (Date.now() + 1).toString();
      updatedMessages.push({
        id: userMsgId,
        text: userText,
        sender: 'user',
        timestamp: new Date(),
        files: currentFiles.length > 0 ? currentFiles : undefined
      });
      updatedMessages.push({
        id: aiMsgId,
        text: '',
        sender: 'ai',
        timestamp: new Date(),
      });
    }

    setMessages(updatedMessages);

    try {
        let parts: Part[] = [];
        if (userText) parts.push({ text: userText });
        for (let i = 0; i < currentFiles.length; i++) {
            let f = currentFiles[i];
            parts.push({
                inlineData: {
                    mimeType: f.mimeType,
                    data: f.data
                }
            });
        }

        let promptInput = parts.length > 0 ? parts : userText;
        await sendMessageToDj(
          promptInput, 
          (chunkText) => {
            clearTimeout(typingTimeout);
            setShowTypingIndicator(false);
            setMessages((prev) => prev.map(m => m.id === aiMsgId ? { ...m, text: m.text + chunkText } : m));
          },
          (imageUrl) => {
            setMessages((prev) => 
              prev.map(m => m.id === aiMsgId ? { ...m, image: imageUrl } : m)
            );
          }
        );
    } catch (e) {
        clearTimeout(typingTimeout);
        setShowTypingIndicator(false);
        setWarning("⚠️ عذراً يا غالي، في تشويش بسيط في الشبكة.. خليك معانا! 🤲");
    } finally {
        clearTimeout(typingTimeout);
        setShowTypingIndicator(false);
        setIsGenerating(false);
    }
  };

  let startEditing = (msg: Message) => {
    setInputText(msg.text);
    setEditingMessageId(msg.id);
    if (textareaRef.current) {
        textareaRef.current.focus();
    }
  };

  let handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSend();
    }
  };

  let handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  let getFileIcon = (mimeType: string) => {
      if (mimeType.startsWith('image/')) return <FileImage className="w-4 h-4 text-blue-400" />;
      if (mimeType.startsWith('audio/')) return <FileAudio className="w-4 h-4 text-green-400" />;
      if (mimeType.startsWith('video/')) return <FileVideo className="w-4 h-4 text-purple-400" />;
      return <FileText className="w-4 h-4 text-gray-400" />;
  };

  let handleZoom = (direction: 'in' | 'out') => {
    setZoomScale(prev => {
      let next = direction === 'in' ? prev * 1.3 : prev / 1.3;
      return Math.min(Math.max(next, 0.5), 10);
    });
  };

  let handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - translatePos.x, y: e.clientY - translatePos.y };
  };

  let handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTranslatePos({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  let handleMouseUp = () => setIsDragging(false);

  let handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = { 
        x: e.touches[0].clientX - translatePos.x, 
        y: e.touches[0].clientY - translatePos.y 
      };
    } else if (e.touches.length === 2) {
      let dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      lastTouchDistance.current = dist;
    }
  };

  let handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      setTranslatePos({
        x: e.touches[0].clientX - dragStartRef.current.x,
        y: e.touches[0].clientY - dragStartRef.current.y
      });
    } else if (e.touches.length === 2 && lastTouchDistance.current !== null) {
      let dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      let scaleDelta = dist / lastTouchDistance.current;
      setZoomScale(prev => Math.min(Math.max(prev * scaleDelta, 0.5), 10));
      lastTouchDistance.current = dist;
    }
  };

  let handleTouchEnd = () => {
    setIsDragging(false);
    lastTouchDistance.current = null;
  };

  let resetView = () => {
    setZoomScale(1);
    setTranslatePos({ x: 0, y: 0 });
  };

  return (
    <>
      <div className="flex flex-col h-full ios-glass rounded-[40px] overflow-hidden border border-white/10 relative shadow-2xl animate-soft-enter">
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/20 to-transparent pointer-events-none z-10"></div>

        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-6 left-6 z-20 p-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-full transition-all border border-white/5 shadow-sm active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden p-6 pt-16 custom-scrollbar scroll-smooth">
          {messages.map((msg) => {
            let hasContent = msg.text || msg.image || (msg.files && msg.files.length > 0);
            return hasContent ? (
              <ChatMessage 
                key={msg.id} 
                msg={msg} 
                onCopy={handleCopy}
                onEdit={startEditing}
                copiedId={copiedId}
                onImageClick={setViewingMedia}
              />
            ) : null;
          })}

          {warning && (
            <div className="flex items-center gap-2 px-4 py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl text-[12px] text-yellow-100/70 animate-in slide-in-from-bottom-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
              <span>{warning}</span>
            </div>
          )}

          {showTypingIndicator && (
            <div className="flex flex-col items-start mb-4 animate-in fade-in duration-300">
              <div className="px-0 py-2 flex gap-1.5 items-center">
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-duration:0.8s]"></div>
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 pt-2 bg-gradient-to-t from-black/20 to-transparent">
          {editingMessageId && (
            <div className="flex items-center justify-between mb-2 px-3 py-1.5 bg-blue-600/20 rounded-xl border border-blue-600/30 animate-in slide-in-from-bottom-1">
              <span className="text-[10px] text-blue-300 font-medium tracking-wide">تعديل الرسالة المختارة...</span>
              <button onClick={() => {setEditingMessageId(null); setInputText(''); setWarning(null);}} className="text-[10px] text-white/40 hover:text-white transition-colors flex items-center gap-1">
                <RotateCcw className="w-3 h-3" /> إلغاء
              </button>
            </div>
          )}

          {selectedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 max-h-32 overflow-y-auto p-1 custom-scrollbar">
                {selectedFiles.map((file, i) => (
                    <div key={i} className="relative group bg-white/10 rounded-xl p-1.5 border border-white/10 flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-200">
                        {file.preview ? (
                            <img src={file.preview} className="w-8 h-8 rounded-lg object-cover" />
                        ) : (
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                {getFileIcon(file.mimeType)}
                            </div>
                        )}
                        <span className="text-[10px] text-white/60 max-w-[80px] truncate">{file.name}</span>
                        <button 
                            onClick={() => removeFile(i)}
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>
          )}

          <div className="relative flex items-end bg-white/5 rounded-[28px] border border-white/5 p-2 focus-within:border-white/20 transition-all shadow-inner">
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                multiple 
                accept="*"
            />
            <button
                onClick={handleFileClick}
                disabled={isGenerating}
                className="w-11 h-11 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all flex-shrink-0 mb-0.5"
                title="إرفاق ملف"
            >
                <Paperclip className="w-5 h-5" />
            </button>

            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isGenerating}
              placeholder={isGenerating ? "جارٍ التجهيز..." : "تفضل بالسؤال..."}
              className="flex-1 bg-transparent px-3 py-2.5 text-[15px] text-white placeholder-white/20 focus:outline-none disabled:opacity-50 resize-none overflow-y-auto max-h-[150px] custom-scrollbar"
              style={{ minHeight: '44px' }}
            />
            <button
              onClick={handleSend}
              disabled={(!inputText.trim() && selectedFiles.length === 0) || isGenerating}
              className="w-11 h-11 flex items-center justify-center bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-white/10 text-white rounded-[20px] transition-all active:scale-95 shadow-md flex-shrink-0 mb-0.5"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
          
          <div className="text-center mt-3">
             <p className="text-[10px] text-white/30 font-normal leading-relaxed">
                قد يقدّم شات وياك معلومات غير دقيقة أحيانًا، يُرجى التحقق من المعلومات
             </p>
          </div>
        </div>
      </div>

      {viewingMedia && (
        <div 
            className="fixed inset-0 z-[100] ios-glass-heavy flex flex-col items-center justify-center animate-in fade-in duration-300"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div className="absolute top-8 left-8 flex gap-3 z-50">
                <button 
                    onClick={() => setViewingMedia(null)}
                    className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-md border border-white/5"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="absolute top-8 right-8 flex gap-3 z-50">
                <button onClick={() => handleZoom('in')} className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-md border border-white/5"><ZoomIn className="w-5 h-5" /></button>
                <button onClick={() => handleZoom('out')} className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-md border border-white/5"><ZoomOut className="w-5 h-5" /></button>
                <button onClick={resetView} className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-md border border-white/5"><Maximize className="w-5 h-5" /></button>
            </div>

            <div 
              className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            >
                <div 
                  className="transition-transform duration-75 ease-out select-none"
                  style={{ 
                    transform: `translate(${translatePos.x}px, ${translatePos.y}px) scale(${zoomScale})`
                  }}
                >
                    <img 
                        src={viewingMedia} 
                        alt="Full View" 
                        className="max-w-[90vw] max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/10 pointer-events-none" 
                        draggable={false}
                    />
                </div>
            </div>

            <div className="absolute bottom-10 flex items-center gap-4 z-50">
                <button 
                    onClick={() => {
                        let link = document.createElement('a');
                        link.href = viewingMedia || "";
                        link.download = "wayak-ai-" + Date.now() + ".png";
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 text-white rounded-full text-sm hover:bg-white/10 transition-all backdrop-blur-md"
                >
                    <Download className="w-4 h-4" />
                    <span>تحميل</span>
                </button>
                <button 
                    onClick={async () => {
                      if (!viewingMedia) return;
                      try {
                        let response = await fetch(viewingMedia);
                        let blob = await response.blob();
                        let file = new File([blob], 'wayak-ai-image.png', { type: 'image/png' });
                        if (navigator.share) {
                             await navigator.share({ files: [file] });
                        }
                      } catch (e) {}
                    }}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-500 transition-all shadow-lg backdrop-blur-md"
                >
                    <Share2 className="w-4 h-4" />
                    <span>مشاركة</span>
                </button>
            </div>
        </div>
      )}
    </>
  );
};

export default AiDj;
