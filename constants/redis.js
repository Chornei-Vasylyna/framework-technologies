export const REDIS_TTL_SECONDS = {
  coursesReference: 120,
  studentsCache: 60 * 60 * 24,
};

export const REDIS_KEYS = {
  coursesReference: "courses:reference",
  studentsCacheIndex: "students:v2:keys",
  studentsCacheKey: ({ page, limit }) =>
    `students:v2:page:${page}:limit:${limit}`,
};
