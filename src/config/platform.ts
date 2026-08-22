export const NUSASEC_CORE_URL = import.meta.env.VITE_NUSASEC_CORE_URL || 'https://api.nusasec.com';
export const NUSASEC_AI_URL = import.meta.env.VITE_NUSASEC_AI_URL || 'https://ai.nusasec.com';
export const NUSASEC_INTERNAL_URL = import.meta.env.VITE_NUSASEC_INTERNAL_URL || 'https://internal.nusasec.com';
export const NUSASEC_PUBLIC_URL = import.meta.env.VITE_NUSASEC_PUBLIC_URL || 'https://nusasec.com';

export const coreUrl = (path: string) => `${NUSASEC_CORE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
export const aiUrl = (path: string) => `${NUSASEC_AI_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
