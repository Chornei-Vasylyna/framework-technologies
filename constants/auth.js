export const AUTH = {
  accessTokenTtlSeconds: 15 * 60,
  refreshTokenTtlSeconds: 7 * 24 * 60 * 60,
  refreshCookieName: "refreshToken",
  redis: {
    blacklistPrefix: "auth:blacklist:",
    refreshPrefix: "auth:refresh:",
  },
};
