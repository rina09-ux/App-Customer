function requiredUrl(name: string): string {
  const value = import.meta.env[name];
  if (!value) throw new Error(`${name} is required; refusing implicit production fallback.`);
  return String(value).replace(/\/$/, '');
}

export const NUSASEC_CORE_URL = requiredUrl('VITE_NUSASEC_CORE_URL');
export const NUSASEC_AI_URL = requiredUrl('VITE_NUSASEC_AI_URL');
export const NUSASEC_INTERNAL_URL = requiredUrl('VITE_NUSASEC_INTERNAL_URL');
export const NUSASEC_PUBLIC_URL = requiredUrl('VITE_NUSASEC_PUBLIC_URL');

export const coreUrl = (path: string) => `${NUSASEC_CORE_URL}/${path.replace(/^\//, '')}`;
export const aiUrl = (path: string) => `${NUSASEC_AI_URL}/${path.replace(/^\//, '')}`;
