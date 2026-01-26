const app = {
    currentTab: 'radio',
    updateInterval: null,
    animationId: null,

    async init() {
        RadioEngine.init();
        this.showTab('radio');
        this.updateRadioInfo();
        this.updateInterval = setInterval(() => this.updateRadioInfo(), 10000);
    },

    async updateRadioInfo() {
        try {
            const meta = await RadioEngine.getMetadata();
            const titleEl = document.getElementById('track-title');
            const artistEl = document.getElementById('track-artist');
            const artEl = document.getElementById('album-art');

            if (titleEl) titleEl.innerText = meta.title || "راديو وياك";
            if (artistEl) artistEl.innerText = meta.artist || "بث مباشر";

            // تحديث صورة القارئ/البرنامج في شريط التحكم
            if (artEl && meta.art) {
                artEl.src = meta.art;
            }
        } catch (e) { console.error("Update error:", e); }
    },

    showTab(tab) {
        this.currentTab = tab;
        const content = document.getElementById('content-area');

        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.style.color = 'rgba(255,255,255,0.3)';
            btn.classList.remove('bg-white/10');
        });
        const activeBtn = document.getElementById(`btn-${tab}`);
        if (activeBtn) {
            activeBtn.style.color = '#3b82f6';
            activeBtn.classList.add('bg-white/10');
        }

        if (tab === 'radio') this.renderRadio(content);
        else if (tab === 'schedule') this.renderSchedule(content);
        else if (tab === 'news' && typeof NewsEngine !== 'undefined') NewsEngine.render(content);
        else if (tab === 'settings' && typeof SettingsEngine !== 'undefined') SettingsEngine.render(content);
    },

    renderRadio(container) {
        container.innerHTML = `
        <div class="w-full max-w-lg flex flex-col items-center animate-in fade-in duration-700">
        <div class="h-16 w-full mb-8 flex justify-center items-center">
        <canvas id="visualizer-canvas" style="width: 260px; height: 60px;"></canvas>
        </div>

        <div class="ios-glass w-full p-4 rounded-[2.5rem] flex items-center gap-4 border border-white/10 shadow-2xl">
        <div class="w-16 h-16 flex-shrink-0">
        <img id="album-art" src="album_art.1766384036.jpg"
        class="w-full h-full rounded-2xl object-cover shadow-lg transition-transform duration-500 ${RadioEngine.isPlaying ? 'scale-105' : ''}">
        </div>
        <div class="flex-1 text-right overflow-hidden">
        <h1 id="track-title" class="font-bold truncate text-white text-lg">راديو وياك</h1>
        <p id="track-artist" class="text-blue-400 text-sm truncate italic opacity-90">بث مباشر</p>
        </div>
        <button onclick="app.toggleRadio()" class="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all">
        <div id="play-icon-svg">
        ${RadioEngine.isPlaying ?
            '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12"/></svg>' :
            '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'}
            </div>
            </button>
            </div>
            </div>
            `;
            // تشغيل السلايدر في الخلفية
            SliderEngine.render('slider-anchor');
            if (RadioEngine.isPlaying) this.startVisualizer();
            this.updateRadioInfo();
    },

    startVisualizer() {
        const canvas = document.getElementById('visualizer-canvas');
        if (!canvas || !RadioEngine.analyser) return;
        const ctx = canvas.getContext('2d');
        const analyser = RadioEngine.analyser;
        const data = new Uint8Array(analyser.frequencyBinCount);

        const draw = () => {
            this.animationId = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(data);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#3b82f6';
            const barWidth = 3;
            const gap = 4;
            for (let i = 0; i < 20; i++) {
                const h = (data[i] / 255) * canvas.height;
                ctx.fillRect((canvas.width/2) + (i*(barWidth+gap)), (canvas.height-h)/2, barWidth, h);
                ctx.fillRect((canvas.width/2) - (i*(barWidth+gap)), (canvas.height-h)/2, barWidth, h);
            }
        };
        draw();
    },

    toggleRadio() {
        const playing = RadioEngine.toggle();
        const icon = document.getElementById('play-icon-svg');
        const img = document.getElementById('album-art');

        if (playing) {
            icon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12"/></svg>';
            if (img) img.classList.add('scale-105');
            this.startVisualizer();
        } else {
            icon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
            if (img) img.classList.remove('scale-105');
            cancelAnimationFrame(this.animationId);
        }
    },

    renderSchedule(container) {
        const items = ScheduleData.map(item => `
        <div class="ios-glass p-5 rounded-[2rem] flex gap-4 mb-4">
        <div class="text-blue-400 font-bold">${item.time}</div>
        <div class="text-right flex-1">
        <div class="font-bold">${item.title}</div>
        <div class="text-xs opacity-50">${item.presenter}</div>
        </div>
        </div>
        `).join('');
        container.innerHTML = `<div class="p-4 w-full h-full overflow-y-auto custom-scrollbar"><h2 class="text-2xl font-bold mb-6 italic">جدول البرامج</h2><div class="pb-20">${items}</div></div>`;
    }
};

window.onload = () => app.init();
