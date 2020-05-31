import { createNamespace } from 'cls-hooked';

import { Context } from './context';
import { i18n, Params } from './i18n';

const contextNS = createNamespace('I18nContext');

export const setI18nContext = (context: Context) =>
  contextNS.runPromise<void>(() => {
    return new Promise<void>(resolve => {
      contextNS.set('currentContext', context);
      resolve();
    });
  });

export const getI18nContext = () => contextNS.get('currentContext');

export const i18ns = (key: string, params?: Params<string | number>): string => {
  const context: Context = contextNS.get('currentContext');
  if (!context) {
    throw new Error('No context set.');
  }
  return i18n(key, params || {}, context).join('');
};
