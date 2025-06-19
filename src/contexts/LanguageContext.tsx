
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations = {
  en: {
    'appointments': 'Appointments',
    'manage_schedule': 'Manage your salon\'s booking schedule',
    'filter': 'Filter',
    'new_appointment': 'New Appointment',
    'today_appointments': 'Today\'s Appointments',
    'revenue_today': 'Revenue Today',
    'cancellations': 'Cancellations',
    'utilization': 'Utilization',
    'schedule_overview': 'Schedule Overview',
    'click_to_book': 'Click on empty time slots to book appointments',
    'time': 'Time',
    'book_appointment': 'Book Appointment',
    'client_name': 'Client Name',
    'phone_number': 'Phone Number',
    'service': 'Service',
    'duration': 'Duration',
    'price': 'Price',
    'cancel': 'Cancel',
    'book': 'Book Appointment',
    'staff': 'Staff',
    'efficiency': 'efficiency',
    'minutes': 'min',
    'from_yesterday': 'from yesterday',
    'click_to_book_slot': 'Click to book',
  },
  ar: {
    'appointments': 'المواعيد',
    'manage_schedule': 'إدارة جدول حجوزات صالونك',
    'filter': 'تصفية',
    'new_appointment': 'موعد جديد',
    'today_appointments': 'مواعيد اليوم',
    'revenue_today': 'إيرادات اليوم',
    'cancellations': 'الإلغاءات',
    'utilization': 'الاستخدام',
    'schedule_overview': 'نظرة عامة على الجدول',
    'click_to_book': 'اضغط على الأوقات الفارغة لحجز المواعيد',
    'time': 'الوقت',
    'book_appointment': 'حجز موعد',
    'client_name': 'اسم العميل',
    'phone_number': 'رقم الهاتف',
    'service': 'الخدمة',
    'duration': 'المدة',
    'price': 'السعر',
    'cancel': 'إلغاء',
    'book': 'حجز الموعد',
    'staff': 'الموظف',
    'efficiency': 'الكفاءة',
    'minutes': 'دقيقة',
    'from_yesterday': 'من الأمس',
    'click_to_book_slot': 'اضغط للحجز',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      <div dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'font-arabic' : ''}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
