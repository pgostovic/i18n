import '@testing-library/jest-dom/extend-expect';

import { render } from '@testing-library/react';
import React from 'react';

import { addL10n, I18n, i18n, i18ns, i18nx, setDefaultLanguages, setTestMode } from '..';

addL10n('en', {
  'big-thing': 'The thing is big',
  'dynamic-big-thing': 'The {thing} is big',
  'dynamic-big-obj': 'The {obj} is big',
  'func-big-thing': 'The {quote(nice car)} is big',
  'with-children': 'This one has {children} dude',
  'multiple-params': 'My name is {name} and I am {age} years old',
});

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
        <div data-testid="result">{i18n('big-thing')}</div>
      </div>,
    );
    expect(result.getByTestId('result').textContent).toBe('The thing is big');
  });

  it('works with a parameterized string asset using the i18n function', () => {
    const result = render(
      <div>
        <div data-testid="result1">{i18n('dynamic-big-thing', { thing: 'house' })}</div>
        <div data-testid="result2">{i18n('dynamic-big-obj', { obj: <b>bubba</b> })}</div>
      </div>,
    );
    expect(result.getByTestId('result1').textContent).toBe('The house is big');
  });

  it('works with a parameterized string asset that has functions using the i18n function', () => {
    const result = render(
      <div>
        <div data-testid="result">{i18n('func-big-thing', { quote: text => `"${text}"` })}</div>
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
        <div data-testid="result">{i18n('not-there')}</div>
      </div>,
    );
    expect(result.getByTestId('result').textContent).toBe('[I18N-MISSING(en):not-there]');
  });

  it('falls back to the default L10n pack when the specified one is not found', () => {
    setDefaultLanguages(['pt']);
    const result = render(
      <div>
        <div data-testid="result">{i18nx('big-thing')}</div>
      </div>,
    );
    expect(result.getByTestId('result').textContent).toBe('The thing is big');
  });

  it('inserts a missing asset error when the key is not found but the L10n pack exists', () => {
    setDefaultLanguages(['fr']);
    const result = render(
      <div>
        <div data-testid="result">{i18n('with-children')}</div>
      </div>,
    );
    expect(result.getByTestId('result').textContent).toBe('[I18N-MISSING(fr):with-children]');
  });

  it('inserts a test string when test mode is on', () => {
    setTestMode(true);
    const result = render(
      <div>
        <div data-testid="result1">{i18ns('big-thing')}</div>
        <div data-testid="result2">{i18n('func-big-thing', { quote: text => `<<<${text}>>>` })}</div>
      </div>,
    );
    expect(result.getByTestId('result1').textContent).toBe('[TEST:big-thing]');
    expect(result.getByTestId('result2').textContent).toBe('[TEST:func-big-thing]<<<[TEST:func-big-thing--quote]>>>');
  });

  it('should substitute null, undefined and unspecified parameters with nothing', () => {
    expect(i18ns('multiple-params', { name: 'Patrick', age: '' })).toBe('My name is Patrick and I am  years old');
    expect(i18ns('multiple-params', { name: 'Patrick', age: null })).toBe('My name is Patrick and I am  years old');
    expect(i18ns('multiple-params', { name: 'Patrick', age: undefined })).toBe(
      'My name is Patrick and I am  years old',
    );
    expect(i18ns('multiple-params', { name: 'Patrick' })).toBe('My name is Patrick and I am  years old');
  });

  it('should render 0 and NaN as is', () => {
    expect(i18ns('multiple-params', { name: 'Patrick', age: 0 })).toBe('My name is Patrick and I am 0 years old');
    expect(i18ns('multiple-params', { name: 'Patrick', age: NaN })).toBe('My name is Patrick and I am NaN years old');
    expect(i18ns('multiple-params', { name: 'Patrick', age: 0 / 0 })).toBe('My name is Patrick and I am NaN years old');
  });
});
