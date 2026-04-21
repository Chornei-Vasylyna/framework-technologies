import { getSharedReposV1 } from "#controllers/github-analytics-v1.controller.js";
import { getSharedReposV2 } from "#controllers/github-analytics-v2.controller.js";
import {
  githubErrorSchema,
  githubSharedReposQuerySchema,
  githubSharedReposResponseSchema,
} from "#schemas/github.schema.js";

export const githubRoutesV1 = async (fastify) => {
  // V1: REST API only
  fastify.get(
    "/github/shared-repos",
    {
      schema: {
        tags: ["GitHub Analytics"],
        summary: "Top-5 repositories by shared contributors (REST Search v1)",
        querystring: githubSharedReposQuerySchema,
        response: {
          200: githubSharedReposResponseSchema,
          400: githubErrorSchema,
          404: githubErrorSchema,
          500: githubErrorSchema,
        },
      },
    },
    getSharedReposV1,
  );
};

export const githubRoutesV2 = async (fastify) => {
  // V2: REST API + GraphQL
  fastify.get(
    "/github/shared-repos",
    {
      schema: {
        tags: ["GitHub Analytics"],
        summary:
          "Top-5 repositories by shared contributors (GraphQL Search v2)",
        querystring: githubSharedReposQuerySchema,
        response: {
          200: githubSharedReposResponseSchema,
          400: githubErrorSchema,
          404: githubErrorSchema,
          500: githubErrorSchema,
        },
      },
    },
    getSharedReposV2,
  );
};
