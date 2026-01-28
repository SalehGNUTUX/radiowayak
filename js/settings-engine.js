const SettingsEngine = {
    sleepTimeout: null,

    setSleepTimer(minutes) {
        if (this.sleepTimeout) clearTimeout(this.sleepTimeout);
        if (minutes === 0 || minutes === "" || !minutes) {
            alert("تم إلغاء المؤقت أو لم يتم إدخال وقت صحيح");
            return;
        }

        alert(`سيتم إيقاف الراديو تلقائياً بعد ${minutes} دقيقة`);
        this.sleepTimeout = setTimeout(() => {
            if (typeof RadioEngine !== 'undefined') {
                RadioEngine.audio.pause();
                RadioEngine.isPlaying = false;
                if (typeof app !== 'undefined') app.showTab('radio');
                alert("انتهى الوقت، تم إيقاف البث.");
            }
        }, minutes * 60 * 1000);
    },

    changeQuality(url) {
        if (typeof RadioEngine === 'undefined') return;
        const wasPlaying = RadioEngine.isPlaying;
        RadioEngine.audio.src = url;
        if (wasPlaying) RadioEngine.audio.play();
        alert("تم تغيير جودة البث");
    },

    render(container) {
        container.innerHTML = `
        <div class="p-6 animate-in fade-in duration-500 text-right">
        <h2 class="text-2xl font-bold mb-8 flex items-center gap-2">
        <span class="w-1.5 h-6 bg-blue-500 rounded-full"></span> الإعدادات والتحكم
        </h2>

        <div class="space-y-6">
        <div class="ios-glass p-6 rounded-[2.5rem] border border-white/5">
        <p class="text-white/60 mb-4 text-sm">إيقاف التشغيل التلقائي</p>
        <div class="flex flex-wrap gap-2 mb-4">
        ${[15, 30, 60].map(m => `
            <button onclick="SettingsEngine.setSleepTimer(${m})" class="bg-white/5 hover:bg-blue-600 px-4 py-2 rounded-xl transition-all text-sm">${m} دقيقة</button>
            `).join('')}
            <button onclick="SettingsEngine.setSleepTimer(0)" class="bg-red-500/20 text-red-400 px-4 py-2 rounded-xl text-sm">إلغاء</button>
            </div>

            <div class="flex gap-2 border-t border-white/5 pt-4">
            <input type="number" id="custom-minutes" placeholder="أدخل الدقائق..."
            class="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-sm focus:outline-none focus:border-blue-500 text-white text-center">
            <button onclick="SettingsEngine.setSleepTimer(document.getElementById('custom-minutes').value)"
            class="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-bold active:scale-95 transition-all">تأكيد</button>
            </div>
            </div>

            <div class="ios-glass p-6 rounded-[2.5rem] border border-white/5">
            <p class="text-white/60 mb-4 text-sm">جودة الصوت</p>
            <div class="flex gap-2">
            <button onclick="SettingsEngine.changeQuality('https://work.radiowayak.org/listen/live/live.mp3')" class="flex-1 bg-white/5 p-3 rounded-xl hover:bg-blue-600 transition-all text-xs font-bold">عالية (128k)</button>
            <button onclick="SettingsEngine.changeQuality('https://work.radiowayak.org/listen/live/radio64.mp3')" class="flex-1 bg-white/5 p-3 rounded-xl hover:bg-blue-600 transition-all text-xs font-bold">منخفضة (64k)</button>
            </div>
            </div>
            </div>
            </div>`;
    }
};
