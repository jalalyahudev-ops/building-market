import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Lang = 'ru' | 'uz';

const translations: Record<Lang, Record<string, string>> = {
  // Add common translations here
  ru: {
    // Navigation
    'nav.marketplace': 'Товары',
    'nav.workers': 'Услуги & Мастера',
    'nav.cart': 'Корзина',
    'nav.login': 'Войти',
    'nav.register': 'Регистрация',
    'nav.dashboard': 'Кабинет',
    'nav.logout': 'Выйти',

    // Roles & Login
    'role.buyer': 'Покупатель',
    'role.seller': 'Продавец (Бизнес)',
    'role.admin': 'Администратор',
    'login.welcome': 'Добро пожаловать',
    'login.desc': 'Войдите, чтобы совершать покупки и управлять магазином',
    'register.desc': 'Зарегистрируйтесь, чтобы покупать материалы или продавать свои услуги',
    'login.google': 'Войти через Google',
    'login.terms': 'Продолжая, вы соглашаетесь с условиями использования платформы BuildMarket.',
    'login.already_have_account': 'Уже есть аккаунт?',
    'choose.role.title': 'Кем вы являетесь?',
    'choose.role.desc': 'Выберите тип аккаунта, чтобы продолжить использование платформы.',

    // General
    'btn.select': 'Выбрать',
    'btn.other_account': 'Войти под другим аккаунтом'
  },
  uz: {
    // Navigation
    'nav.marketplace': 'Mahsulotlar',
    'nav.workers': 'Xizmatlar va Ustalar',
    'nav.cart': 'Savatcha',
    'nav.login': 'Kirish',
    'nav.register': 'Ro\'yxatdan o\'tish',
    'nav.dashboard': 'Shaxsiy xona',
    'nav.logout': 'Chiqish',

    // Roles & Login
    'role.buyer': 'Xaridor',
    'role.seller': 'Sotuvchi (Biznes)',
    'role.admin': 'Administrator',
    'login.welcome': 'Xush kelibsiz',
    'login.desc': 'Xarid qilish va do\'konni boshqarish uchun tizimga kiring',
    'register.desc': 'Xarid qilish yoki xizmatlaringizni sotish uchun ro\'yxatdan o\'ting',
    'login.google': 'Google orqali kirish',
    'login.terms': 'Davom etish orqali siz BuildMarket platformasidan foydalanish shartlariga rozilik bildirasiz.',
    'login.already_have_account': 'Sizda allaqachon hisob bormi?',
    'choose.role.title': 'Siz kimsiz?',
    'choose.role.desc': 'Platformadan foydalanishni davom ettirish uchun hisob turini tanlang.',

    // General
    'btn.select': 'Tanlash',
    'btn.other_account': 'Boshqa hisob bilan kirish'
  }
};

interface LangState {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

export const useLangStore = create<LangState>()(
  persist(
    (set, get) => ({
      lang: 'ru',
      setLang: (lang) => set({ lang }),
      t: (key) => translations[get().lang]?.[key] || key,
    }),
    {
      name: 'lang-storage',
    }
  )
);
