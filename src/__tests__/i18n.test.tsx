import '@testing-library/jest-dom/extend-expect';

import { render } from '@testing-library/react';
import React, { FC } from 'react';

import {
  addL10n,
  I18n,
  I18nContext,
  i18nsNoContext,
  setAlwaysFallback,
  setDefaultLanguages,
  setTestMode,
  withI18n,
  WithI18nProps,
} from '..';

addL10n(
  'en',
  {
    'big-thing': 'The thing is big',
    'dynamic-big-thing': 'The {thing} is big',
    'dynamic-big-obj': 'The {obj} is big',
    'func-big-thing': 'The {quote(nice car)} is big',
    'with-children': 'This one has {children} dude',
    'multiple-params': 'My name is {name} and I am {age} years old',
    'common.dropdown.selectedFraction': '({numerator}/{denominator} selected)',
    'english-only': 'Only English',
  },
  true,
);

addL10n('fr', {
  'big-thing': 'Le chose est grand',
  'dynamic-big-thing': 'Le {thing} est grand',
  'dynamic-big-obj': 'Le {obj} est grand',
  'func-big-thing': 'Le {quote(choses)} est grand',
});

describe('i18n', () => {
  beforeEach(() => {
    setTestMode(false);
    setDefaultLanguages(['en']);
  });

  it('works with a string asset using the i18n function', () => {
    const result = render(
      <div>
        <div data-testid="result">{i18nsNoContext('big-thing')}</div>
      </div>,
    );
    expect(result.getByTestId('result').textContent).toBe('The thing is big');
  });

  it('works with a parameterized string asset using the i18n function', () => {
    const result = render(
      <div>
        <div data-testid="result1">{i18nsNoContext('dynamic-big-thing', { thing: 'house' })}</div>
        <div data-testid="result2">{i18nsNoContext('dynamic-big-obj', { obj: <b>bubba</b> })}</div>
      </div>,
    );
    expect(result.getByTestId('result1').textContent).toBe('The house is big');
  });

  it('works with a parameterized string asset that has functions using the i18n function', () => {
    const result = render(
      <div>
        <div data-testid="result">{i18nsNoContext('func-big-thing', { quote: text => `"${text}"` })}</div>
      </div>,
    );
    expect(result.getByTestId('result').textContent).toBe('The "nice car" is big');
  });

  it('works with a string asset using the I18n component', () => {
    const result = render(
      <div>
        <div data-testid="result">
          <I18n name="big-thing" />
        </div>
      </div>,
    );
    expect(result.getByTestId('result').textContent).toBe('The thing is big');
  });

  it('works with a parameterized string asset using the I18n component', () => {
    const result = render(
      <div>
        <div data-testid="result">
          <I18n name="dynamic-big-thing" params={{ thing: 'house' }} />
        </div>
      </div>,
    );
    expect(result.getByTestId('result').textContent).toBe('The house is big');
  });

  it('inserts a missing asset error when the key is not found', () => {
    const result = render(
      <div>
        <div data-testid="result">{i18nsNoContext('not-there')}</div>
      </div>,
    );
    expect(result.getByTestId('result').textContent).toBe('[I18N-MISSING(en):not-there]');
  });

  it('falls back to the default L10n pack when the specified one is not found', () => {
    setDefaultLanguages(['pt']);
    const result = render(
      <div>
        <div data-testid="result">{i18nsNoContext('big-thing')}</div>
      </div>,
    );
    expect(result.getByTestId('result').textContent).toBe('The thing is big');
  });

  it('inserts a missing asset error when the key is not found but the L10n pack exists', () => {
    setDefaultLanguages(['fr']);
    const result = render(
      <div>
        <div data-testid="result">{i18nsNoContext('with-children')}</div>
      </div>,
    );
    expect(result.getByTestId('result').textContent).toBe('[I18N-MISSING(fr):with-children]');
  });

  it('inserts a test string when test mode is on', () => {
    setTestMode(true);
    const result = render(
      <div>
        <div data-testid="result1">{i18nsNoContext('big-thing')}</div>
        <div data-testid="result2">{i18nsNoContext('func-big-thing', { quote: text => `<<<${text}>>>` })}</div>
      </div>,
    );
    expect(result.getByTestId('result1').textContent).toBe('[TEST:big-thing]');
    expect(result.getByTestId('result2').textContent).toBe('[TEST:func-big-thing]<<<[TEST:func-big-thing--quote]>>>');
  });

  it('should substitute null, undefined and unspecified parameters with nothing', () => {
    expect(i18nsNoContext('multiple-params', { name: 'Patrick', age: '' })).toBe(
      'My name is Patrick and I am  years old',
    );
    expect(i18nsNoContext('multiple-params', { name: 'Patrick', age: null })).toBe(
      'My name is Patrick and I am  years old',
    );
    expect(i18nsNoContext('multiple-params', { name: 'Patrick', age: undefined })).toBe(
      'My name is Patrick and I am  years old',
    );
    expect(i18nsNoContext('multiple-params', { name: 'Patrick' })).toBe('My name is Patrick and I am  years old');
  });

  it('should render 0 and NaN as is', () => {
    expect(i18nsNoContext('multiple-params', { name: 'Patrick', age: 0 })).toBe(
      'My name is Patrick and I am 0 years old',
    );
    expect(i18nsNoContext('multiple-params', { name: 'Patrick', age: NaN })).toBe(
      'My name is Patrick and I am NaN years old',
    );
    expect(i18nsNoContext('multiple-params', { name: 'Patrick', age: 0 / 0 })).toBe(
      'My name is Patrick and I am NaN years old',
    );
  });

  it('should work properly for various combinations of "blank" parameters', () => {
    expect(i18nsNoContext('common.dropdown.selectedFraction')).toBe('(/ selected)');
    expect(i18nsNoContext('common.dropdown.selectedFraction', { numerator: 5 })).toBe('(5/ selected)');
    expect(i18nsNoContext('common.dropdown.selectedFraction', { denominator: 7 })).toBe('(/7 selected)');
    expect(i18nsNoContext('common.dropdown.selectedFraction', { numerator: 5, denominator: 7 })).toBe('(5/7 selected)');
    expect(i18nsNoContext('common.dropdown.selectedFraction', { numerator: null })).toBe('(/ selected)');
    expect(i18nsNoContext('common.dropdown.selectedFraction', { denominator: null })).toBe('(/ selected)');
    expect(i18nsNoContext('common.dropdown.selectedFraction', { numerator: null, denominator: null })).toBe(
      '(/ selected)',
    );
    expect(i18nsNoContext('common.dropdown.selectedFraction', { numerator: undefined })).toBe('(/ selected)');
    expect(i18nsNoContext('common.dropdown.selectedFraction', { denominator: undefined })).toBe('(/ selected)');
    expect(i18nsNoContext('common.dropdown.selectedFraction', { numerator: undefined, denominator: undefined })).toBe(
      '(/ selected)',
    );
    expect(i18nsNoContext('common.dropdown.selectedFraction', { numerator: 9, denominator: undefined })).toBe(
      '(9/ selected)',
    );
  });
});

describe('i18n - multiple languages', () => {
  beforeEach(() => {
    setTestMode(false);
    setAlwaysFallback(true);
    setDefaultLanguages(['fr']);
  });

  afterEach(() => {
    setAlwaysFallback(false);
  });

  it('renders the highest priority language if key exists', () => {
    expect(i18nsNoContext('big-thing')).toBe('Le chose est grand');
  });

  it('renders a lower priority language', () => {
    expect(i18nsNoContext('english-only')).toBe('Only English');
  });
});

describe('i18n - context', () => {
  beforeAll(() => {
    setTestMode(false);
    setDefaultLanguages(['fr', 'en']);
  });

  it('should render the highest priority language if no allowedLanguages set', () => {
    const result = render(
      <I18nContext>
        <div>
          <div data-testid="result1">
            <I18n name="big-thing" />
          </div>
        </div>
      </I18nContext>,
    );
    expect(result.getByTestId('result1').textContent).toBe('Le chose est grand');
  });

  it('should render the highest priority language in allowedLanguages if set', () => {
    const result = render(
      <I18nContext allowedLanguages={['en']}>
        <div>
          <div data-testid="result1">
            <I18n name="big-thing" />
          </div>
        </div>
      </I18nContext>,
    );
    expect(result.getByTestId('result1').textContent).toBe('The thing is big');
  });

  it('should render based on the nearest context ancestor', () => {
    const result = render(
      <I18nContext allowedLanguages={['en']}>
        <div>
          <div data-testid="result1">
            <I18n name="big-thing" />
          </div>
          <I18nContext>
            <div data-testid="result2">
              <I18n name="big-thing" />
            </div>
          </I18nContext>
        </div>
      </I18nContext>,
    );
    expect(result.getByTestId('result1').textContent).toBe('The thing is big');
    expect(result.getByTestId('result2').textContent).toBe('Le chose est grand');
  });
});

describe('i18n - withI18n HOC', () => {
  beforeAll(() => {
    setTestMode(false);
    setDefaultLanguages(['fr', 'en']);
  });

  interface CompProps extends WithI18nProps {
    name: string;
  }

  const Comp: FC<CompProps> = ({ i18n, name }) => <div>{i18n(name)}</div>;
  const I18nComp = withI18n(Comp);

  it('should render the highest priority language if no allowedLanguages set', () => {
    const result = render(
      <I18nContext>
        <div>
          <div data-testid="result1">
            <I18nComp name="big-thing" />
          </div>
        </div>
      </I18nContext>,
    );
    expect(result.getByTestId('result1').textContent).toBe('Le chose est grand');
  });

  it('should render the highest priority language in allowedLanguages if set', () => {
    const result = render(
      <I18nContext allowedLanguages={['en']}>
        <div>
          <div data-testid="result1">
            <I18nComp name="big-thing" />
          </div>
        </div>
      </I18nContext>,
    );
    expect(result.getByTestId('result1').textContent).toBe('The thing is big');
  });

  it('should render based on the nearest context ancestor', () => {
    const result = render(
      <I18nContext allowedLanguages={['en']}>
        <div>
          <div data-testid="result1">
            <I18nComp name="big-thing" />
          </div>
          <I18nContext>
            <div data-testid="result2">
              <I18nComp name="big-thing" />
            </div>
          </I18nContext>
        </div>
      </I18nContext>,
    );
    expect(result.getByTestId('result1').textContent).toBe('The thing is big');
    expect(result.getByTestId('result2').textContent).toBe('Le chose est grand');
  });
});
