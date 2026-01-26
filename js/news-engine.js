const NewsEngine = {
    async fetchNews() {
        // محاكاة لجلب الأخبار من RSS كما في ملفك الأصلي
        return [
            { id: 1, title: "انطلاق البث التجريبي لراديو وياك الجديد", author: "إدارة الراديو", content: "يسرنا إطلاق الواجهة الجديدة..." },
            { id: 2, title: "جدول برامج شهر رجب المبارك", author: "قسم البرامج", content: "تتابعون اليوم مجموعة من التلاوات..." }
        ];
    },

    render(container) {
        this.fetchNews().then(news => {
            container.innerHTML = `
            <div class="p-4 animate-fade-in">
            <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
            <span class="w-1.5 h-6 bg-blue-500 rounded-full"></span> آخر الأخبار
            </h2>
            <div class="space-y-4">
            ${news.map(item => `
                <div class="ios-glass p-6 rounded-[2rem] border border-white/5 hover:bg-white/10 transition-all">
                <h3 class="text-lg font-bold mb-2">${item.title}</h3>
                <p class="text-white/60 text-sm mb-4">${item.content}</p>
                <div class="text-xs text-blue-400">بواسطة: ${item.author}</div>
                </div>
                `).join('')}
                </div>
                </div>
                `;
        });
    }
};
