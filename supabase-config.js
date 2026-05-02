// ====================================================
// supabase-config.js
// ====================================================
// Глобальна конфігурація Supabase для всього сайту.
// Підключається ПЕРШИМ, до memories.js і до contact.html.
//
// ВАЖЛИВО: anon-ключ можна тримати в публічному коді.
// Він обмежений RLS-політиками з supabase-migration.sql:
//  - читати можна тільки approved=true записи
//  - вставляти можна тільки approved=false записи
//  - оновлювати/видаляти не можна взагалі
// ====================================================

const SUPABASE_URL      = "https://snpuloaaziqptqsqfhdl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNucHVsb2FhemlxcHRxc3FmaGRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MTM3ODksImV4cCI6MjA5MzI4OTc4OX0.zCk_2SPuHErhKiKDrGRVeWpm5FUBMvfPffCF9Bbqopk";

// Ініціалізуємо клієнт. Бібліотека supabase-js завантажується через CDN
// у тегу <script> перед цим файлом.
window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
