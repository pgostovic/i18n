let acceptLangs: readonly string[] = [];

if (typeof navigator === 'object' && typeof Navigator === 'function' && navigator instanceof Navigator) {
  acceptLangs = navigator.languages;
} else {
  acceptLangs = [Intl.DateTimeFormat().resolvedOptions().locale];
}

export default acceptLangs;
