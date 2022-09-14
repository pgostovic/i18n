import defaultAcceptLangs from './acceptLangs';

export interface L10n {
  [key: string]: string;
}

export interface Context {
  /**
   * The user's langugages in order of preference.
   * Note: default is navigator.languages.
   */
  acceptLangs: readonly string[];

  /**
   * Limits the langs that may be used. This would be imposed by the app.
   */
  permitLangs?: Set<string>;

  /**
   * If an l10n pack is found but the key is not, then fallback to the user's next lang.
   * Note: this allows strings from multiple l10n packs.
   */
  allowFallback?: boolean;

  /**
   * The lang to use if none of the langs in accceptLangs is supported.
   * Note: default is 'en'.
   */
  defaultLang?: string;

  /**
   * The strings for the supported languages.
   * {
   *    "en": {
   *      "greeting": "Hello"
   *    },
   *    "fr": {
   *      "greeting": "Bonjour"
   *    }
   * }
   */
  l10ns: {
    [key: string]: L10n;
  };

  onMissing?(info: { key: string; langs: readonly string[]; err: Error }): void;
}

const DEFAULT_CONTEXT: Context = { acceptLangs: defaultAcceptLangs, defaultLang: 'en', l10ns: {} };

export const getEffectiveContext = (context: Partial<Context> = {}): Context => {
  const effectiveContext = { ...DEFAULT_CONTEXT, ...context };

  // Append defaultLang to the end of acceptLangs if specified.
  if (effectiveContext.defaultLang) {
    effectiveContext.acceptLangs = [...new Set([...effectiveContext.acceptLangs, effectiveContext.defaultLang])];
  }

  // Extend acceptLangs by appending the language only portions of supplied acceptLangs.
  // e.g. ['en-CA', 'fr-CA'] -> ['en-CA', 'fr-CA', 'en', 'fr']
  effectiveContext.acceptLangs = [
    ...new Set([...effectiveContext.acceptLangs, ...effectiveContext.acceptLangs].map(c => c.split('-')[0])),
  ];
  return effectiveContext;
};
