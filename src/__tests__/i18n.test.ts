import { Context } from '../context';
import { i18n, Params } from '../i18n';
import { addL10n } from '../l10n';

export const i18ns = (key: string, params: Params<string | number | null | undefined>, context?: Context) =>
  i18n(key, params, context).join('');

addL10n('en', {
  'big-thing': 'The thing is big',
  'dynamic-big-thing': 'The {thing} is big',
  'dynamic-big-obj': 'The "{obj}" is big',
  'func-big-thing': 'The {quote(nice car)} is big',
  'with-children': 'This one has {children} dude',
  'multiple-params': 'My name is {name} and I am {age} years old',
  'common.dropdown.selectedFraction': '({numerator}/{denominator} selected)',
  'english-only': 'Only English',
});

addL10n('fr', {
  'big-thing': 'Le chose est grand',
  'dynamic-big-thing': 'Le {thing} est grand',
  'dynamic-big-obj': 'Le {obj} est grand',
  'func-big-thing': 'Le {quote(choses)} est grand',
});

const enCtx = { acceptLangs: ['en'] };
const frCtx = { acceptLangs: ['fr'] };
const ptCtx = { acceptLangs: ['pt'] };

describe('Basic Asset Lookup and fallback', () => {
  it('returns the correct result for the specified langugage', () => {
    expect(i18ns('big-thing', {}, enCtx)).toBe('The thing is big');
    expect(i18ns('big-thing', {}, frCtx)).toBe('Le chose est grand');
  });

  it('returns a missing asset error when the key is not found', () => {
    expect(i18ns('not-there', {}, enCtx)).toBe('[I18N-MISSING(en):not-there]');
  });

  it('returns an asset for the defaultLang when the l10n pack is not found', () => {
    expect(i18ns('big-thing', {}, ptCtx)).toBe('The thing is big');
  });

  it('returns a missing asset error when the l10n pack is not found and there is no defaultLang', () => {
    expect(i18ns('big-thing', {}, { ...ptCtx, defaultLang: undefined })).toBe('[I18N-MISSING(pt):big-thing]');
  });

  it('returns an asset for the fallback lang when an l10n pack is found but the key is not - allowFallback set to true', () => {
    expect(i18ns('english-only', {}, { ...frCtx, allowFallback: true })).toBe('Only English');
  });

  it('returns missing asset error when an l10n pack is found but the key is not - allowFallback set to false', () => {
    expect(i18ns('english-only', {}, frCtx)).toBe('[I18N-MISSING(fr,en):english-only]');
  });
});

describe('Parameter Substitution', () => {
  it('works with a parameterized string asset', () => {
    expect(i18ns('dynamic-big-thing', { thing: 'house' }, enCtx)).toBe('The house is big');
  });

  it('works with a parameterized string asset that has functions', () => {
    expect(i18ns('func-big-thing', { quote: (text: string) => `"${text}"` }, enCtx)).toBe('The "nice car" is big');
  });

  it('should substitute null, undefined and unspecified parameters with nothing', () => {
    expect(i18ns('multiple-params', { name: 'Patrick', age: '' }, enCtx)).toBe(
      'My name is Patrick and I am  years old',
    );
    expect(i18ns('multiple-params', { name: 'Patrick', age: null }, enCtx)).toBe(
      'My name is Patrick and I am  years old',
    );
    expect(i18ns('multiple-params', { name: 'Patrick', age: undefined }, enCtx)).toBe(
      'My name is Patrick and I am  years old',
    );
    expect(i18ns('multiple-params', { name: 'Patrick' }, enCtx)).toBe('My name is Patrick and I am  years old');
  });

  it('should render 0 and NaN as is', () => {
    expect(i18ns('multiple-params', { name: 'Patrick', age: 0 }, enCtx)).toBe(
      'My name is Patrick and I am 0 years old',
    );
    expect(i18ns('multiple-params', { name: 'Patrick', age: NaN }, enCtx)).toBe(
      'My name is Patrick and I am NaN years old',
    );
    expect(i18ns('multiple-params', { name: 'Patrick', age: 0 / 0 }, enCtx)).toBe(
      'My name is Patrick and I am NaN years old',
    );
  });

  it('should work properly for various combinations of "blank" parameters', () => {
    expect(i18ns('common.dropdown.selectedFraction', {}, enCtx)).toBe('(/ selected)');
    expect(i18ns('common.dropdown.selectedFraction', { numerator: 5 }, enCtx)).toBe('(5/ selected)');
    expect(i18ns('common.dropdown.selectedFraction', { denominator: 7 }, enCtx)).toBe('(/7 selected)');
    expect(i18ns('common.dropdown.selectedFraction', { numerator: 5, denominator: 7 }, enCtx)).toBe('(5/7 selected)');
    expect(i18ns('common.dropdown.selectedFraction', { numerator: null }, enCtx)).toBe('(/ selected)');
    expect(i18ns('common.dropdown.selectedFraction', { denominator: null }, enCtx)).toBe('(/ selected)');
    expect(i18ns('common.dropdown.selectedFraction', { numerator: null, denominator: null }, enCtx)).toBe(
      '(/ selected)',
    );
    expect(i18ns('common.dropdown.selectedFraction', { numerator: undefined }, enCtx)).toBe('(/ selected)');
    expect(i18ns('common.dropdown.selectedFraction', { denominator: undefined }, enCtx)).toBe('(/ selected)');
    expect(i18ns('common.dropdown.selectedFraction', { numerator: undefined, denominator: undefined }, enCtx)).toBe(
      '(/ selected)',
    );
    expect(i18ns('common.dropdown.selectedFraction', { numerator: 9, denominator: undefined }, enCtx)).toBe(
      '(9/ selected)',
    );
  });
});
