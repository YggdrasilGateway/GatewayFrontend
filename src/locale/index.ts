import i18next from 'i18next';

import './initor';

import { languages } from '@/locale/initor';

const i18n: { [lang: string]: { [key: string]: string } } = {};

function loadLanguage(l: string) {
  import('./' + l).then((result) => {
    i18next.addResourceBundle(l, 'translation', result);
    const delegateFunction = i18next.getFixedT(l);

    const customFunction = function (...args: any[]) {
      return delegateFunction.call(this, args);
    };
    for (const key of Object.keys(result)) {
      customFunction[key] = result[key];
    }

    i18n[l] = customFunction as any;
  });
}

languages.forEach(loadLanguage);

export default i18n;
