# 🏠 Toshkent City — 360° Virtual Uy Sayohati (Virtual Tour)

Ushbu loyiha ko‘chmas mulk (kvartira yoki hovli uy) xaridorlari uchun uyni masofadan turib brauzerda 360 daraja aylanib ko‘rish imkonini beruvchi to‘liq interaktiv veb-ilovadir.

---

## 🌟 Loyiha Imkoniyatlari va Xususiyatlari

1. **4 ta asosiy xona (360° ko‘rinishda):**
   - 🛋️ **Mehmonxona (Living Room) — 38 m²**: Smart TV, Italiya yumshoq mebellari, keng panoramali shahar manzarasi.
   - 🍳 **Oshxona (Kitchen & Dining) — 24 m²**: Kvarsit orolcha stoli, Bosch maishiy texnikasi, No-Frost sovutgich.
   - 🛏️ **Yotoqxona (Master Bedroom) — 32 m²**: King-size ortopedik to‘shak, keng shkaf va sokin ish stoli burchagi.
   - 🛁 **Vanna xonasi (Bathroom) — 16 m²**: Grohe dush va vanna, aqlli sensorli LED oyna, pol isitish tizimi.

2. **Interaktiv 3D Portal Hotspotlar (Xonalararo harakatlanish):**
   - Har bir xona ichida boshqa xonaga eltuvchi pulsatsiyalanuvchi yo‘nalish ko‘rsatkichlari (masalan, *👉 Oshxonaga o‘tish*, *👉 Mehmonxonaga qaytish*).
   - Foydalanuvchi belgini bosganda xonalar o‘rtasida silliq fade animatsiyasi bilan o‘tiladi.

3. **Mebel va Jihozlar Tafsiloti (Info Hotspotlar):**
   - Mebel, texnika va qulayliklar ustidagi `i` belgisini bosganda ular haqidagi batafsil parametrlar va ma’lumotlar chiqadi.

4. **Interaktiv 2D Qavat Rejasi (Minimap / Floor Plan):**
   - Ekranning o‘ng burchagida uyning arxitekturaviy 2D chizmasi (SVG).
   - Qaysi xonada turganingiz real vaqt rejimida nurlanib turadi.
   - Rejadagi istalgan xona nuqtasini bosish orqali darhol o‘sha yerga teleportatsiya qilish mumkin!

5. **Pastki Tezkor Galereya Menyusi (Carousel Switcher):**
   - Har bir xonaning skrinshoti va maydoni ko‘rsatilgan pastki kartalar orqali bir bosishda xonani almashtirish.

6. **Uy Haqida To‘liq Ma’lumot Modali:**
   - Narxi ($125,000), umumiy maydoni (110 m²), qavati (7/12), ta’mirlash holati, qo‘shimcha imtiyozlar.
   - Rieltor/agent bilan to‘g‘ridan-to‘g‘ri telefon qo‘ng‘irog‘i va Telegram orqali bog‘lanish tugmalari.

7. **HTML5 Web Audio Tovush Effektlari:**
   - Xonadan xonaga o‘tganda va tugmalar bosilganda yoqimli futuristik tovushlar (Web Audio API orqali sintez qilinadi, qo‘shimcha mp3 yuklanishi shart emas).
   - Tovushni o‘chirish / yoqish tugmasi mavjud.

8. **Avtomatik Aylanish (Auto-Rotation) va To‘liq Ekran (Fullscreen):**
   - Taqdimot vaqtida uyni avtomatik sekin aylantirib ko‘rsatish rejimi.

9. **100% Moslashuvchan (Responsive) va Mobil Qurilmalarga Tayyor:**
   - Kompyuter, noutbuk, planshet va smartfonlarda (sensorli imo-ishoralar: surish, chimchilash orqali yaqinlashtirish) a’lo darajada ishlaydi.

---

## 📁 Fayllar Tuzilishi

```text
2-dars/
├── index.html              # Bosh sahifa (HTML5 markap, barcha modallar va boshqaruv paneli)
├── style.css               # Zamonaviy Glassmorphism dizayni, animatsiyalar va responsivlik
├── app.js                  # 360° panorama mantig'i, xonalar konfiguratsiyasi, minimap va ovoz
├── server.py               # Mahalliy Python HTTP serveri
├── start_tour.bat          # Windows uchun 1 ta bosish bilan ishga tushirish skripti
├── assets/
│   ├── lib/
│   │   ├── pannellum.js    # 360° WebGL rendering dvigateli (oflayn nusxa)
│   │   └── pannellum.css   # Pannellum stillari (oflayn nusxa)
│   └── images/
│       ├── living-room.jpg # Mehmonxona 360° panoramasi (2560x1280)
│       ├── kitchen.jpg     # Oshxona 360° panoramasi (2560x1280)
│       ├── bedroom.jpg     # Yotoqxona 360° panoramasi (2560x1280)
│       ├── bathroom.jpg    # Vanna xonasi 360° panoramasi (2560x1280)
│       ├── floorplan.svg   # Interaktiv 2D qavat rejasi
│       └── thumbnails/     # Tezkor yuklanuvchi kichik suratlar
├── screenshots/            # Topshirish uchun tayyor 3 ta skrinshot
│   ├── 1_mehmonxona.jpg
│   ├── 2_oshxona.jpg
│   └── 3_yotoqxona.jpg
├── README.md               # Loyiha qo'llanmasi
└── TUSHUNTIRISH_SESHANBA.md# Seshanba kungi imtihon taqdimoti uchun to'liq nutq va reja
```

---

## 🚀 Qanday Ishga Tushiriladi?

### 1-usul: 1 marta bosish orqali (Eng osoni)
- `start_tour.bat` fayliga sichqoncha bilan ikki marta bosing.
- Avtomatik ravishda server ishga tushadi va brauzeringizda `http://localhost:8080` ochiladi.

### 2-usul: Terminal / Buyruqlar satri orqali
```bash
python server.py
```
yoki:
```bash
python -m http.server 8080
```
Brauzerda quyidagi manzilga kiring:
👉 `http://localhost:8080`

---

## ⌨️ Klaviatura Qisqa Tugmalari (Hotkeys) va Boshqaruv

- **W, A, S, D** yoki **Yo‘nalish strelkalari (↑, ←, ↓, →)**:
  - **W / ↑**: Uy ichida oldinga odamdek qadam tashlab yurish (head bobbing tebranishi va qadam tovushlari bilan).
  - **A / ←**: Chap tomonga silliq burilish.
  - **S / ↓**: Orqaga qadam tashlash.
  - **D / →**: O‘ng tomonga silliq burilish.
- **Shift (bosib turish)**: Tez yugurish rejimi (tezlashgan qadam tovushlari va tebranish).
- **C** yoki **Mishka (FPS Rejimi)**: Pointer Lock orqali sichqoncha bilan haqiqiy video o‘yinlardek (CS, GTA, Minecraft) qarash va yurish.
- **Eshikdan xonaga o‘tish**: Eshik tomonga qarab `W` ni bosib tursangiz, eshik tomon yaqinlashib to‘g‘ridan-to‘g‘ri yangi xonaga yurib o‘tadi!
- **1, 2, 3, 4**: Xonalar o‘rtasida tezkor teleportatsiya (1 - Mehmonxona, 2 - Oshxona, 3 - Yotoqxona, 4 - Vanna)
- **Bo‘sh joy (Space)**: Avtomatik sekin aylanishni yoqish / to‘xtatish
- **F**: To‘liq ekran (Fullscreen)
- **M**: Qavat rejasini (Minimap) ochish / yopish
- **I**: Uy haqida to‘liq ma’lumot oynasini ochish
- **+ / -**: Panoramani kattalashtirish va kichiklashtirish
- **Esc**: Har qanday modal, FPS rejimi yoki xabarni yopish
