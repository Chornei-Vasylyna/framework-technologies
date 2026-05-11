import crypto from "node:crypto";
import argon2 from "argon2";
import { AUTH } from "#constants/auth.js";

export const hashPassword = async (password) => {
  return argon2.hash(password);
};

export const verifyPassword = async ({ hash, password }) => {
  return argon2.verify(hash, password);
};

export const createAccessToken = async ({ fastify, user }) => {
  const jti = crypto.randomUUID();
  const accessToken = await fastify.jwt.sign(
    {
      userId: Number(user.id),
      email: user.email,
    },
    {
      jti,
      expiresIn: AUTH.accessTokenTtlSeconds,
    },
  );

  return { accessToken, jti };
};

export const createRefreshToken = () => {
  return crypto.randomBytes(48).toString("base64url");
};

export const getRefreshRedisKey = (refreshToken) => {
  return `${AUTH.redis.refreshPrefix}${refreshToken}`;
};

export const getBlacklistRedisKey = (jti) => {
  return `${AUTH.redis.blacklistPrefix}${jti}`;
};

export const storeRefreshToken = async ({ redis, refreshToken, userId }) => {
  const key = getRefreshRedisKey(refreshToken);
  await redis.set(key, String(userId), "EX", AUTH.refreshTokenTtlSeconds);
};

export const consumeRefreshToken = async ({ redis, refreshToken }) => {
  const key = getRefreshRedisKey(refreshToken);
  const userId = await redis.get(key);

  if (!userId) {
    return null;
  }

  return Number(userId);
};

export const deleteRefreshToken = async ({ redis, refreshToken }) => {
  if (!refreshToken) {
    return;
  }

  const key = getRefreshRedisKey(refreshToken);
  await redis.del(key);
};

export const blacklistAccessToken = async ({ redis, jti, exp }) => {
  const key = getBlacklistRedisKey(jti);

  const nowSeconds = Math.floor(Date.now() / 1000);
  const ttlSeconds = Math.max(0, Number(exp ?? 0) - nowSeconds);

  if (ttlSeconds <= 0) {
    return;
  }

  await redis.set(key, "1", "EX", ttlSeconds);
};
