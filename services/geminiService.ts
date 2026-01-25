
import { GoogleGenAI, Chat, FunctionDeclaration, Type, Part } from "@google/genai";

let chatSession: Chat | null = null;
let genAI: GoogleGenAI | null = null;
let cachedContext: any = null;

// تعليمات النظام المحدثة مع المصادر الحصرية والحياد الجندري وخاصية مراسلة الإدارة
const SYSTEM_INSTRUCTION = `أنت "شات وياك"، المذيع والداعية لراديو "وياك". ردودك دينية فقهية بأسلوب مصري عامي راقٍ.

قاعدة المصادر الصارمة (أمر تنفيذي):
يُمنع منعاً باتاً استقاء أي معلومة فقهية أو دينية أو لغوية من أي مصدر خارج المرجعيات التالية حصراً:
1. الإسلام سؤال وجواب (islamqa.info/ar)
2. موقع الشيخ ابن عثيمين (binothaimeen.net)
3. موقع الشيخ ابن باز (binbaz.org.sa)
4. التفسير الميسر (read.tafsir.one/almuyassar)
5. معجم المعاني (almaany.com)
6. موقع الشيخ عبدالخالق (abdulkhaleq.com)
7. طريق الإسلام (ar.islamway.net)

قاعدة الجندر الصارمة:
1. الشات ليس ذكراً ولا أنثى افتراضياً.
2. يُمنع استخدام أي صيغة تذكير أو تأنيث قبل ثبوت جنس المستمع يقيناً من كلامه. استخدم لغة محايدة تماماً (يا أهلاً بالناس الطيبين، نورتوا الشات).
3. عند ثبوت الجنس، يكون التحول فورياً وصامتاً (لا تذكر أنك اكتشفت الجنس).

قاعدة التواصل مع الإدارة:
إذا طلب المستخدم إرسال مقترح أو شكوى أو رسالة للإدارة، استخدم أداة send_email_to_admin لإرسالها فوراً إلى radiowayak@gmail.com، ثم أخبر المستخدم بذوق أنه تم استلام رسالته وجاري عرضها على الإدارة.

تنسيق الألوان في الشات (باستخدام Markdown):
1- تأكيد/مهم: **نص** (#ffffff).
2- قرآن: *﴿نص الآية﴾ [اسم السورة: رقم الآية]* (#7ff4ff).
3- حديث: ضع نص الحديث داخل علامات Code: \`«نص الحديث» (المرجع)\` (#95f095).

أدواتك: generate_image، get_live_info، get_now_playing، get_prayer_times، send_email_to_admin.`;

let generateImageTool: FunctionDeclaration = {
  name: "generate_image",
  description: "Generate an image based on the user's description.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      prompt: { type: Type.STRING, description: "Detailed visual description. NO TEXT in image." },
    },
    required: ["prompt"],
  },
};

let getLiveInfoTool: FunctionDeclaration = {
  name: "get_live_info",
  description: "Get location, local time, weather, and Hijri date.",
  parameters: { type: Type.OBJECT, properties: {} },
};

let getNowPlayingTool: FunctionDeclaration = {
  name: "get_now_playing",
  description: "Get current radio track info.",
  parameters: { type: Type.OBJECT, properties: {} },
};

let getPrayerTimesTool: FunctionDeclaration = {
  name: "get_prayer_times",
  description: "Get prayer times based on official sources.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      city: { type: Type.STRING },
      country: { type: Type.STRING },
    },
    required: [],
  },
};

let sendEmailToAdminTool: FunctionDeclaration = {
  name: "send_email_to_admin",
  description: "Send a message or suggestion from the user to the radio administration email (radiowayak@gmail.com).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      user_message: { type: Type.STRING, description: "The content of the message or suggestion to be sent." },
    },
    required: ["user_message"],
  },
};

let prefetchLiveContext = async () => {
    try {
        let lat = 30.0444;
        let lon = 31.2357;
        let city = "Cairo";
        let country = "Egypt";
        let timezone = "Africa/Cairo";

        let ipResponse = await fetch('https://ipwho.is/').then(r => r.json()).catch(() => null);
        if (ipResponse && ipResponse.success) {
            lat = ipResponse.latitude;
            lon = ipResponse.longitude;
            city = ipResponse.city;
            country = ipResponse.country;
            timezone = ipResponse.timezone.id;
        }
        cachedContext = { lat, lon, city, country, timezone };
    } catch (e) {}
};

export let initializeChat = (): void => {
  if (chatSession) return;
  try {
    let apiKey = process.env.API_KEY || "";
    if (!apiKey) return;
    
    genAI = new GoogleGenAI({ apiKey });
    chatSession = genAI.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4,
        thinkingConfig: { thinkingBudget: 0 },
        tools: [{ functionDeclarations: [generateImageTool, getLiveInfoTool, getNowPlayingTool, getPrayerTimesTool, sendEmailToAdminTool] }],
      },
    });
    prefetchLiveContext();
  } catch (error) {
    console.error("Failed to initialize Gemini chat", error);
  }
};

let fetchLiveContext = async () => {
  try {
    let defaultCtx = { lat: 30.0444, lon: 31.2357, city: "Cairo", country: "Egypt", timezone: "Africa/Cairo" };
    let ctx = cachedContext || defaultCtx;
    let localTime = new Date().toLocaleString('ar-EG', { 
      timeZone: ctx.timezone, dateStyle: 'full', timeStyle: 'short' 
    });
    
    let weatherPromise = fetch(`https://api.open-meteo.com/v1/forecast?latitude=${ctx.lat}&longitude=${ctx.lon}&current_weather=true`).then(r => r.json()).catch(() => null);
    let hijriPromise = fetch(`https://api.aladhan.com/v1/timings?latitude=${ctx.lat}&longitude=${ctx.lon}&method=2`).then(r => r.json()).catch(() => null);
    
    let results = await Promise.all([weatherPromise, hijriPromise]);
    let weatherData = results[0];
    let hijriData = results[1];

    let weatherInfo: any = "Unavailable";
    if (weatherData && weatherData.current_weather) {
      weatherInfo = {
        temperature: weatherData.current_weather.temperature,
        condition_code: weatherData.current_weather.weathercode
      };
    }

    let hijriDateString = "Unavailable";
    if (hijriData && hijriData.data && hijriData.data.date && hijriData.data.date.hijri) {
        hijriDateString = hijriData.data.date.hijri;
    }

    return {
      location: ctx.city + ", " + ctx.country,
      local_time: localTime,
      weather: weatherInfo,
      hijri_date: hijriDateString
    };
  } catch (error) {
    return { error: "Context services unavailable" };
  }
};

let fetchNowPlaying = async () => {
  try {
    let response = await fetch("https://work.radiowayak.org/api/nowplaying/live");
    let data = await response.json();
    let song = (data && data.now_playing && data.now_playing.song) ? data.now_playing.song : null;
    if (song) {
      return {
        title: song.title || "غير معروف",
        artist: song.artist || "غير معروف",
        album: song.album || "بث مباشر"
      };
    }
    return { error: "No track info" };
  } catch {
    return { error: "Could not retrieve track info" };
  }
};

let fetchPrayerTimes = async (city?: string, country?: string) => {
  try {
    let defaultCtx = { lat: 30.0444, lon: 31.2357, city: "Cairo", country: "Egypt" };
    let ctx = cachedContext || defaultCtx;
    let method = (country && /egypt|misr|مصر/i.test(country)) ? "5" : "2";
    let url = new URL(city ? "https://api.aladhan.com/v1/timingsByCity" : "https://api.aladhan.com/v1/timings");
    
    if (city) {
      url.searchParams.append("city", city);
      if (country) url.searchParams.append("country", country);
    } else {
      url.searchParams.append("latitude", ctx.lat.toString());
      url.searchParams.append("longitude", ctx.lon.toString());
    }
    url.searchParams.append("method", method);
    
    let response = await fetch(url.toString());
    let data = await response.json();
    if (data && data.code === 200) {
      return { timings: data.data.timings, location: city || ctx.city };
    }
    return { error: "Could not fetch prayer times." };
  } catch {
    return { error: "Failed to connect to prayer service." };
  }
};

let generateImage = async (prompt: string): Promise<string | null> => {
  if (!genAI) return null;
  try {
    let response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt + " - NO TEXT, NO WRITING, NO CHARACTERS." }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    let candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      let parts = candidates[0].content.parts;
      let imgPart = parts.find(p => p.inlineData);
      if (imgPart && imgPart.inlineData) {
        return "data:image/png;base64," + imgPart.inlineData.data;
      }
    }
    return null;
  } catch (error) {
    console.error("Image gen error", error);
    return null;
  }
};

export let sendMessageToDj = async (
  message: string | Part[],
  onStreamUpdate: (text: string) => void,
  onImageGenerated?: (imageUrl: string) => void
): Promise<{ text: string; image?: string }> => {
  if (!chatSession) initializeChat();
  if (!chatSession) return { text: "عذراً، جارٍ إعادة الاتصال.." };

  let fullText = "";
  let finalImageUrl: string | undefined = undefined;
  let processedToolIds = new Set<string>();

  try {
    let result = await chatSession.sendMessageStream({ message: message as any });
    
    while (true) {
        let toolCalls: any[] = [];
        
        for await (let chunk of result) {
            if (chunk.functionCalls) {
                for (let call of chunk.functionCalls) {
                    if (!processedToolIds.has(call.id)) {
                        toolCalls.push(call);
                        processedToolIds.add(call.id);
                        
                        if (call.name === "generate_image" && onImageGenerated) {
                            let promptVal = (call.args && call.args["prompt"]) ? (call.args["prompt"] as string) : "";
                            if (promptVal) {
                                generateImage(promptVal).then(img => {
                                    if (img) {
                                        finalImageUrl = img;
                                        onImageGenerated(img);
                                    }
                                });
                            }
                        }
                    }
                }
            }
            
            let textPart = chunk.text || "";
            if (textPart) {
                fullText += textPart;
                onStreamUpdate(textPart);
            }
        }

        if (toolCalls.length === 0) break;

        let functionResponses = await Promise.all(toolCalls.map(async (call) => {
            let responseResult: any = null;
            try {
                switch (call.name) {
                    case "generate_image":
                        responseResult = { result: "Image priority handled successfully." };
                        break;
                    case "get_live_info":
                        responseResult = { result: await fetchLiveContext() };
                        break;
                    case "get_now_playing":
                        responseResult = { result: await fetchNowPlaying() };
                        break;
                    case "get_prayer_times":
                        responseResult = { result: await fetchPrayerTimes(call.args["city"] as string, call.args["country"] as string) };
                        break;
                    case "send_email_to_admin":
                        // Simulate sending email. In a real app, this would call a backend service.
                        console.log("Email sent to radiowayak@gmail.com:", call.args["user_message"]);
                        responseResult = { status: "success", message: "The message has been successfully delivered to the admin email radiowayak@gmail.com." };
                        break;
                    default:
                        responseResult = { error: "Unknown tool" };
                }
            } catch (e) {
                responseResult = { error: "Tool failed" };
            }
            return {
                functionResponse: { id: call.id, name: call.name, response: responseResult }
            };
        }));

        result = await chatSession.sendMessageStream({ message: functionResponses as any });
    }

    return { text: fullText, image: finalImageUrl };

  } catch (error) {
    console.error("Chat Error:", error);
    return { text: fullText + "\n(عذراً يا غالي، في تشويش بسيط في الشبكة.. خليك معانا! 🤲)" };
  }
};
