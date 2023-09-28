import de from '../../admin/i18n/de/translations.json';
import en from '../../admin/i18n/en/translations.json';
import es from '../../admin/i18n/es/translations.json';
import fr from '../../admin/i18n/fr/translations.json';
import it from '../../admin/i18n/it/translations.json';
import pl from '../../admin/i18n/pl/translations.json';
import nl from '../../admin/i18n/nl/translations.json';
import pt from '../../admin/i18n/pt/translations.json';
import ru from '../../admin/i18n/ru/translations.json';
import uk from '../../admin/i18n/uk/translations.json';
import zh from '../../admin/i18n/zh-cn/translations.json';
type allTranslationsType = {
    de: { [key: string]: string };
    en: { [key: string]: string };
    es: { [key: string]: string };
    fr: { [key: string]: string };
    it: { [key: string]: string };
    pl: { [key: string]: string };
    nl: { [key: string]: string };
    pt: { [key: string]: string };
    ru: { [key: string]: string };
    uk: { [key: string]: string };
    'zh-cn': { [key: string]: string };
};
type translationsType = {
    de?: string;
    en?: string;
    es?: string;
    fr?: string;
    it?: string;
    pl?: string;
    nl?: string;
    pt?: string;
    ru?: string;
    uk?: string;
    'zh-cn'?: string;
};
const allTranslations: allTranslationsType = {
    de: de,
    en: en,
    es: es,
    fr: fr,
    it: it,
    pl: pl,
    nl: nl,
    pt: pt,
    ru: ru,
    uk: uk,
    'zh-cn': zh,
};

export function geti18nTranslation(key: string): string | { [key: string]: string } {
    const result: translationsType = {};
    if (allTranslations) {
        for (const l in allTranslations) {
            const ll = l as keyof translationsType;
            if (allTranslations[ll][key] !== undefined) {
                result[ll] = allTranslations[ll][key];
            }
        }
        if (result.en !== undefined && result.en !== '') return result;
    }
    return '';
}

export function seti18nTranslation(key: string, val: string | { [key: string]: string }): void {
    if (!key || !val) return;
    if (allTranslations.en[key] !== undefined && allTranslations.en[key] !== '') return;
    if (typeof val == 'object') {
        for (const l in allTranslations) {
            allTranslations[l as keyof translationsType][key] = val[l];
        }
    } else {
        allTranslations.en[key] = val;
    }
}

//** just for breakpoint */
export function showi18nTranslation(): void {
    const en = JSON.stringify(allTranslations.en);
    const de = JSON.stringify(allTranslations.de);
    if (en != de) {
        // just for breakpoint and copy of json
    }
}
