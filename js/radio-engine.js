const RadioEngine = {
    url: "https://work.radiowayak.org/listen/live/live.mp3",
    api: "https://work.radiowayak.org/api/nowplaying/live",
    audio: new Audio(),
    context: null,
    analyser: null,
    isPlaying: false,

    init() {
        this.audio.src = this.url;
        // هذا السطر هو مفتاح الحل لمشكلة الصوت مع الذبذبات
        this.audio.crossOrigin = "anonymous";
    },

    setupAudioContext() {
        if (this.context) return;
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.context.createAnalyser();
            const source = this.context.createMediaElementSource(this.audio);
            source.connect(this.analyser);
            this.analyser.connect(this.context.destination);
            this.analyser.fftSize = 128;
        } catch (e) {
            console.error("AudioContext error:", e);
        }
    },

    toggle() {
        this.setupAudioContext();
        if (this.isPlaying) {
            this.audio.pause();
        } else {
            if (this.context.state === 'suspended') this.context.resume();
            this.audio.play().catch(e => console.error("Playback failed", e));
        }
        this.isPlaying = !this.isPlaying;
        return this.isPlaying;
    },

    async getMetadata() {
        try {
            const res = await fetch(this.api);
            const data = await res.json();
            return {
                title: data.now_playing.song.title || "راديو وياك",
                artist: data.now_playing.song.artist || "بث مباشر",
                art: data.now_playing.song.art || "album_art.1766384036.jpg"
            };
        } catch (e) {
            return { title: "راديو وياك", artist: "بث مباشر", art: "album_art.1766384036.jpg" };
        }
    }
};
