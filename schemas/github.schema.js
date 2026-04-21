export const sharedRepositorySchema = {
  type: "object",
  properties: {
    rank: { type: "number" },
    fullName: { type: "string" },
    url: { type: ["string", "null"] },
    description: { type: ["string", "null"] },
    stars: { type: "number" },
    language: { type: ["string", "null"] },
    sharedContributors: { type: "number" },
    totalContributors: { type: ["number", "null"] },
  },
};

export const githubSharedReposQuerySchema = {
  type: "object",
  properties: {
    repo: {
      type: "string",
      description: "Repository in format owner/repo-name",
    },
  },
  required: ["repo"],
  additionalProperties: false,
};

export const githubSharedReposResponseSchema = {
  description: "Similar repositories found",
  type: "object",
  properties: {
    version: { type: "string" },
    inputRepository: { type: "string" },
    strategy: { type: "string" },
    totalContributors: { type: "number" },
    processedContributors: { type: "number" },
    similarRepositories: {
      type: "array",
      items: sharedRepositorySchema,
    },
  },
};

export const githubErrorSchema = {
  type: "object",
  properties: {
    error: { type: "string" },
    message: { type: "string" },
    details: { type: "string" },
    example: { type: "string" },
  },
};
