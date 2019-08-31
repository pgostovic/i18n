import React, { FC, Fragment, ReactNode } from 'react';

let isTestMode = false;

export const setTestMode = (testMode: boolean) => {
  isTestMode = testMode;
};

export interface L10n {
  [key: string]: string;
}

type FuncParam = (arg: string | number) => JSX.Element;

export interface Params {
  [key: string]: string | number | FuncParam | ReactNode;
}

const l10ns = new Map<string, L10n>();

export const addL10n = (code: string, l10n: L10n) => {
  const existingL10n = l10ns.get(code);
  if (existingL10n) {
    Object.assign(existingL10n, l10n);
  } else {
    l10ns.set(code, l10n);
  }
};

let defaultCodes: readonly string[] = ['en'];

export const setDefaultLanguages = (codes: readonly string[]) => {
  defaultCodes = codes;
};

export function i18n(key: string, params?: Params): string | Array<string | JSX.Element>;
export function i18n(code: string | string[], key: string, params?: Params): string | Array<string | JSX.Element>;
export function i18n(...args: any[]): string | Array<string | JSX.Element> {
  let codes: readonly string[];
  let key: string;
  let params: Params;

  if (typeof args[0] === 'string' && typeof args[1] === 'string') {
    let code: string;
    [code, key, params] = args;
    codes = [code];
  } else if (args[0] instanceof Array && typeof args[1] === 'string') {
    [codes, key, params] = args;
  } else {
    [key, params] = args;
    codes = defaultCodes;
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const code of codes) {
    const l10n = l10ns.get(code);
    if (l10n) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return subParams(key, l10n[key], params);
      } catch (err) {
        const prefix = isTestMode ? 'TEST' : `I18N-MISSING(${code})`;
        const comps: Array<string | JSX.Element> = [`[${prefix}:${key}]`];
        if (params) {
          Object.keys(params).forEach(k => {
            const p = params[k];
            if (typeof p === 'function') {
              comps.push(<Fragment key={k}>{p(`[${prefix}:${key}--${k}]`)}</Fragment>);
            }
          });
        }
        return comps;
      }
    }
  }

  return `[I18N-MISSING(${codes.join(',')}):${key}]`;
}

const PARAMS_REGEX = /\{([^}]+)}/g;
const FUNC_PARAM_REGEX = /(\w+)\(([\w\s]+)\)/;

const subParams = (key: string, text?: string, params?: Params): string | Array<string | JSX.Element> => {
  if (!text || isTestMode) {
    throw new Error('missing asset or test env');
  }

  let m = PARAMS_REGEX.exec(text);

  if (m && params) {
    let hasElements = false;
    const comps: Array<string | JSX.Element> = [];
    let i = 0;
    while (m) {
      comps.push(text.substring(i, m.index));
      i = m.index;

      const param = m[1];

      const funcM = param.match(FUNC_PARAM_REGEX);
      if (funcM) {
        const paramName = funcM[1];
        const paramFn = params[paramName];
        const paramFnArg = funcM[2];

        if (typeof paramFn === 'function') {
          comps.push(<Fragment key={paramName}>{paramFn(paramFnArg)}</Fragment>);
          hasElements = true;
        } else {
          throw new Error(`I18N - Expecting a function for param '${paramName}' in key '${key}'`);
        }
      } else {
        const val = params[param];
        if (typeof val === 'object' && (val as any).type) {
          comps.push(<Fragment key={param}>{val as JSX.Element}</Fragment>);
          hasElements = true;
        } else {
          comps.push(String(val));
        }
      }

      i += m[0].length;

      m = PARAMS_REGEX.exec(text);
    }
    comps.push(text.substring(i));
    return hasElements ? comps : comps.join('');
  }

  return text;
};

interface Props {
  name: string;
  children?: ReactNode;
  params?: Params;
}

export const I18n: FC<Props> = ({ name, children, params }) => <>{i18n(name, { children, ...params })}</>;
