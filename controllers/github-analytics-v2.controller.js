import {
  buildSimilarity,
  getRepoContributors,
  getUserRepos,
  getUserReposGraphQLBatch,
} from "#utils/github-analytics.util.js";

export const getSharedReposV2 = async (request, reply) => {
  try {
    const token = request.server.config.GITHUB_TOKEN;
    const { repo } = request.query;

    const [owner, repoName] = repo.split("/");

    const contributors = await getRepoContributors(owner, repoName, token);

    const repoLists = [];
    const batchSize = 20;
    const concurrency = 3;
    let usedGraphQL = true;

    const batches = [];
    for (let i = 0; i < contributors.length; i += batchSize) {
      batches.push(contributors.slice(i, i + batchSize));
    }

    const batchResultsByIndex = new Array(batches.length);
    let nextIndex = 0;

    const worker = async () => {
      while (true) {
        const index = nextIndex;
        nextIndex++;
        if (index >= batches.length) return;

        const batch = batches[index];
        const graphQlResults = await getUserReposGraphQLBatch(batch, token);

        if (graphQlResults) {
          batchResultsByIndex[index] = graphQlResults;
          continue;
        }

        usedGraphQL = false;
        batchResultsByIndex[index] = await Promise.all(
          batch.map((login) => getUserRepos(login, token)),
        );
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(concurrency, batches.length) }, () =>
        worker(),
      ),
    );

    for (const batchResults of batchResultsByIndex) {
      if (Array.isArray(batchResults)) repoLists.push(...batchResults);
    }

    const processed = contributors.length;

    const result = buildSimilarity(`${owner}/${repoName}`, repoLists);

    return reply.send({
      version: "v2",
      inputRepository: repo,
      strategy: usedGraphQL
        ? "GraphQL user→repos (batch) + REST repo→contributors"
        : "REST user→repos (fallback) + REST repo→contributors",
      totalContributors: contributors.length,
      processedContributors: processed,
      totalAnalyzedContributors: processed,
      similarRepositories: result,
    });
  } catch (e) {
    return reply.status(500).send({ error: e.message });
  }
};
