import { UPLOADS_PUBLIC_PATH } from "#constants/paths.js";

const normalizePath = (path) => (path.startsWith("/") ? path : `/${path}`);

const normalizeBasePath = (path) =>
  path.endsWith("/") ? path.slice(0, -1) : path;

const combinePaths = (basePath, imagePath) =>
  imagePath.startsWith(basePath) ? imagePath : `${basePath}${imagePath}`;

export const buildImageUrl = (request, imagePath) => {
  if (!imagePath) {
    return null;
  }

  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  const protocol = request.protocol || "http";
  const host = request.host || request.hostname || request.headers?.host;

  if (!host) {
    return imagePath;
  }

  const normalizedImagePath = normalizePath(imagePath);
  const basePath = normalizeBasePath(UPLOADS_PUBLIC_PATH);
  const fullPath = combinePaths(basePath, normalizedImagePath);

  return `${protocol}://${host}${fullPath}`;
};
