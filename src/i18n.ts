import { Context, getEffectiveContext } from './context';

export type Token<T> = T | string | number | FuncParam<T>;

type FuncParam<T> = (arg: string) => Token<T>;

export interface Params<T> {
  [key: string]: Token<T>;
}

const PARAMS_REGEX = /\{([^}]+)}/g;
const FUNC_PARAM_REGEX = /(\w+)\(([\w\s]+)\)/;

export const i18n = <T = unknown>(key: string, params: Params<T>, context?: Context): Token<T>[] => {
  const effectiveContext = getEffectiveContext(context);
  const { acceptLangs, permitLangs, allowFallback = false, l10ns } = effectiveContext;

  for (let i = 0; i < acceptLangs.length; i++) {
    const lang = acceptLangs[i];
    if (!permitLangs || permitLangs.has(lang)) {
      const l10n = l10ns[lang];
      if (l10n) {
        const val = l10n[key];
        if (val) {
          return parameterize(key, val, params);
        } else if (!allowFallback) {
          return missing(key, effectiveContext);
        }
      }
    }
  }

  return missing(key, effectiveContext);
};

const parameterize = <T>(key: string, text: string, params: Params<T>): Token<T>[] => {
  const tokens: Token<T>[] = [];

  let m = PARAMS_REGEX.exec(text);
  let i = 0;
  while (m) {
    tokens.push(text.substring(i, m.index));
    i = m.index;
    const param = m[1];
    const funcM = param.match(FUNC_PARAM_REGEX);
    if (funcM) {
      const paramName = funcM[1];
      const paramFn = params[paramName] as FuncParam<T>;
      const paramFnArg = funcM[2];

      if (typeof paramFn === 'function') {
        tokens.push(paramFn(paramFnArg));
      } else {
        throw new Error(`I18N - Expecting a function for param '${paramName}' in key '${key}'`);
      }
    } else {
      tokens.push(params[param]);
    }

    i += m[0].length;
    m = PARAMS_REGEX.exec(text);
  }

  tokens.push(text.substring(i));

  return tokens.filter(token => token !== null && token !== undefined);
};

const missing = <T = unknown>(key: string, { acceptLangs }: Context): Token<T>[] => [
  `[I18N-MISSING(${acceptLangs.join(',')}):${key}]`,
];
