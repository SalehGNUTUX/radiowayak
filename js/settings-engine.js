const SettingsEngine = {
    sleepTimeout: null,

    // إعداد مؤقت النوم (Sleep Timer)
    setSleepTimer(minutes) {
        if (this.sleepTimeout) clearTimeout(this.sleepTimeout);
        if (minutes === 0) return alert("تم إلغاء المؤقت");

        alert(`سيتم إيقاف الراديو بعد ${minutes} دقيقة`);
        this.sleepTimeout = setTimeout(() => {
            RadioEngine.audio.pause();
            RadioEngine.isPlaying = false;
            if (typeof app !== 'undefined') app.showTab('radio');
            alert("انتهى الوقت، تم إيقاف البث.");
        }, minutes * 60 * 1000);
    },

    // تغيير جودة البث (Quality Selector)
    changeQuality(url) {
        const wasPlaying = RadioEngine.isPlaying;
        RadioEngine.audio.src = url;
        if (wasPlaying) RadioEngine.audio.play();
        alert("تم تغيير جودة البث");
    },

    render(container) {
        container.innerHTML = `
        <div class="p-6 animate-fade-in text-right">
        <h2 class="text-2xl font-bold mb-8 flex items-center gap-2">
        <span class="w-1.5 h-6 bg-blue-500 rounded-full"></span> الإعدادات والتحكم
        </h2>

        <div class="space-y-6">
        <div class="ios-glass p-6 rounded-[2.5rem]">
        <p class="text-white/60 mb-4 text-sm">إيقاف التشغيل التلقائي</p>
        <div class="flex flex-wrap gap-2">
        ${[15, 30, 60].map(m => `
            <button onclick="SettingsEngine.setSleepTimer(${m})" class="bg-white/5 hover:bg-blue-600 px-4 py-2 rounded-xl transition-all">${m} دقيقة</button>
            `).join('')}
            <button onclick="SettingsEngine.setSleepTimer(0)" class="bg-red-500/20 text-red-400 px-4 py-2 rounded-xl">إلغاء</button>
            </div>
            </div>

            <div class="ios-glass p-6 rounded-[2.5rem]">
            <p class="text-white/60 mb-4 text-sm">جودة الصوت</p>
            <div class="flex gap-2">
            <button onclick="SettingsEngine.changeQuality('https://work.radiowayak.org/listen/live/live.mp3')" class="flex-1 bg-white/5 p-3 rounded-xl hover:bg-blue-600 transition-all text-sm font-bold">عالية (128kbps)</button>
            <button onclick="SettingsEngine.changeQuality('https://work.radiowayak.org/listen/live/radio64.mp3')" class="flex-1 bg-white/5 p-3 rounded-xl hover:bg-blue-600 transition-all text-sm font-bold">منخفضة (64kbps)</button>
            </div>
            </div>
            </div>
            </div>
            `;
    }
};
