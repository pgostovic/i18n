export interface L10n {
  [key: string]: string;
}

export const l10ns = new Map<string, L10n>();

export const addL10n = (code: string, l10n: L10n) => {
  const existingL10n = l10ns.get(code);
  if (existingL10n) {
    Object.assign(existingL10n, l10n);
  } else {
    l10ns.set(code, l10n);
  }
};
