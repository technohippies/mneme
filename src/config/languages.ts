export const supportedLocales = [
  'eng', 'cmn', 'jpn', 'deu', 'hin', 'fra', 'kor', 'por', 'ita', 'spa',
  'ind', 'nld', 'tur', 'pol', 'bul', 'ron', 'ces', 'ell', 'fin', 'dan',
  'ukr', 'rus', 'hun', 'vie',
  'bod', 'mon', 'uig', 'tam', 'sin', 'tha', 'ben', 'urd', 'mar', 'swa',
  'nep', 'fas', 'cat', 'fil', 'kaz', 'hrv', 'est', 'heb', 'kat', 'uzb',
  'lao', 'khm', 'kur', 'jav', 'lav', 'srp', 'slk', 'tgk', 'swe', 'nor',
  'que', 'slv', 'run', 'ibo'
] as const;

export type SupportedLocale = typeof supportedLocales[number];

export const languageNames: Record<SupportedLocale, { english: string, native: string }> = {
  eng: { english: "English", native: "English" },
  cmn: { english: "Chinese", native: "中文" },
  jpn: { english: "Japanese", native: "日本語" },
  deu: { english: "German", native: "Deutsch" },
  hin: { english: "Hindi", native: "हिन्दी" },
  fra: { english: "French", native: "Français" },
  kor: { english: "Korean", native: "한국어" },
  por: { english: "Portuguese", native: "Português" },
  ita: { english: "Italian", native: "Italiano" },
  spa: { english: "Spanish", native: "Español" },
  ind: { english: "Indonesian", native: "Bahasa Indonesia" },
  nld: { english: "Dutch", native: "Nederlands" },
  tur: { english: "Turkish", native: "Türkçe" },
  pol: { english: "Polish", native: "Polski" },
  bul: { english: "Bulgarian", native: "Български" },
  ron: { english: "Romanian", native: "Română" },
  ces: { english: "Czech", native: "Čeština" },
  ell: { english: "Greek", native: "Ελληνικά" },
  fin: { english: "Finnish", native: "Suomi" },
  dan: { english: "Danish", native: "Dansk" },
  ukr: { english: "Ukrainian", native: "Українська" },
  rus: { english: "Russian", native: "Русский" },
  hun: { english: "Hungarian", native: "Magyar" },
  vie: { english: "Vietnamese", native: "Tiếng Việt" },
  bod: { english: "Tibetan", native: "བོད་སྐད་" },
  mon: { english: "Mongolian", native: "Монгол хэл" },
  uig: { english: "Uyghur", native: "ئۇيغۇرچە" },
  tam: { english: "Tamil", native: "தமிழ்" },
  sin: { english: "Sinhala", native: "සිංහල" },
  tha: { english: "Thai", native: "ไทย" },
  ben: { english: "Bengali", native: "বাংলা" },
  urd: { english: "Urdu", native: "اردو" },
  mar: { english: "Marathi", native: "मराठी" },
  swa: { english: "Swahili", native: "Kiswahili" },
  nep: { english: "Nepali", native: "नेपाली" },
  fas: { english: "Persian", native: "فارسی" },
  cat: { english: "Catalan", native: "Català" },
  fil: { english: "Filipino", native: "Filipino" },
  kaz: { english: "Kazakh", native: "Қазақ тілі" },
  hrv: { english: "Croatian", native: "Hrvatski" },
  est: { english: "Estonian", native: "Eesti" },
  heb: { english: "Hebrew", native: "עברית" },
  kat: { english: "Georgian", native: "ქართული" },
  uzb: { english: "Uzbek", native: "O'zbek" },
  lao: { english: "Lao", native: "ລາວ" },
  khm: { english: "Khmer", native: "ខ្មែរ" },
  kur: { english: "Kurdish", native: "Kurdî" },
  jav: { english: "Javanese", native: "Basa Jawa" },
  lav: { english: "Latvian", native: "Latviešu" },
  srp: { english: "Serbian", native: "Српски" },
  slk: { english: "Slovak", native: "Slovenčina" },
  tgk: { english: "Tajik", native: "Тоҷикӣ" },
  swe: { english: "Swedish", native: "Svenska" },
  nor: { english: "Norwegian", native: "Norsk" },
  que: { english: "Quechua", native: "Runasimi" },
  slv: { english: "Slovenian", native: "Slovenščina" },
  run: { english: "Kirundi", native: "Ikirundi" },
  ibo: { english: "Igbo", native: "Assụ Igbo" }
};

export const getLanguageName = (code: SupportedLocale, inEnglish = false): string => {
  const language = languageNames[code];
  return language ? (inEnglish ? language.english : language.native) : 'Unknown';
};

export const mapDetectedLanguage = (detectedLang: string): SupportedLocale => {
  console.log('Detected language:', detectedLang);
  const langCode = detectedLang.split('-')[0].toLowerCase();
  console.log('Language code:', langCode);
  const mapping: { [key: string]: SupportedLocale } = {
    'zh': 'cmn',
    'ja': 'jpn',
    'de': 'deu',
    'hi': 'hin',
    'fr': 'fra',
    'ko': 'kor',
    'pt': 'por',
    'it': 'ita',
    'es': 'spa',
    'en': 'eng',
    'id': 'ind',
    'nl': 'nld',
    'tr': 'tur',
    'pl': 'pol',
    'bg': 'bul',
    'ro': 'ron',
    'cs': 'ces',
    'el': 'ell',
    'fi': 'fin',
    'da': 'dan',
    'uk': 'ukr',
    'ru': 'rus',
    'hu': 'hun',
    'vi': 'vie',
    'bo': 'bod',
    'mn': 'mon',
    'ug': 'uig',
    'ta': 'tam',
    'si': 'sin',
    'th': 'tha',
    'bn': 'ben',
    'ur': 'urd',
    'mr': 'mar',
    'sw': 'swa',
    'ne': 'nep',
    'fa': 'fas',
    'ca': 'cat',
    'fil': 'fil',
    'kk': 'kaz',
    'hr': 'hrv',
    'et': 'est',
    'he': 'heb',
    'ka': 'kat',
    'uz': 'uzb',
    'lo': 'lao',
    'km': 'khm',
    'ku': 'kur',
    'jv': 'jav',
    'lv': 'lav',
    'sr': 'srp',
    'sk': 'slk',
    'tg': 'tgk',
    'sv': 'swe',
    'no': 'nor',
    'qu': 'que',
    'sl': 'slv',
    'rn': 'run',
    'ig': 'ibo'
  };

  const result = mapping[langCode] || (supportedLocales.includes(langCode as SupportedLocale) ? langCode as SupportedLocale : 'eng');
  console.log('Mapped to:', result);
  return result;
};

export const languageMapping: Record<string, SupportedLocale> = {
  ...Object.fromEntries(supportedLocales.map(locale => [locale, locale])),
  ...Object.fromEntries(Object.entries(mapDetectedLanguage).map(([key, value]) => [key, value]))
};