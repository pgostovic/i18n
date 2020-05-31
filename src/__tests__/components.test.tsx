import '@testing-library/jest-dom/extend-expect';

import { render } from '@testing-library/react';
import React, { FC } from 'react';

import { addL10n, I18n, I18nContext, withI18n, WithI18nProps } from '..';

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

describe('<I18n />', () => {
  it('renders an asset', () => {
    const result = render(
      <div>
        <div data-testid="result">
          <I18n name="big-thing" />
        </div>
      </div>,
    );
    expect(result.getByTestId('result').textContent).toBe('The thing is big');
  });

  it('renders a parameterized asset', () => {
    const result = render(
      <div>
        <div data-testid="result">
          <I18n name="dynamic-big-thing" params={{ thing: 'house' }} />
        </div>
      </div>,
    );
    expect(result.getByTestId('result').textContent).toBe('The house is big');
  });

  it('renders a parameterized asset with JSX', () => {
    const result = render(
      <div>
        <div data-testid="result">
          <I18n name="dynamic-big-thing" params={{ thing: <b>house</b> }} />
        </div>
      </div>,
    );
    expect(result.getByTestId('result').innerHTML).toBe('The <b>house</b> is big');
  });
});

describe('<I18nContext />', () => {
  it('renders an asset for the specified lang', () => {
    const result = render(
      <I18nContext acceptLangs={['fr']}>
        <div data-testid="result">
          <I18n name="big-thing" />
        </div>
      </I18nContext>,
    );
    expect(result.getByTestId('result').textContent).toBe('Le chose est grand');
  });

  it('overrides values through nesting', () => {
    const result = render(
      <I18nContext acceptLangs={['fr']}>
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

  it('renders an asset', () => {
    const result = render(
      <div>
        <div data-testid="result">
          <I18nComp name="big-thing" />
        </div>
      </div>,
    );
    expect(result.getByTestId('result').textContent).toBe('The thing is big');
  });
});
