import { userRepository } from "#repositories/user.repository.js";
import { hashPassword, verifyPassword } from "#src/services/auth.service.js";

const toSafeUser = (user) => ({
  id: user.id,
  email: user.email,
});

export const registerUser = async (request, reply) => {
  const { email, password } = request.body;

  const existing = await userRepository.findByEmail(email);

  if (existing) {
    return reply.conflict("Email already exists");
  }

  const hashed = await hashPassword(password);
  const user = await userRepository.create({ email, password: hashed });

  return reply.status(201).send({
    message: "Registered",
    user: toSafeUser(user),
  });
};

export const loginUser = async (request, reply) => {
  const { email, password } = request.body;

  const user = await userRepository.findByEmail(email);

  if (!user) {
    return reply.unauthorized("Invalid credentials");
  }

  const isValid = await verifyPassword(user.password, password);

  if (!isValid) {
    return reply.unauthorized("Invalid credentials");
  }

  request.session.user = toSafeUser(user);
  await request.session.save();

  return reply.status(200).send({
    message: "Logged in",
    user: toSafeUser(user),
  });
};

export const logoutUser = async (request, reply) => {
  if (request.session) {
    await request.session.destroy();
  }

  return reply.status(204).send();
};
