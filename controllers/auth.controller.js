import { AUTH } from "#constants/auth.js";
import { ERROR_MESSAGES } from "#constants/errorMessages.js";
import { userRepository } from "#repositories/user.repository.js";
import {
  blacklistAccessToken,
  createAccessToken,
  createRefreshToken,
  deleteRefreshToken,
  hashPassword,
  storeRefreshToken,
  verifyPassword,
} from "#utils/auth.service.js";

const getCookieOptions = (nodeEnv) => ({
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  secure: nodeEnv === "production",
  maxAge: AUTH.refreshTokenTtlSeconds,
});

export const register = async (request, reply) => {
  const { email, password } = request.body;

  const existing = await userRepository.findByEmail(email);
  if (existing) {
    return reply.conflict(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
  }

  const passwordHash = await hashPassword(password);
  const user = await userRepository.create({ email, passwordHash });

  return reply.status(201).send({ user });
};

export const login = async (request, reply) => {
  const { email, password } = request.body;

  const userWithPassword = await userRepository.findByEmailWithPassword(email);

  if (!userWithPassword) {
    return reply.unauthorized(ERROR_MESSAGES.INVALID_CREDENTIALS);
  }

  const passwordOk = await verifyPassword({
    hash: userWithPassword.password,
    password,
  });

  if (!passwordOk) {
    return reply.unauthorized(ERROR_MESSAGES.INVALID_CREDENTIALS);
  }

  const user = { id: userWithPassword.id, email: userWithPassword.email };
  const { accessToken } = await createAccessToken({
    fastify: request.server,
    user,
  });

  const refreshToken = createRefreshToken();
  await storeRefreshToken({
    redis: request.server.redis,
    refreshToken,
    userId: user.id,
  });

  reply.setCookie(
    AUTH.refreshCookieName,
    refreshToken,
    getCookieOptions(request.server.config.NODE_ENV),
  );

  return reply.status(200).send({ accessToken });
};

export const refresh = async (request, reply) => {
  const refreshToken = request.cookies?.[AUTH.refreshCookieName];

  if (!refreshToken) {
    return reply.unauthorized(ERROR_MESSAGES.REFRESH_TOKEN_MISSING);
  }

  const key = `auth:refresh:${refreshToken}`;
  const userIdString = await request.server.redis.get(key);

  if (!userIdString) {
    return reply.unauthorized(ERROR_MESSAGES.REFRESH_TOKEN_INVALID);
  }

  const userId = Number(userIdString);
  const user = await userRepository.findById(userId);

  if (!user) {
    await deleteRefreshToken({ redis: request.server.redis, refreshToken });
    reply.clearCookie(
      AUTH.refreshCookieName,
      getCookieOptions(request.server.config.NODE_ENV),
    );
    return reply.unauthorized(ERROR_MESSAGES.REFRESH_TOKEN_INVALID);
  }

  const { accessToken } = await createAccessToken({
    fastify: request.server,
    user,
  });

  return reply.status(200).send({ accessToken });
};

export const logout = async (request, reply) => {
  const refreshToken = request.cookies?.[AUTH.refreshCookieName];

  const jti = request.user?.jti;
  const exp = request.user?.exp;

  if (jti && exp) {
    await blacklistAccessToken({ redis: request.server.redis, jti, exp });
  }

  await deleteRefreshToken({ redis: request.server.redis, refreshToken });

  reply.clearCookie(
    AUTH.refreshCookieName,
    getCookieOptions(request.server.config.NODE_ENV),
  );

  return reply.status(204).send();
};
