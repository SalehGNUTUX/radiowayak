
import React from 'react';
import { Clock, CalendarDays, X, User } from 'lucide-react';

interface ScheduleItem {
  time: string;
  period: 'صباحاً' | 'مساءً';
  title: string;
  presenter: string;
}

const scheduleData: ScheduleItem[] = [
  { time: '6:00', period: 'صباحاً', title: 'بودكاست من مقالات الشيخ سيد مبارك', presenter: 'الشيخ سيد مبارك' },
  { time: '6:05', period: 'صباحاً', title: 'برنامج الدين والحياة', presenter: 'الشيخ أحمد النقيب' },
  { time: '6:16', period: 'صباحاً', title: 'تلاوة مجودة', presenter: '' },
  { time: '6:41', period: 'صباحاً', title: 'برنامج أصحابي', presenter: 'د. مازن السرساوي' },
  { time: '8:30', period: 'صباحاً', title: 'برنامج تفسير الإشارات الكونية', presenter: 'البروفيسور زغلول النجار رحمه الله' },
  { time: '8:40', period: 'صباحاً', title: 'تلاوة مجودة', presenter: '' },
  { time: '9:05', period: 'صباحاً', title: 'برنامج قصة النور', presenter: 'الشيخ فهد الجريوي' },
  { time: '10:30', period: 'صباحاً', title: 'برنامج أولئك آبائي', presenter: 'الشيخ المحدث أبو إسحاق الحويني' },
  { time: '10:43', period: 'صباحاً', title: 'تلاوة مجودة', presenter: '' },
  { time: '11:08', period: 'صباحاً', title: 'برنامج بصائر من سورة الفاتحة', presenter: 'الشيخ المربي محمد حسين يعقوب' },
  { time: '12:00', period: 'مساءً', title: 'تلاوات خاشعة', presenter: 'القارئ الشيخ أحمد مطر' },
  { time: '1:00', period: 'مساءً', title: 'برنامج مفتاح دار السعادة', presenter: 'د. عبدالعظيم بن بدوي' },
  { time: '1:25', period: 'مساءً', title: 'تلاوة مجودة', presenter: '' },
  { time: '1:50', period: 'مساءً', title: 'برنامج قصة الخلافة', presenter: 'د. راغب السرجاني' },
  { time: '3:30', period: 'مساءً', title: 'برنامج تفسير القرآن الكريم', presenter: 'الشيخ العلامة عبدالرحمن عبدالخالق' },
  { time: '3:56', period: 'مساءً', title: 'تلاوة مجودة', presenter: '' },
  { time: '4:21', period: 'مساءً', title: 'برنامج مدرسة الحياة', presenter: 'الشيخ المحدث أبو إسحاق الحويني' },
];

interface ScheduleTabProps {
  onClose: () => void;
}

const ScheduleTab: React.FC<ScheduleTabProps> = ({ onClose }) => {
  return (
    <div className="w-full h-full flex flex-col bg-transparent text-white relative z-10">
      {/* Header */}
      <div className="p-6 md:p-8 flex items-center justify-between z-10 max-w-5xl mx-auto w-full bg-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-lg">
            <CalendarDays className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-normal tracking-tight">الجدول اليومي</h1>
            <p className="text-[10px] text-blue-400/50 uppercase tracking-[0.2em] font-light">بث راديو وياك المباشر</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 md:px-12 pb-44 custom-scrollbar bg-transparent">
        <div className="max-w-4xl mx-auto w-full space-y-2">
          {scheduleData.map((item, index) => (
            <div 
              key={index} 
              className="p-5 flex items-center gap-6 border-b border-white/5 transition-all animate-soft-enter hover:bg-white/[0.05] rounded-3xl"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              {/* Time Indicator */}
              <div className="flex flex-col items-center justify-center min-w-[80px] py-2 border border-white/10 rounded-2xl bg-black/20">
                <span className="text-xl font-medium text-white">{item.time}</span>
                <span className="text-[10px] text-white/40">{item.period}</span>
              </div>

              {/* Program Details */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-normal text-white truncate leading-tight mb-1 drop-shadow-md">
                  {item.title}
                </h3>
                {item.presenter ? (
                  <div className="flex items-center gap-2 text-blue-400/80">
                    <User className="w-3.5 h-3.5" />
                    <span className="text-xs">{item.presenter}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-white/40">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs italic">فقرة مستمرة</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScheduleTab;
