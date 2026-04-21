import {
  buildSimilarity,
  getRepoContributors,
  getUserRepos,
} from "#utils/github-analytics.util.js";

export const getSharedReposV1 = async (request, reply) => {
  try {
    const token = request.server.config.GITHUB_TOKEN;
    const { repo } = request.query;

    const [owner, repoName] = repo.split("/");

    const contributors = await getRepoContributors(owner, repoName, token);

    const repoLists = [];
    const batchSize = 5;
    let processed = 0;

    for (let i = 0; i < contributors.length; i += batchSize) {
      const batch = contributors.slice(i, i + batchSize);

      const batchResults = await Promise.all(
        batch.map((login) => getUserRepos(login, token)),
      );

      repoLists.push(...batchResults);
      processed += batch.length;
    }

    const result = buildSimilarity(`${owner}/${repoName}`, repoLists);

    return reply.send({
      version: "v1",
      inputRepository: repo,
      strategy: "REST contributors graph",
      totalContributors: contributors.length,
      processedContributors: processed,
      similarRepositories: result,
    });
  } catch (e) {
    return reply.status(500).send({ error: e.message });
  }
};
