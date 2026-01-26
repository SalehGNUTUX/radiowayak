/**
 * راديو وياك - المحرك الرئيسي (النسخة المحدثة لربط كافة المكونات)
 */

const app = {
    currentTab: 'radio',
    updateInterval: null,
    animationId: null,

    // 1. التشغيل المبدئي
    async init() {
        console.log("جاري تشغيل محرك راديو وياك...");
        RadioEngine.init();
        this.showTab('radio');
        this.updateRadioInfo();
        this.updateInterval = setInterval(() => this.updateRadioInfo(), 10000);
    },

    // 2. تحديث البيانات (اسم السورة/المنشد)
    async updateRadioInfo() {
        const meta = await RadioEngine.getMetadata();
        const titleEl = document.getElementById('track-title');
        const artistEl = document.getElementById('track-artist');
        const artEl = document.getElementById('album-art');

        if (titleEl) titleEl.innerText = meta.title;
        if (artistEl) artistEl.innerText = meta.artist;
        if (artEl && meta.art) {
            artEl.src = meta.art;
            this.updateFavicon(meta.art);
        }
    },

    updateFavicon(url) {
        let link = document.querySelector("link[rel~='icon']");
        if (link) link.href = url;
    },

    // 3. نظام التنقل (تمت إضافة الحالات الجديدة هنا)
    showTab(tab) {
        this.currentTab = tab;
        const content = document.getElementById('content-area');

        // تحديث شكل أزرار القائمة السفلية
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.style.color = 'rgba(255,255,255,0.3)';
            btn.classList.remove('bg-white/10');
        });
        const activeBtn = document.getElementById(`btn-${tab}`);
        if (activeBtn) {
            activeBtn.style.color = '#3b82f6';
            activeBtn.classList.add('bg-white/10');
        }

        // منطق عرض التبويبات
        if (tab === 'radio') {
            this.renderRadio(content);
        } else if (tab === 'schedule') {
            this.renderSchedule(content);
        } else if (tab === 'news') {
            if (typeof NewsEngine !== 'undefined') NewsEngine.render(content);
        } else if (tab === 'settings') {
            if (typeof SettingsEngine !== 'undefined') SettingsEngine.render(content);
        } else if (tab === 'articles') {
            if (typeof ArticlesEngine !== 'undefined') ArticlesEngine.render(content);
        }
    },

    // 4. عرض واجهة الراديو
    renderRadio(container) {
        container.innerHTML = `
        <div class="text-center w-full max-w-sm animate-in fade-in duration-500">
        <div class="relative group mx-auto w-64 h-64 mb-10">
        <div id="glow-effect" class="absolute inset-0 bg-blue-600/20 blur-3xl rounded-full transition-opacity ${RadioEngine.isPlaying ? 'opacity-100' : 'opacity-0'}"></div>
        <img id="album-art" src="album_art.1766384036.jpg"
        class="relative z-10 w-full h-full rounded-[3.5rem] object-cover shadow-2xl border border-white/10 transition-transform duration-700 ${RadioEngine.isPlaying ? 'scale-105' : 'scale-100'}">
        </div>

        <div class="h-16 w-full mb-6 flex items-center justify-center">
        <canvas id="visualizer-canvas" style="width: 200px; height: 60px;"></canvas>
        </div>

        <h1 id="track-title" class="text-2xl font-bold mb-2 tracking-tight">راديو وياك</h1>
        <p id="track-artist" class="text-blue-400 text-lg mb-10 font-light italic">بث مباشر</p>

        <button onclick="app.toggleRadio()"
        class="w-24 h-24 bg-white text-black rounded-full flex items-center justify-center mx-auto shadow-2xl hover:scale-110 active:scale-90 transition-all">
        <div id="play-icon-svg">
        ${RadioEngine.isPlaying ?
            '<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12"/></svg>' :
            '<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'}
            </div>
            </button>
            </div>
            `;
            if (RadioEngine.isPlaying) this.startVisualizer();
            this.updateRadioInfo();
    },

    // 5. عرض الجدول
    renderSchedule(container) {
        const itemsHtml = ScheduleData.map((item) => `
        <div class="ios-glass p-5 rounded-[2rem] flex items-center gap-5 mb-4 border border-white/5">
        <div class="bg-blue-600/20 min-w-[75px] py-2 rounded-2xl text-blue-400 text-center font-bold">
        <div class="text-lg">${item.time}</div>
        <div class="text-[10px] opacity-70">${item.period}</div>
        </div>
        <div class="flex-1">
        <div class="text-white font-medium text-lg leading-tight">${item.title}</div>
        <div class="text-white/40 text-xs mt-1 italic">${item.presenter || 'فقرة إذاعية'}</div>
        </div>
        </div>
        `).join('');

        container.innerHTML = `
        <div class="w-full h-full p-4 overflow-y-auto custom-scrollbar animate-in slide-in-from-bottom-5 duration-500">
        <h2 class="text-2xl font-bold mb-6 text-white flex items-center gap-2">
        <span class="w-1.5 h-6 bg-blue-500 rounded-full"></span> جدول البرامج
        </h2>
        <div class="pb-20">${itemsHtml}</div>
        </div>`;
    },

    // 6. محرك الذبذبات
    startVisualizer() {
        const canvas = document.getElementById('visualizer-canvas');
        if (!canvas || !RadioEngine.analyser) return;
        const ctx = canvas.getContext('2d');
        const analyser = RadioEngine.analyser;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            this.animationId = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const barWidth = 3;
            const gap = 2;
            const barCount = 20;
            const centerX = canvas.width / 2;

            for (let i = 0; i < barCount; i++) {
                const v = dataArray[i] || 0;
                const h = (v / 255) * canvas.height * 0.8 + 2;
                ctx.fillStyle = '#3b82f6';
                ctx.fillRect(centerX + (i * (barWidth + gap)), (canvas.height - h)/2, barWidth, h);
                ctx.fillRect(centerX - (i * (barWidth + gap)), (canvas.height - h)/2, barWidth, h);
            }
        };
        draw();
    },

    // 7. التحكم في التشغيل
    toggleRadio() {
        const playing = RadioEngine.toggle();
        const iconContainer = document.getElementById('play-icon-svg');
        const glow = document.getElementById('glow-effect');
        const img = document.getElementById('album-art');

        if (playing) {
            iconContainer.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12"/></svg>';
            if (glow) glow.style.opacity = '1';
            if (img) img.style.transform = 'scale(1.05)';
            this.startVisualizer();
        } else {
            iconContainer.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
            if (glow) glow.style.opacity = '0';
            if (img) img.style.transform = 'scale(1.00)';
            cancelAnimationFrame(this.animationId);
        }
    }
};

window.onload = () => app.init();
