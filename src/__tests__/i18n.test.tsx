import '@testing-library/jest-dom/extend-expect';

import { render } from '@testing-library/react';
import React from 'react';

import { addL10n, I18n, i18n, setDefaultLanguages, setTestMode } from '..';

addL10n('en', {
  'big-thing': 'The thing is big',
  'dynamic-big-thing': 'The {thing} is big',
  'dynamic-big-obj': 'The {obj} is big',
  'func-big-thing': 'The {quote(nice car)} is big',
  'with-children': 'This one has {children} dude',
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

  it('inserts a missing asset error when L10n is not found', () => {
    setDefaultLanguages(['fr']);
    const result = render(
      <div>
        <div data-testid="result">{i18n('big-thing')}</div>
      </div>,
    );
    expect(result.getByTestId('result').textContent).toBe('[I18N-MISSING(fr):big-thing]');
  });

  it('inserts a test string when test mode is on', () => {
    setTestMode(true);
    const result = render(
      <div>
        <div data-testid="result1">{i18n('big-thing')}</div>
        <div data-testid="result2">{i18n('func-big-thing', { quote: text => `<<<${text}>>>` })}</div>
      </div>,
    );
    expect(result.getByTestId('result1').textContent).toBe('[TEST:big-thing]');
    expect(result.getByTestId('result2').textContent).toBe('[TEST:func-big-thing]<<<[TEST:func-big-thing--quote]>>>');
  });
});
