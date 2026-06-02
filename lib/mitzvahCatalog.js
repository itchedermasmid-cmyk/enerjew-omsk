const normalize = (value = '') => value
  .toLowerCase()
  .replace(/ё/g, 'е')
  .replace(/[^a-zа-я0-9]+/gi, ' ')
  .trim();

export const MITZVAH_CATALOG = [
  {
    slug: 'tefillin',
    icon: '🤲',
    aliases: ['тфилин', 'tefillin'],
  },
  {
    slug: 'shabbos-candles',
    icon: '🕯️',
    aliases: ['шаббатние свечи', 'шабатние свечи', 'свечи', 'shabbos candles'],
  },
  {
    slug: 'modeh-ani',
    icon: '🌅',
    aliases: ['модэ ани утром', 'моде ани утром', 'модэ ани', 'моде ани', 'modeh ani'],
  },
  {
    slug: 'morning-washing',
    icon: '💧',
    aliases: ['омовение рук утром', 'мытье рук утром', 'нетилат ядаим', 'washing hands'],
  },
  {
    slug: 'morning-shema',
    icon: '☀️',
    aliases: ['утренний шма', 'шма утром', 'morning shema'],
  },
  {
    slug: 'night-shema',
    icon: '🌙',
    aliases: ['ночной шма', 'шма на ночь', 'night shema'],
  },
  {
    slug: 'davening',
    icon: '🙏',
    aliases: ['давенинг молитва', 'давенинг', 'молитва', 'davening'],
  },
  {
    slug: 'torah-learning',
    icon: '📜',
    aliases: ['изучение торы', 'тора', 'torah learning'],
  },
  {
    slug: 'bracha-food',
    icon: '🍞',
    aliases: ['браха перед едой', 'благословение перед едой', 'bracha before food'],
  },
];

export function getMitzvahMeta(mitzvahOrName) {
  const name = typeof mitzvahOrName === 'string'
    ? mitzvahOrName
    : mitzvahOrName?.name_ru || mitzvahOrName?.slug || '';
  const normalizedName = normalize(name);

  return MITZVAH_CATALOG.find(item =>
    item.slug === mitzvahOrName?.slug ||
    item.aliases.some(alias => normalize(alias) === normalizedName)
  ) || {
    slug: mitzvahOrName?.slug || normalizedName.replace(/\s+/g, '-') || 'mitzvah',
    icon: mitzvahOrName?.icon || '✡️',
    aliases: [name],
  };
}

export function getMitzvahIcon(mitzvahOrName) {
  return mitzvahOrName?.icon || getMitzvahMeta(mitzvahOrName).icon;
}

