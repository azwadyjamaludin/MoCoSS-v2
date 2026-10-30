export const DEV_APP =
  (process.env.EXPO_PUBLIC_DEV_APP ?? '').trim().toLowerCase() === 'true';