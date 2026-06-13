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
    'role.buyer.desc': 'Я хочу находить и покупать строительные материалы по лучшим ценам.',
    'role.seller': 'Продавец (Бизнес)',
    'role.seller.desc': 'Я хочу открыть магазин и продавать стройматериалы на платформе.',
    'role.admin': 'Администратор',
    'role.admin.desc': 'Управление платформой, контроль пользователей и заказов.',
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
    'btn.other_account': 'Войти под другим аккаунтом',
    
    // Dashboard Menu
    'dashboard.menu.overview': 'Обзор',
    'dashboard.menu.profile': 'Настройки профиля',
    'dashboard.menu.orders': 'Мои заказы',
    'dashboard.menu.store': 'Управление магазином',
    'dashboard.menu.customer_orders': 'Заказы клиентов',
    'dashboard.menu.store_settings': 'Настройки магазина',
    'dashboard.menu.admin_panel': 'Панель администратора',

    // Dashboard Overview
    'dashboard.overview.welcome': 'С возвращением,',
    'dashboard.overview.account_type': 'Тип аккаунта:',
    'dashboard.overview.profile_desc': 'Управляйте личной информацией, адресом и безопасностью.',
    'dashboard.overview.my_orders_desc': 'Просматривайте и отслеживайте свои предыдущие и активные заказы на материалы.',
    'dashboard.overview.store_desc_has': 'Управляйте запасами вашего магазина и просматривайте продажи.',
    'dashboard.overview.store_desc_none': 'Зарегистрируйте магазин, чтобы начать продавать.',
    
    // Dashboard Stats
    'dashboard.stats.title': 'Обзор магазина',
    'dashboard.stats.total_sales': 'Общие продажи',
    'dashboard.stats.products': 'Товары',
    'dashboard.stats.active_orders': 'Активные заказы',
    'dashboard.stats.new_product': 'Новый товар',

    // Admin Panel
    'admin.stats.title': 'Статистика платформы',
    'admin.stats.total_stores': 'Всего магазинов',
    'admin.stats.total_products': 'Всего товаров',
    'admin.stats.total_orders': 'Всего заказов',
    'admin.categories.title': 'Глобальные категории',
    'admin.categories.add': 'Добавить категорию',
    'admin.categories.edit': 'Изменить',
    
    'admin.applications.title': 'Заявки от магазинов',
    'admin.applications.empty': 'Магазины не найдены',
    'admin.applications.approve': 'Одобрить',
    'admin.applications.reject': 'Отклонить',
    'admin.applications.revoke': 'Отозвать',

    // Store Dashboard
    'store.dashboard.title': 'Управление магазином',
    'store.dashboard.loading': 'Загрузка информации о магазине...',
    'store.dashboard.status.live': 'Размещен на платформе',
    'store.dashboard.status.pending': 'Ожидает одобрения',
    'store.dashboard.btn.add_material': 'Добавить материал',
    'store.dashboard.empty.title': 'Ваш склад пуст',
    'store.dashboard.empty.desc': 'Добавьте свой первый строительный материал, чтобы начать продажи.',
    'store.dashboard.empty.btn': 'Импорт каталога',
    'store.dashboard.stock': 'В наличии:',
    'store.dashboard.under_review.title': 'Магазин на проверке',
    'store.dashboard.under_review.desc': 'Наша служба поддержки проверяет информацию о вашем магазине. Вы будете уведомлены, как только ваш магазин будет одобрен и готов принимать заказы.',

    // Become a Seller
    'store.register.title': 'Стать продавцом',
    'store.register.desc': 'Присоединяйтесь к сотням поставщиков на BuildMarket. Пройдите регистрацию, чтобы разместить свои материалы и охватить больше покупателей.',
    'store.register.label.name': 'Название магазина',
    'store.register.label.desc': 'Описание',
    'store.register.label.address': 'Адрес',
    'store.register.label.phone': 'Телефон',
    'store.register.btn.submit': 'Отправить заявку магазина',

    // Add Product
    'store.product.add.title': 'Добавить новый товар',
    'store.product.add.back': 'Вернуться на склад',
    'store.product.add.upload.title': 'Загрузить фото товара',
    'store.product.add.upload.desc': 'Загрузите четкое фото. ИИ автоматически сгенерирует название, категорию и описание.',
    'store.product.add.upload.btn_remove': 'Удалить фото',
    'store.product.add.ai.title': 'Умный ассистент ИИ',
    'store.product.add.ai.desc': 'Оставьте название и описание пустыми, чтобы наш ИИ автоматически определил продукт и заполнил их на основе фото!',
    'store.product.add.label.name': 'Название товара (необязательно, если прикреплено фото)',
    'store.product.add.label.desc': 'Описание (необязательно)',
    'store.product.add.label.price': 'Цена (сум)',
    'store.product.add.label.stock': 'В наличии / Количество',
    'store.product.add.btn.adding': 'Добавление и категоризация...',
    'store.product.add.btn.add': 'Добавить авто-категоризированный товар',

    // My Orders
    'orders.my.title': 'Мои заказы',
    'orders.my.empty': 'Вы еще не сделали ни одного заказа.',
    'orders.my.order_num': 'Заказ #',
    'orders.my.download_invoice': 'Скачать чек',
    'orders.my.cancel_order': 'Отменить заказ',

    // Customer Orders
    'orders.customer.title': 'Заказы клиентов',
    'orders.customer.empty': 'Пока нет входящих заказов.',
    'orders.customer.accept': 'Принять заказ',
    'orders.customer.mark_completed': 'Отметить как выполненный',
    'orders.customer.cancel': 'Отменить',
    
    // Store Settings
    'store.settings.title': 'Настройки магазина',
    'store.settings.label.hours': 'Часы работы',
    'store.settings.btn.save': 'Сохранить изменения',

    // Profile Settings
    'profile.settings.title': 'Настройки профиля',
    'profile.settings.label.name': 'Имя',
    'profile.settings.label.email': 'Email',
    'profile.settings.email_desc': 'Электронная почта управляется вашим провайдером аутентификации.',
    'profile.settings.btn.save': 'Сохранить изменения',

    // Cart
    'cart.title': 'Корзина',
    'cart.empty.title': 'Ваша корзина пуста',
    'cart.empty.desc': 'Похоже, вы еще не добавили ни одного строительного материала.',
    'cart.empty.btn': 'Перейти к товарам',
    'cart.summary.title': 'Сумма заказа',
    'cart.summary.subtotal': 'Подытог',
    'cart.summary.items': 'товары',
    'cart.summary.tax': 'Примерный налог',
    'cart.summary.shipping': 'Доставка',
    'cart.summary.shipping_calc': 'Рассчитывается при оформлении',
    'cart.summary.total': 'Итого',
    'cart.btn.checkout': 'Оформить заказ',
    'cart.btn.processing': 'Обработка...',
    'cart.success.title': 'Заказ успешно оформлен!',
    'cart.success.desc': 'Ваш тестовый заказ был успешно размещен. Вскоре мы сымитируем доставку.',
    'cart.success.btn': 'Продолжить покупки',
    
    // Home
    'home.hero.title1': 'Доступные',
    'home.hero.title2': 'Материалы',
    'home.hero.desc': 'Сравнивайте цены, находите ближайшие магазины и покупайте выгодно. Более 50,000 товаров от проверенных продавцов.',
    'home.search.placeholder': 'Что вы ищете? Например: Цемент М500',
    'home.search.location': 'Город, адрес...',
    'home.search.btn': 'Найти',
    'home.categories.title': 'Популярные категории',
    'home.categories.all': 'Все категории',
    'home.categories.cement': 'Цемент и смеси',
    'home.categories.bricks': 'Кирпич и блоки',
    'home.categories.metal': 'Металлопрокат',
    'home.categories.wood': 'Пиломатериалы',
    'home.categories.bulk': 'Сыпучие',
    'home.categories.roofing': 'Кровля',
    'home.categories.electric': 'Электрика',
    'home.categories.plumbing': 'Сантехника',
    'home.features.logistics': 'Удобная логистика',
    'home.features.delivery': 'Быстрая доставка',
    'home.features.reviews': 'Честные отзывы',
    'home.features.rating': 'Достоверный рейтинг',
    'home.features.suppliers': 'Проверенные поставщики',
    'home.features.partners': 'Надежные партнеры',
    'home.trending.title1': 'Трендовые',
    'home.trending.title2': 'Материалы',
    'home.trending.all': 'Смотреть все',
    'home.trending.cement': 'Цемент Портланд М500',
    'home.trending.distance': '1.2km away',

    // Workers
    'workers.categories.loaders': 'Грузчики',
    'workers.categories.builders': 'Строители',
    'workers.categories.painters': 'Маляры',
    'workers.categories.concrete': 'Бетонщики',
    'workers.categories.electricians': 'Электрики',
    'workers.categories.plumbers': 'Сантехники',
    'workers.categories.cleaning': 'Уборка',
    
    'workers.payment.cash': 'Наличный расчет (Нал)',
    'workers.payment.transfer': 'Перечисление',
    'workers.payment.installments': 'В рассрочку (Насия)',

    'workers.error': 'Ошибка при обработке запроса: ',
    'workers.title': 'Услуги и Мастера',
    'workers.desc': 'Найдите специалистов и материалы или станьте мастером',
    'workers.tab.search': 'ПОИСК МАСТЕРОВ',
    'workers.tab.register': 'РЕГИСТРАЦИЯ МАСТЕРА',

    'workers.search.title': 'Умный поиск мастеров и материалов',
    'workers.search.desc': 'Опишите задачу и нужные материалы своими словами, и ИИ сам подберет людей, товары и подготовит договор.',
    'workers.search.placeholder': 'Например: Мне нужны 3 грузчика завтра в Ташкенте и 20 мешков цемента, 3 банки краски...',
    'workers.search.btn': 'Найти',
    'workers.search.btn_loading': 'Обработка (ИИ)...',

    'workers.result.title': 'Заявка сформирована',
    'workers.result.category': 'Категория мастеров',
    'workers.result.location': 'Локация и Время',
    'workers.result.not_specified': 'Не указано',
    'workers.result.materials_title': 'Необходимые строительные материалы',
    'workers.result.payment_title': 'Форма оплаты по договору',
    'workers.result.estimate': 'Примерная стоимость услуг (за смену):',
    'workers.result.estimate_desc1': 'ИИ проанализировал среднюю ставку по рынку:',
    'workers.result.estimate_desc2': 'сум/час за рабочего. Стоимость стройматериалов будет рассчитана отдельно при подтверждении магазином.',
    'workers.result.btn_contract': 'Заключить договор на услуги',

    'workers.contract.title': 'Договор успешно сформирован!',
    'workers.contract.desc1': 'Заявка на мастеров и строительные материалы передана в обработку. Форма оплаты:',
    'workers.contract.desc2': 'Специалисты свяжутся с вами в течение 10 минут.',
    'workers.contract.btn_new': 'Новый запрос',
    'workers.contract.btn_download': 'Скачать Договор (PDF)',

    'workers.catalog.title': 'Каталог услуг',
    'workers.catalog.from': 'от',
    'workers.catalog.per_hour': 'сум/ч',

    'workers.register.success.title': 'Регистрация успешна!',
    'workers.register.success.desc': 'Вы успешно зарегистрированы как мастер в платформе. Теперь клиенты смогут находить вас.',
    'workers.register.title': 'Станьте мастером платформы',
    'workers.register.desc': 'Заполните форму, чтобы получать заказы от строительных компаний и частных лиц.',
    'workers.register.label.name': 'Ваше Имя / ФИО',
    'workers.register.placeholder.name': 'Например: Рустам Ахмедов',
    'workers.register.label.phone': 'Телефон',
    'workers.register.label.category': 'Специализация (Категория)',
    'workers.register.terms.title': 'Договор Оферты',
    'workers.register.terms.desc': 'Регистрируясь, вы соглашаетесь на обработку заказов через платформу и можете принимать оплату перечислением, налом или в рассрочку (от банка).',
    'workers.register.btn': 'Зарегистрироваться',
    'workers.register.btn_loading': 'Регистрация...',
    'btn.details': 'Подробнее',
    'app.loading': 'Загрузка...',
    'error.default': 'Произошла ошибка: ',
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
    'role.buyer.desc': 'Men eng yaxshi narxlarda qurilish materiallarini topishni va sotib olishni xohlayman.',
    'role.seller': 'Sotuvchi (Biznes)',
    'role.seller.desc': 'Men do\'kon ochishni va platformada qurilish materiallarini sotishni xohlayman.',
    'role.admin': 'Administrator',
    'role.admin.desc': 'Platformani boshqarish, foydalanuvchilar va buyurtmalarni nazorat qilish.',
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
    'btn.other_account': 'Boshqa hisob bilan kirish',
    
    // Dashboard Menu
    'dashboard.menu.overview': 'Umumiy ko\'rinish',
    'dashboard.menu.profile': 'Profil sozlamalari',
    'dashboard.menu.orders': 'Mening buyurtmalarim',
    'dashboard.menu.store': 'Do\'konni boshqarish',
    'dashboard.menu.customer_orders': 'Mijozlar buyurtmalari',
    'dashboard.menu.store_settings': 'Do\'kon sozlamalari',
    'dashboard.menu.admin_panel': 'Administrator paneli',

    // Dashboard Overview
    'dashboard.overview.welcome': 'Xush kelibsiz,',
    'dashboard.overview.account_type': 'Hisob turi:',
    'dashboard.overview.profile_desc': 'Shaxsiy ma\'lumotlaringizni, manzilingizni va xavfsizlikni boshqaring.',
    'dashboard.overview.my_orders_desc': 'Oldingi va faol material buyurtmalaringizni ko\'ring va kuzatib boring.',
    'dashboard.overview.store_desc_has': 'Do\'kon zaxiralarini boshqaring va sotuvlarni ko\'ring.',
    'dashboard.overview.store_desc_none': 'Sotishni boshlash uchun do\'konni ro\'yxatdan o\'tkazing.',
    
    // Dashboard Stats
    'dashboard.stats.title': 'Do\'kon xulosasi',
    'dashboard.stats.total_sales': 'Umumiy sotuvlar',
    'dashboard.stats.products': 'Mahsulotlar',
    'dashboard.stats.active_orders': 'Faol buyurtmalar',
    'dashboard.stats.new_product': 'Yangi mahsulot',

    // Admin Panel
    'admin.stats.title': 'Platforma statistikasi',
    'admin.stats.total_stores': 'Jami do\'konlar',
    'admin.stats.total_products': 'Jami mahsulotlar',
    'admin.stats.total_orders': 'Jami buyurtmalar',
    'admin.categories.title': 'Global kategoriyalar',
    'admin.categories.add': 'Kategoriya qo\'shish',
    'admin.categories.edit': 'Tahrirlash',
    
    'admin.applications.title': 'Do\'kon arizalari',
    'admin.applications.empty': 'Do\'konlar topilmadi',
    'admin.applications.approve': 'Tasdiqlash',
    'admin.applications.reject': 'Rad etish',
    'admin.applications.revoke': 'Bekor qilish',

    // Store Dashboard
    'store.dashboard.title': 'Do\'konni boshqarish',
    'store.dashboard.loading': 'Do\'kon ma\'lumotlari yuklanmoqda...',
    'store.dashboard.status.live': 'Platformada joylashtirilgan',
    'store.dashboard.status.pending': 'Tasdiqlash kutilmoqda',
    'store.dashboard.btn.add_material': 'Material qo\'shish',
    'store.dashboard.empty.title': 'Omboringiz bo\'sh',
    'store.dashboard.empty.desc': 'Sotishni boshlash uchun o\'zingizning birinchi qurilish materialingizni qo\'shing.',
    'store.dashboard.empty.btn': 'Katalogni import qilish',
    'store.dashboard.stock': 'Mavjud:',
    'store.dashboard.under_review.title': 'Do\'kon ko\'rib chiqilmoqda',
    'store.dashboard.under_review.desc': 'Bizning qo\'llab-quvvatlash jamoamiz do\'koningiz ma\'lumotlarini tekshirmoqda. Do\'koningiz tasdiqlanishi va buyurtmalarni qabul qilishga tayyor bo\'lishi bilanoq sizga xabar beriladi.',

    // Become a Seller
    'store.register.title': 'Sotuvchi bo\'lish',
    'store.register.desc': 'BuildMarket\'da yuzlab yetkazib beruvchilarga qo\'shiling. Materiallaringizni joylashtirish va ko\'proq xaridorlarni qamrab olish uchun ro\'yxatdan o\'ting.',
    'store.register.label.name': 'Do\'kon nomi',
    'store.register.label.desc': 'Tavsifi',
    'store.register.label.address': 'Manzil',
    'store.register.label.phone': 'Telefon',
    'store.register.btn.submit': 'Do\'kon arizasini yuborish',

    // Add Product
    'store.product.add.title': 'Yangi mahsulot qo\'shish',
    'store.product.add.back': 'Omborga qaytish',
    'store.product.add.upload.title': 'Maxsulot rasmini yuklash',
    'store.product.add.upload.desc': 'Aniq rasmni yuklang. AI avtomatik ravishda nom, kategoriya va tavsifni yaratadi.',
    'store.product.add.upload.btn_remove': 'Rasmni o\'chirish',
    'store.product.add.ai.title': 'Aqlli AI yordamchi',
    'store.product.add.ai.desc': 'Nom va tavsifni bo\'sh qoldiring, shunda AI avtomatik ravishda mahsulotni aniqlaydi va rasm asosida to\'ldiradi!',
    'store.product.add.label.name': 'Mahsulot nomi (agar rasm biriktirilgan bo\'lsa, ixtiyoriy)',
    'store.product.add.label.desc': 'Tavsif (ixtiyoriy)',
    'store.product.add.label.price': 'Narxi (so\'m)',
    'store.product.add.label.stock': 'Mavjud / Miqdori',
    'store.product.add.btn.adding': 'Qo\'shilmoqda va toifalarga ajratilmoqda...',
    'store.product.add.btn.add': 'Avtomatik kategoriyalangan mahsulotni qo\'shish',

    // My Orders
    'orders.my.title': 'Mening buyurtmalarim',
    'orders.my.empty': 'Siz hali hech qanday buyurtma bermadingiz.',
    'orders.my.order_num': 'Buyurtma #',
    'orders.my.download_invoice': 'Chekni yuklab olish',
    'orders.my.cancel_order': 'Buyurtmani bekor qilish',

    // Customer Orders
    'orders.customer.title': 'Mijozlar buyurtmalari',
    'orders.customer.empty': 'Hozircha kirish buyurtmalari yo\'q.',
    'orders.customer.accept': 'Buyurtmani qabul qilish',
    'orders.customer.mark_completed': 'Bajarilgan deb belgilash',
    'orders.customer.cancel': 'Bekor qilish',
    
    // Store Settings
    'store.settings.title': 'Do\'kon sozlamalari',
    'store.settings.label.hours': 'Ish vaqti',
    'store.settings.btn.save': 'O\'zgarishlarni saqlash',

    // Profile Settings
    'profile.settings.title': 'Profil sozlamalari',
    'profile.settings.label.name': 'Ism',
    'profile.settings.label.email': 'Email',
    'profile.settings.email_desc': 'Elektron pochta sizning autentifikatsiya provayderingiz tomonidan boshqariladi.',
    'profile.settings.btn.save': 'O\'zgarishlarni saqlash',

    // Cart
    'cart.title': 'Savatcha',
    'cart.empty.title': 'Savatchangiz bo\'sh',
    'cart.empty.desc': 'Siz hali hech qanday qurilish materiallarini qo\'shmagan ko\'rinasiz.',
    'cart.empty.btn': 'Mahsulotlarga o\'tish',
    'cart.summary.title': 'Buyurtma xulosasi',
    'cart.summary.subtotal': 'Oraliq jami',
    'cart.summary.items': 'ta mahsulot',
    'cart.summary.tax': 'Taxminiy soliq',
    'cart.summary.shipping': 'Yetkazib berish',
    'cart.summary.shipping_calc': 'Rasmiylashtirishda hisoblanadi',
    'cart.summary.total': 'Jami',
    'cart.btn.checkout': 'Buyurtmani rasmiylashtirish',
    'cart.btn.processing': 'Qayta ishlanmoqda...',
    'cart.success.title': 'Buyurtma muvaffaqiyatli rasmiylashtirildi!',
    'cart.success.desc': 'Sizning sinov buyurtmangiz muvaffaqiyatli joylashtirildi. Tez orada yetkazib berishni taqlid qilamiz.',
    'cart.success.btn': 'Xaridni davom ettirish',
    
    // Home
    'home.hero.title1': 'Qulay',
    'home.hero.title2': 'Materiallar',
    'home.hero.desc': 'Narxlarni taqqoslang, eng yaqin do\'konlarni toping va foydali xarid qiling. Ishonchli sotuvchilardan 50,000 dan ortiq mahsulotlar.',
    'home.search.placeholder': 'Nima qidiryapsiz? Masalan: Sement M500',
    'home.search.location': 'Shahar, manzil...',
    'home.search.btn': 'Topish',
    'home.categories.title': 'Ommabop kategoriyalar',
    'home.categories.all': 'Barcha kategoriyalar',
    'home.categories.cement': 'Sement va aralashmalar',
    'home.categories.bricks': 'G\'isht va bloklar',
    'home.categories.metal': 'Metall prokat',
    'home.categories.wood': 'Yog\'och materiallar',
    'home.categories.bulk': 'Sochiluvchan',
    'home.categories.roofing': 'Tom yopish',
    'home.categories.electric': 'Elektr',
    'home.categories.plumbing': 'Santexnika',
    'home.features.logistics': 'Qulay logistika',
    'home.features.delivery': 'Tezkor yetkazib berish',
    'home.features.reviews': 'Halol sharhlar',
    'home.features.rating': 'Ishonchli reyting',
    'home.features.suppliers': 'Tasdiqlangan yetkazib beruvchilar',
    'home.features.partners': 'Ishonchli hamkorlar',
    'home.trending.title1': 'Xaridorgir',
    'home.trending.title2': 'Materiallar',
    'home.trending.all': 'Barchasini ko\'rish',
    'home.trending.cement': 'Portland Sement M500',
    'home.trending.distance': '1.2km uzoqlikda',

    // Workers
    'workers.categories.loaders': 'Yuk tashuvchilar',
    'workers.categories.builders': 'Quruvchilar',
    'workers.categories.painters': 'Bo\'yoqchilar',
    'workers.categories.concrete': 'Betonchilar',
    'workers.categories.electricians': 'Elektriklar',
    'workers.categories.plumbers': 'Santexniklar',
    'workers.categories.cleaning': 'Tozalash',
    
    'workers.payment.cash': 'Naqd pul orqali (Naqd)',
    'workers.payment.transfer': 'Pul o\'tkazish (Perekisleniya)',
    'workers.payment.installments': 'Bo\'lib to\'lash (Nasiya)',

    'workers.error': 'So\'rovni qayta ishlashda xatolik: ',
    'workers.title': 'Xizmatlar va Ustalar',
    'workers.desc': 'Mutaxassislar va materiallarni toping yoki usta bo\'ling',
    'workers.tab.search': 'USTALARNI QIDIRISH',
    'workers.tab.register': 'USTANI RO\'YXATDAN O\'TKAZISH',

    'workers.search.title': 'Ustalar va materiallarni aqlli qidirish',
    'workers.search.desc': 'Vazifa va kerakli materiallarni o\'z so\'zlaringiz bilan ta\'riflang, Sun\'iy Intellekt o\'zi odamlarni, tovarlarni tanlaydi va shartnoma tayyorlaydi.',
    'workers.search.placeholder': 'Masalan: Men uchun ertaga Toshkentda 3 ta yuk tashuvchi va 20 qop sement, 3 banka bo\'yoq kerak...',
    'workers.search.btn': 'Topish',
    'workers.search.btn_loading': 'Qayta ishlanmoqda (SI)...',

    'workers.result.title': 'So\'rovnoma yaratildi',
    'workers.result.category': 'Ustalar toifasi',
    'workers.result.location': 'Manzil va Vaqt',
    'workers.result.not_specified': 'Ko\'rsatilmagan',
    'workers.result.materials_title': 'Kerakli qurilish materiallari',
    'workers.result.payment_title': 'Shartnoma bo\'yicha to\'lov shakli',
    'workers.result.estimate': 'Xizmatlarning taxminiy narxi (smena uchun):',
    'workers.result.estimate_desc1': 'SI bozor bo\'yicha o\'rtacha stavkani tahlil qildi:',
    'workers.result.estimate_desc2': 'so\'m/soatiga har bir ishchi uchun. Qurilish materiallari narxi do\'kon tasdiqlagach alohida hisoblanadi.',
    'workers.result.btn_contract': 'Xizmatlar uchun shartnoma tuzish',

    'workers.contract.title': 'Shartnoma muvaffaqiyatli yaratildi!',
    'workers.contract.desc1': 'Ustalar va qurilish materiallari bo\'yicha so\'rov ishlov berishga yuborildi. To\'lov shakli:',
    'workers.contract.desc2': 'Mutaxassislar siz bilan 10 daqiqa ichida bog\'lanishadi.',
    'workers.contract.btn_new': 'Yangi so\'rov',
    'workers.contract.btn_download': 'Shartnomani yuklab olish (PDF)',

    'workers.catalog.title': 'Xizmatlar katalogi',
    'workers.catalog.from': 'dan',
    'workers.catalog.per_hour': 'so\'m/s',

    'workers.register.success.title': 'Muvaffaqiyatli ro\'yxatdan o\'tildi!',
    'workers.register.success.desc': 'Siz platformada usta sifatida muvaffaqiyatli ro\'yxatdan o\'tdingiz. Endi mijozlar sizni topishlari mumkin.',
    'workers.register.title': 'Platforma ustasiga aylaning',
    'workers.register.desc': 'Qurilish kompaniyalari va jismoniy shaxslardan buyurtmalar olish uchun shaklni to\'ldiring.',
    'workers.register.label.name': 'Sizning ismingiz / F.I.O',
    'workers.register.placeholder.name': 'Masalan: Rustam Ahmedov',
    'workers.register.label.phone': 'Telefon',
    'workers.register.label.category': 'Ixtisoslik (Toifa)',
    'workers.register.terms.title': 'Ommaviy Oferta Shartnomasi',
    'workers.register.terms.desc': 'Ro\'yxatdan o\'tish orqali siz platforma orqali buyurtmalarni qayta ishlashga rozilik bildirasiz va to\'lovni pul o\'tkazish, naqd pul yoki bo\'lib to\'lash (bankdan) orqali qabul qilishingiz mumkin.',
    'workers.register.btn': 'Ro\'yxatdan o\'tish',
    'workers.register.btn_loading': 'Ro\'yxatdan o\'tilmoqda...',

    'btn.details': 'Batafsil',
    'app.loading': 'Yuklanmoqda...',
    'error.default': 'Xatolik yuz berdi: ',
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
