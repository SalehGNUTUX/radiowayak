
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { StreamStatus } from '../types';

const QUALITY_CONFIG = {
  '32': { url: "https://work.radiowayak.org/listen/live/live.mp3" },
  '64': { url: "https://work.radiowayak.org/listen/live/radio64.mp3" },
  '96': { url: "https://work.radiowayak.org/listen/live/radio96.mp3" }
};

let METADATA_API = "https://work.radiowayak.org/api/nowplaying/live";

interface RadioPlayerProps {
  quality: string;
  sleepRemaining: number | null;
  setSleepRemaining: (val: number | null) => void;
  syncState?: (state: { 
    isPlaying: boolean, 
    isMuted: boolean, 
    title: string, 
    artist: string, 
    album: string,
    analyser: AnalyserNode | null,
    togglePlay: () => void, 
    toggleMute: () => void 
  }) => void;
  onMetadataUpdate?: (meta: any) => void;
}

let RadioPlayer: React.FC<RadioPlayerProps> = (props) => {
  let { syncState, quality, sleepRemaining, setSleepRemaining, onMetadataUpdate } = props;
  
  let [isPlaying, setIsPlaying] = useState(false);
  let [isMuted, setIsMuted] = useState(false);
  let [volume] = useState(1.0);
  
  let [metadata, setMetadata] = useState({
    title: 'راديو وياك',
    artist: 'بث مباشر',
    album: 'ألبوم البث المباشر',
    art: ''
  });
  
  let [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  let audioContextRef = useRef<AudioContext | null>(null);
  let gainNodeRef = useRef<GainNode | null>(null);
  let audioRef = useRef<HTMLAudioElement>(null);
  let playPromiseRef = useRef<Promise<void> | null>(null);

  const initAudioGraph = useCallback(() => {
    if (audioContextRef.current || !audioRef.current) return;
    try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioContextRef.current = ctx;
        const gainNode = ctx.createGain();
        gainNode.gain.value = isMuted ? 0 : volume;
        gainNodeRef.current = gainNode;
        const analyserNode = ctx.createAnalyser();
        analyserNode.fftSize = 256;
        analyserNode.smoothingTimeConstant = 0.88;
        setAnalyser(analyserNode);
        
        const source = ctx.createMediaElementSource(audioRef.current);
        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        source.connect(analyserNode);
    } catch (err) {
        console.error("AudioGraph Error:", err);
    }
  }, [volume, isMuted]);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    
    if (!audioContextRef.current) initAudioGraph();
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }

    if (isPlaying) {
      if (playPromiseRef.current) {
        try {
          await playPromiseRef.current;
        } catch (e) {
          // Ignore interrupted play requests
        }
      }
      audioRef.current.pause();
      setIsPlaying(false);
      audioRef.current.src = "";
    } else {
      setIsPlaying(true);
      const streamUrl = `${QUALITY_CONFIG[quality as keyof typeof QUALITY_CONFIG]?.url || QUALITY_CONFIG['32'].url}?t=${Date.now()}`;
      audioRef.current.src = streamUrl;
      
      try {
          const promise = audioRef.current.play();
          playPromiseRef.current = promise;
          if (promise !== undefined) {
            await promise;
            playPromiseRef.current = null;
          }
      } catch (err) {
          if (err instanceof Error && err.name !== 'AbortError') {
            console.error("Playback failed:", err);
          }
          setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => setIsMuted(!isMuted);

  useEffect(() => {
    const warmup = () => {
      if (!audioContextRef.current) initAudioGraph();
      window.removeEventListener('touchstart', warmup);
      window.removeEventListener('mousedown', warmup);
    };
    window.addEventListener('touchstart', warmup);
    window.addEventListener('mousedown', warmup);
    return () => {
      window.removeEventListener('touchstart', warmup);
      window.removeEventListener('mousedown', warmup);
    };
  }, [initAudioGraph]);

  useEffect(() => {
    if (syncState) {
      syncState({
        isPlaying,
        isMuted,
        title: metadata.title,
        artist: metadata.artist,
        album: metadata.album,
        analyser: analyser,
        togglePlay,
        toggleMute
      });
    }
  }, [isPlaying, isMuted, metadata, analyser]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
        const streamUrl = `${QUALITY_CONFIG[quality as keyof typeof QUALITY_CONFIG]?.url || QUALITY_CONFIG['32'].url}?t=${Date.now()}`;
        audioRef.current.src = streamUrl;
        const promise = audioRef.current.play();
        playPromiseRef.current = promise;
        promise.catch(() => setIsPlaying(false));
    }
  }, [quality]);

  useEffect(() => {
    let fetchMetadata = async () => {
      try {
        let response = await fetch(METADATA_API);
        let data = await response.json();
        let song = data?.now_playing?.song;
        if (song) {
          const newMeta = {
            title: song.title || 'راديو وياك',
            artist: song.artist || 'بث مباشر',
            album: song.album || 'ألبوم البث المباشر',
            art: song.art || ''
          };
          setMetadata(newMeta);
          if (onMetadataUpdate) onMetadataUpdate(newMeta);
        }
      } catch {}
    };
    fetchMetadata();
    let timer = setInterval(fetchMetadata, 10000);
    return () => clearInterval(timer);
  }, [onMetadataUpdate]);

  useEffect(() => {
    let vol = isMuted ? 0 : volume;
    if (gainNodeRef.current) gainNodeRef.current.gain.value = vol;
    else if (audioRef.current) audioRef.current.volume = Math.min(vol, 1.0);
  }, [volume, isMuted]);

  useEffect(() => {
    let id: any;
    if (sleepRemaining !== null && sleepRemaining > 0) {
      id = setInterval(() => {
        if (sleepRemaining === null) return;
        if (sleepRemaining <= 1) {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
            setIsPlaying(false);
          }
          setSleepRemaining(null);
          return;
        }
        setSleepRemaining(sleepRemaining - 1);
      }, 1000);
    }
    return () => { if (id) clearInterval(id); };
  }, [sleepRemaining, setSleepRemaining]);

  return (
    <audio 
      ref={audioRef} 
      crossOrigin="anonymous" 
      preload="auto" 
      style={{ display: 'none' }}
    />
  );
};

export default RadioPlayer;
