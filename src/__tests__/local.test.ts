/**
 * @jest-environment jsdom
 */

import { getI18nContext, i18ns, setI18nContext } from '../local';

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

describe('Local context', () => {
  it('should throw if not context is set', () => {
    expect(() => {
      i18ns('big-thing');
    }).toThrow();
  });

  it('should return a context of undefined by default', () => {
    expect(getI18nContext()).toBeUndefined();
  });

  it('should return the correct asset (en)', async () => {
    await setI18nContext({ acceptLangs: ['en'], l10ns });
    expect(i18ns('big-thing')).toBe('The thing is big');
  });

  it('should return the correct asset (fr)', async () => {
    await setI18nContext({ acceptLangs: ['fr'], l10ns });
    expect(i18ns('big-thing')).toBe('Le chose est grand');
  });

  it('should return the correct asset from function', async () => {
    await setI18nContext({ acceptLangs: ['fr'], l10ns });
    expect(getI18nVal('big-thing')).toBe('Le chose est grand');
  });

  it('should return the correct asset from async function', async () => {
    await setI18nContext({ acceptLangs: ['fr'], l10ns });
    expect(await getI18nValAsync('big-thing')).toBe('Le chose est grand');
  });
});

const getI18nVal = (key: string) => i18ns(key);

const getI18nValAsync = async (key: string): Promise<string> =>
  new Promise<string>(resolve => {
    setTimeout(() => {
      resolve(i18ns(key));
    }, 10);
  });
