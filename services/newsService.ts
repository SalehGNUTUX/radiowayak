import { NewsItem } from "../types";

/**
 * دالة لجلب المقالات حصرياً من مصدر مقالات راديو وياك المعتمد.
 * يتم جلب المحتوى الأصلي وتنسيق العناوين (بحد أقصى 6 كلمات متبوعة بـ .....).
 * هذا القسم خالٍ تماماً من أي تدخل للذكاء الاصطناعي.
 */
export const fetchDailyMuslimArticles = async (hijriDate?: string): Promise<NewsItem[]> => {
  try {
    // المصدر الوحيد المعتمد المطلوب: https://tg.i-c-a.su/rss/radiowayakart
    const rssSource = "https://tg.i-c-a.su/rss/radiowayakart";
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssSource)}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status === 'ok' && data.items) {
      return data.items.map((item: any, index: number) => {
        // تنظيف المحتوى واستخراج الصور المرفقة بالمنشور
        let imageUrl = item.thumbnail || item.enclosure?.link || "";
        
        // محاولة استخراج أول صورة من داخل المحتوى إذا لم تكن موجودة في الحقول الأساسية
        if (!imageUrl && item.content) {
            const imgMatch = item.content.match(/<img[^>]+src="([^">]+)"/);
            if (imgMatch) imageUrl = imgMatch[1];
        }

        // إزالة وسوم HTML من الملخص لعرض نص نظيف في البطاقات
        const plainSummary = item.description 
          ? item.description.replace(/<[^>]*>?/gm, '').trim()
          : "";

        // معالجة العنوان: لا يزيد عن 6 كلمات ثم يتبعه .....
        const rawTitle = item.title || "تأملات إيمانية";
        const words = rawTitle.split(/\s+/).filter(Boolean);
        const formattedTitle = (words.length > 6 
          ? words.slice(0, 6).join(' ') 
          : words.join(' ')) + " .....";

        return {
          id: item.guid || `wayak-art-${index}`,
          title: formattedTitle,
          summary: plainSummary.substring(0, 180) + (plainSummary.length > 180 ? "..." : ""),
          author: item.author || "راديو وياك",
          source: "Radio Wayak",
          content: item.content, 
          image: imageUrl
        };
      });
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching articles from radiowayakart:", error);
    return [];
  }
};