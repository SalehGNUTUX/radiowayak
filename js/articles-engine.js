const ArticlesEngine = {
    selectedArticle: null,

    render(container) {
        container.innerHTML = `
        <div class="p-4">
        <h2 class="text-2xl font-bold mb-6">المقالات المختارة</h2>
        <div id="articles-list" class="grid gap-4">
        <div class="ios-glass p-5 rounded-3xl cursor-pointer hover:scale-[1.02] transition-transform" onclick="ArticlesEngine.openArticle(1)">
        <img src="album_art.1766384036.jpg" class="w-full h-32 object-cover rounded-2xl mb-4">
        <h3 class="font-bold">سلسلة الإشارات الكونية في القرآن</h3>
        <p class="text-xs text-white/40 mt-2">بقلم: د. زغلول النجار</p>
        </div>
        </div>
        </div>
        `;
    },

    openArticle(id) {
        // منطق فتح نافذة منبثقة (Full Screen Overlay) لعرض المقال
        const overlay = document.createElement('div');
        overlay.className = "fixed inset-0 z-[200] bg-black/90 backdrop-blur-2xl p-8 overflow-y-auto";
        overlay.innerHTML = `
        <div class="max-w-2xl mx-auto">
        <button onclick="this.parentElement.parentElement.remove()" class="mb-8 bg-white/10 p-3 rounded-full text-white">إغلاق</button>
        <h1 class="text-3xl font-bold mb-6">سلسلة الإشارات الكونية في القرآن</h1>
        <div class="text-white/80 leading-relaxed text-lg text-justify" dir="rtl">
        هذا النص هو محاكاة لمحتوى المقال الأصلي... القرآن الكريم مليء بالآيات التي تدعو للتفكر في خلق السماوات والأرض...
        </div>
        </div>
        `;
        document.body.appendChild(overlay);
    }
};
