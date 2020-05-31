import React, { ComponentType, createContext, FC, Fragment, ReactNode } from 'react';

import defaultAcceptLangs from './acceptLangs';
import { Context } from './context';
import { i18n, Params, Token } from './i18n';

const { Provider, Consumer } = createContext<Context>({ acceptLangs: defaultAcceptLangs });

export const I18nContext: FC<Partial<Context>> = ({
  children,
  acceptLangs,
  permitLangs,
  allowFallback,
  defaultLang,
}) => (
  <Consumer>
    {context => (
      <Provider
        value={{
          acceptLangs: acceptLangs || context.acceptLangs,
          permitLangs: permitLangs || context.permitLangs,
          allowFallback: allowFallback || context.allowFallback,
          defaultLang: defaultLang || context.defaultLang,
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
}

export const I18n: FC<I18nProps> = ({ name, children, params }) => (
  <Consumer>{context => i18n(name, { children, ...params }, context).map(addKeyIfNeeded)}</Consumer>
);

export type I18nsFn = (key: string, params?: Params<string | number>) => string;

export interface WithI18nProps {
  i18ns: I18nsFn;
}

export const withI18n = <T extends WithI18nProps = WithI18nProps>(Wrapped: ComponentType<T>) =>
  ((props: T) => (
    <Consumer>
      {context => (
        <Wrapped
          {...props}
          i18ns={(key: string, params?: Params<string | number>) => i18n(key, params || {}, context).join('')}
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
