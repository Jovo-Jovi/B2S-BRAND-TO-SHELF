import ar from "../../app/[locale]/dictionaries/ar.json";
import en from "../../app/[locale]/dictionaries/en.json";

import type { CalendarLocale } from "../../lib/locale/calendar-date";
import type { ByteUnitWords } from "../../lib/locale/format-number";

const catalogs = { en, ar } as const;

export function dataCatalog(locale: CalendarLocale) {
  return catalogs[locale].data;
}

export function byteUnits(locale: CalendarLocale): ByteUnitWords {
  const data = dataCatalog(locale);
  return {
    B: data.byteB,
    kB: data.byteKB,
    MB: data.byteMB,
    GB: data.byteGB,
  };
}

export function dateNames(locale: CalendarLocale) {
  const data = dataCatalog(locale);
  return {
    months: [
      data.month1,
      data.month2,
      data.month3,
      data.month4,
      data.month5,
      data.month6,
      data.month7,
      data.month8,
      data.month9,
      data.month10,
      data.month11,
      data.month12,
    ],
    weekdaysShort: [
      data.weekdayShort1,
      data.weekdayShort2,
      data.weekdayShort3,
      data.weekdayShort4,
      data.weekdayShort5,
      data.weekdayShort6,
      data.weekdayShort7,
    ],
    weekdaysFull: [
      data.weekdayFull1,
      data.weekdayFull2,
      data.weekdayFull3,
      data.weekdayFull4,
      data.weekdayFull5,
      data.weekdayFull6,
      data.weekdayFull7,
    ],
    monthHeading: data.monthHeading,
    dayAccessibleName: data.dayAccessibleName,
    placeholder: data.datePlaceholder,
    percent: data.percent,
  };
}
