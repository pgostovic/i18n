import React, { ComponentType, createContext, FC, Fragment, ReactNode, useCallback, useContext } from 'react';

import defaultAcceptLangs from './acceptLangs';
import { Context } from './context';
import { i18n, Params, Token } from './i18n';

const CompoContext = createContext<Context>({ acceptLangs: defaultAcceptLangs, l10ns: {} });

const { Consumer, Provider } = CompoContext;

export const I18nContext: FC<Partial<Context>> = ({
  children,
  acceptLangs,
  permitLangs,
  allowFallback,
  defaultLang,
  l10ns,
}) => (
  <Consumer>
    {context => (
      <Provider
        value={{
          acceptLangs: acceptLangs || context.acceptLangs,
          permitLangs: permitLangs || context.permitLangs,
          allowFallback: allowFallback || context.allowFallback,
          defaultLang: defaultLang || context.defaultLang,
          l10ns: l10ns || context.l10ns,
        }}
      >
        {children}
      </Provider>
    )}
  </Consumer>
);

interface I18nProps {
  name: string;
  children?: ReactNode;
  params?: Params<ReactNode>;
  silentMissing?: boolean;
}

export const I18n: FC<I18nProps> = ({ name, children, params, silentMissing }) => (
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
  )) as FC<Omit<T, keyof WithI18nProps>>;

const addKeyIfNeeded = (token: Token<ReactNode>, i: number): Token<ReactNode> => {
  if (typeof token === 'object' && (token as { type?: string }).type) {
    return <Fragment key={i}>{token}</Fragment>;
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
