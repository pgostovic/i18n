/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom/extend-expect';

import { render } from '@testing-library/react';
import React, { FC } from 'react';

import { I18n, I18nContext, withI18n, WithI18nProps } from '..';
import { useI18n } from '../components';

const enStrings = {
  'big-thing': 'The thing is big',
  'dynamic-big-thing': 'The {thing} is big',
  'dynamic-big-obj': 'The "{obj}" is big',
  'func-big-thing': 'The {quote(nice car)} is big',
  'with-children': 'This one has {children} dude',
  'multiple-params': 'My name is {name} and I am {age} years old',
  'common.dropdown.selectedFraction': '({numerator}/{denominator} selected)',
  'english-only': 'Only English',
};

const frStrings = {
  'big-thing': 'Le chose est grand',
  'dynamic-big-thing': 'Le {thing} est grand',
  'dynamic-big-obj': 'Le {obj} est grand',
  'func-big-thing': 'Le {quote(choses)} est grand',
};

const l10ns = {
  en: enStrings,
  fr: frStrings,
};

describe('<I18n />', () => {
  it('renders an asset', () => {
    const result = render(
      <I18nContext l10ns={l10ns}>
        <div>
          <div data-testid="result">
            <I18n name="big-thing" />
          </div>
        </div>
      </I18nContext>,
    );
    expect(result.getByTestId('result').textContent).toBe('The thing is big');
  });

  it('renders a parameterized asset', () => {
    const result = render(
      <I18nContext l10ns={l10ns}>
        <div>
          <div data-testid="result">
            <I18n name="dynamic-big-thing" params={{ thing: 'house' }} />
          </div>
        </div>
      </I18nContext>,
    );
    expect(result.getByTestId('result').textContent).toBe('The house is big');
  });

  it('renders a parameterized asset with JSX', () => {
    const result = render(
      <I18nContext l10ns={l10ns}>
        <div>
          <div data-testid="result">
            <I18n name="dynamic-big-thing" params={{ thing: <b>house</b> }} />
          </div>
        </div>
      </I18nContext>,
    );
    expect(result.getByTestId('result').innerHTML).toBe('The <b>house</b> is big');
  });
});

describe('<I18nContext />', () => {
  it('renders an asset for the specified lang', () => {
    const result = render(
      <I18nContext acceptLangs={['fr']} l10ns={l10ns}>
        <div data-testid="result">
          <I18n name="big-thing" />
        </div>
      </I18nContext>,
    );
    expect(result.getByTestId('result').textContent).toBe('Le chose est grand');
  });

  it('overrides values through nesting', () => {
    const result = render(
      <I18nContext acceptLangs={['fr']} l10ns={l10ns}>
        <I18nContext acceptLangs={['en']}>
          <div data-testid="result">
            <I18n name="big-thing" />
          </div>
        </I18nContext>
      </I18nContext>,
    );
    expect(result.getByTestId('result').textContent).toBe('The thing is big');
  });
});

describe('withI18n HOC', () => {
  const Comp: FC<{ name: string } & WithI18nProps> = ({ i18ns, name }) => <div>{i18ns(name)}</div>;
  const I18nComp = withI18n(Comp);

  const CompSilentMissing: FC<{ name: string } & WithI18nProps> = ({ i18nsSilent, name }) => (
    <div>{i18nsSilent(name)}</div>
  );
  const I18nCompSilentMissing = withI18n(CompSilentMissing);

  it('renders an asset', () => {
    const result = render(
      <I18nContext l10ns={l10ns}>
        <div>
          <div data-testid="result">
            <I18nComp name="big-thing" />
          </div>
          <div data-testid="resultMissingAsset">
            <I18nCompSilentMissing name="no-such-message" />
          </div>
        </div>
      </I18nContext>,
    );
    expect(result.getByTestId('result').textContent).toBe('The thing is big');
    expect(result.getByTestId('resultMissingAsset').textContent).toBe('');
  });
});

describe('useI18n', () => {
  it('returns an asset from i18ns', () => {
    const result = render(
      <I18nContext l10ns={l10ns}>
        <div>
          <div data-testid="result">
            <SomeComp />
          </div>
          <div data-testid="resultMissingAsset">
            <SomeCompMissingAsset />
          </div>
        </div>
      </I18nContext>,
    );
    expect(result.getByTestId('result').textContent).toBe('The thing is big');
    expect(result.getByTestId('resultMissingAsset').textContent).toBe('');
  });
});

const SomeComp: FC = () => {
  const { i18ns } = useI18n();
  return <>{i18ns('big-thing')}</>;
};

const SomeCompMissingAsset: FC = () => {
  const { i18nsSilent } = useI18n();
  return <>{i18nsSilent('no-such-message')}</>;
};
