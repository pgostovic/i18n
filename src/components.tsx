import React, { ComponentType, createContext, Fragment, ReactNode, useCallback, useContext } from 'react';

import defaultAcceptLangs from './acceptLangs';
import { Context } from './context';
import { i18n, Params, Token } from './i18n';

const CompoContext = createContext<Context>({ acceptLangs: defaultAcceptLangs, l10ns: {} });

const { Consumer, Provider } = CompoContext;

interface I18nContextProps extends Partial<Context> {
  inheritL10ns?: boolean;
  children: ReactNode;
}

export const I18nContext = ({
  children,
  acceptLangs,
  permitLangs,
  allowFallback,
  defaultLang,
  l10ns,
  onMissing,
  inheritL10ns = true,
}: I18nContextProps) => (
  <Consumer>
    {context => (
      <Provider
        value={{
          acceptLangs: acceptLangs || context.acceptLangs,
          permitLangs: permitLangs || context.permitLangs,
          allowFallback: allowFallback || context.allowFallback,
          defaultLang: defaultLang || context.defaultLang,
          l10ns: inheritL10ns ? combineL10ns(context.l10ns, l10ns) : l10ns || context.l10ns,
          onMissing: onMissing || context.onMissing,
        }}
      >
        {children}
      </Provider>
    )}
  </Consumer>
);

const combineL10ns = (l10ns1: Context['l10ns'], l10ns2: Context['l10ns'] = {}): Context['l10ns'] => {
  const combined = { ...l10ns1 };
  for (const lang in l10ns2) {
    if (l10ns2.hasOwnProperty(lang)) {
      combined[lang] = { ...combined[lang], ...l10ns2[lang] };
    }
  }
  return combined;
};

interface I18nProps {
  name: string;
  children?: ReactNode;
  params?: Params<ReactNode>;
  silentMissing?: boolean;
}

export const I18n = ({ name, children, params, silentMissing }: I18nProps) => (
  <Consumer>{context => i18n(name, { children, ...params }, context, silentMissing).map(addKeyIfNeeded)}</Consumer>
);

export type I18nsFn = (key: string, params?: Params<string | number | undefined>, silentMissing?: boolean) => string;

export type I18nsFnSilent = (key: string, params?: Params<string | number | undefined>) => string;

export interface WithI18nProps {
  i18ns: I18nsFn;
  i18nsSilent: I18nsFnSilent;
  i18nContext: Context;
}

export const withI18n = <T extends WithI18nProps = WithI18nProps>(Wrapped: ComponentType<T>) =>
  ((props: T) => (
    <Consumer>
      {context => (
        <Wrapped
          {...props}
          i18ns={(key: string, params?: Params<string | number>, silentMissing = false) =>
            i18n(key, params || {}, context, silentMissing).join('')
          }
          i18nsSilent={(key: string, params?: Params<string | number>) =>
            i18n(key, params || {}, context, true).join('')
          }
          i18nContext={context}
        />
      )}
    </Consumer>
  )) as (props: Omit<T, keyof WithI18nProps>) => JSX.Element;

const addKeyIfNeeded = (token: Token<ReactNode>, i: number): ReactNode => {
  if (typeof token === 'object' && (token as { type?: string }).type) {
    return <Fragment key={i}>{token}</Fragment>;
  }
  if (typeof token === 'function') {
    throw new Error('Illegal token type: function');
  }
  return token;
};

export const useI18nContext = () => useContext(CompoContext);

export const useI18n = (): Omit<WithI18nProps, 'i18nContext'> => {
  const context = useContext(CompoContext);

  const i18ns = useCallback(
    (key: string, params?: Params<string | number | undefined>, silentMissing = false) =>
      i18n(key, params || {}, context, silentMissing).join(''),
    [context],
  );

  const i18nsSilent = useCallback(
    (key: string, params?: Params<string | number | undefined>) => i18n(key, params || {}, context, true).join(''),
    [context],
  );

  return { i18ns, i18nsSilent };
};
