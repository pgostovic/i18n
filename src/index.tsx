import { createLogger } from '@phnq/log';
import React, { FC, Fragment, ReactNode } from 'react';

const log = createLogger('@phnq/log');

let isTestMode = false;
let isAlwaysFallback = false;

export const setTestMode = (testMode: boolean) => {
  isTestMode = testMode;
};

export const setAlwaysFallback = (alwaysFallback: boolean) => {
  isAlwaysFallback = alwaysFallback;
};

export interface L10n {
  [key: string]: string;
}

type FuncParam = (arg: string | number) => JSX.Element;

export interface Params {
  [key: string]: string | number | FuncParam | ReactNode;
}

let defaultCode: string | undefined = undefined;
const l10ns = new Map<string, L10n>();

export const addL10n = (code: string, l10n: L10n, isDefault = false) => {
  if (isDefault) {
    log.warn(`There was already a default L10n code set; ${code} is now the default.`);
    defaultCode = code;
  }

  const existingL10n = l10ns.get(code);
  if (existingL10n) {
    Object.assign(existingL10n, l10n);
  } else {
    l10ns.set(code, l10n);
  }
};

let defaultCodes: readonly string[] = ['en'];

export const setDefaultLanguages = (codes: readonly string[]) => {
  defaultCodes = [...new Set(codes.concat(codes.map(c => c.split('-')[0])))];
};

export const i18n = (key: string, params?: Params): string | JSX.Element => {
  let codes = defaultCodes;

  if (l10ns.size === 0) {
    log.warn('No L10n packs found.');
  } else if (defaultCode) {
    codes = [...new Set(codes.concat(defaultCode))];
  }

  for (let i = 0; i < codes.length; i++) {
    const code = codes[i];
    const l10n = l10ns.get(code);
    if (l10n && (!isAlwaysFallback || l10n[key])) {
      try {
        return subParams(key, l10n[key], params);
      } catch (err) {
        let hasElements = false;
        const prefix = isTestMode ? 'TEST' : `I18N-MISSING(${code})`;
        const comps: Array<string | JSX.Element> = [`[${prefix}:${key}]`];
        if (params) {
          Object.keys(params).forEach(k => {
            const p = params[k];
            if (typeof p === 'function') {
              comps.push(<Fragment key={k}>{p(`[${prefix}:${key}--${k}]`)}</Fragment>);
              hasElements = true;
            }
          });
        }
        return hasElements ? <>{comps}</> : comps.join('');
      }
    }
  }

  return `[I18N-MISSING(${codes.join(',')}):${key}]`;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isReactElement = (val: any) => val && typeof val === 'object' && (val as any).type;

const PARAMS_REGEX = /\{([^}]+)}/g;
const FUNC_PARAM_REGEX = /(\w+)\(([\w\s]+)\)/;

const subParams = (key: string, text?: string, params: Params = {}): string | JSX.Element => {
  if (!text || isTestMode) {
    throw new Error('missing asset or test env');
  }

  let m = PARAMS_REGEX.exec(text);

  if (m) {
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
        if (isReactElement(val)) {
          comps.push(<Fragment key={param}>{val as JSX.Element}</Fragment>);
          hasElements = true;
        } else {
          switch (val) {
            case null:
            case undefined:
              comps.push('');
              break;
            default:
              comps.push(String(val));
          }
        }
      }

      i += m[0].length;

      m = PARAMS_REGEX.exec(text);
    }
    comps.push(text.substring(i));
    return hasElements ? <>{comps}</> : comps.join('');
  }

  return text;
};

interface Props {
  name: string;
  children?: ReactNode;
  params?: Params;
}

export const I18n: FC<Props> = ({ name, children, params }) => <>{i18n(name, { children, ...params })}</>;
export const i18nx = (key: string, params?: Params): JSX.Element => i18n(key, params) as JSX.Element;
export const i18ns = (key: string, params?: Params): string => i18n(key, params) as string;
