const GITHUB = "https://api.github.com";
const GITHUB_GRAPHQL = "https://api.github.com/graphql";

const createAsyncTtlCache = ({ ttlMs, maxEntries }) => {
  const cache = new Map();

  const getEntry = (key) => {
    const entry = cache.get(key);
    if (!entry) return null;

    if (entry.expiresAt <= Date.now()) {
      cache.delete(key);
      return null;
    }

    return entry;
  };

  const trim = () => {
    while (cache.size > maxEntries) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }
  };

  const get = (key) => {
    const entry = getEntry(key);
    if (!entry) return null;
    return entry.value ?? entry.promise ?? null;
  };

  const set = (key, value) => {
    cache.set(key, { value, expiresAt: Date.now() + ttlMs });
    trim();
    return value;
  };

  const getOrSet = async (key, factory) => {
    const existing = getEntry(key);
    if (existing) return existing.value ?? existing.promise;

    const promise = Promise.resolve().then(factory);
    cache.set(key, { promise, expiresAt: Date.now() + ttlMs });
    trim();

    try {
      const value = await promise;
      cache.set(key, { value, expiresAt: Date.now() + ttlMs });
      trim();
      return value;
    } catch (e) {
      cache.delete(key);
      throw e;
    }
  };

  return { get, set, getOrSet };
};

const contributorsCache = createAsyncTtlCache({
  ttlMs: 2 * 60_000,
  maxEntries: 200,
});

const userReposCache = createAsyncTtlCache({
  ttlMs: 10 * 60_000,
  maxEntries: 2_000,
});

const headers = (token) => {
  const result = {
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    "User-Agent": "github-academic-graph",
  };

  if (token) {
    result.Authorization = `Bearer ${token}`;
  }

  return result;
};

const safeFetch = async (url, options = {}) => {
  const timeoutMs = 15_000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return res?.ok ? res : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
};

const safePostGraphQL = async ({ query, variables, token }) => {
  const res = await safeFetch(GITHUB_GRAPHQL, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({ query, variables }),
  });

  if (!res) return null;

  const json = await res.json();
  if (!json || json.errors) return null;

  return json.data ?? null;
};

const buildSimilarity = (sourceRepo, repoLists) => {
  const map = new Map();

  for (const repos of repoLists) {
    if (!Array.isArray(repos)) continue;

    for (const repo of repos) {
      if (!repo?.fullName || !repo?.contributor) continue;
      if (repo.fullName === sourceRepo) continue;

      if (!map.has(repo.fullName)) {
        map.set(repo.fullName, {
          repo,
          users: new Set(),
        });
      }

      map.get(repo.fullName).users.add(repo.contributor);
    }
  }

  return [...map.entries()]
    .map(([name, data]) => ({
      fullName: name,
      url: data.repo.url,
      language: data.repo.language ?? null,
      sharedContributors: data.users.size,
    }))
    .filter((r) => r.sharedContributors > 0)
    .sort((a, b) => b.sharedContributors - a.sharedContributors)
    .slice(0, 5)
    .map((r, i) => ({
      rank: i + 1,
      ...r,
    }));
};

const getRepoContributors = async (owner, repo, token) => {
  const key = `repoContrib:${owner}/${repo}`;

  return contributorsCache.getOrSet(key, async () => {
    let page = 1;
    const result = [];

    while (true) {
      const res = await safeFetch(
        `${GITHUB}/repos/${owner}/${repo}/contributors?per_page=100&page=${page}`,
        { headers: headers(token) },
      );

      if (!res) break;

      const data = await res.json();
      if (!data.length) break;

      result.push(...data);
      page++;
    }

    return result.map((u) => u.login).filter(Boolean);
  });
};

const getUserRepos = async (login, token) => {
  const key = `userRepos:${login}`;

  return userReposCache.getOrSet(key, async () => {
    const res = await safeFetch(
      `${GITHUB}/users/${login}/repos?per_page=100&type=all`,
      { headers: headers(token) },
    );

    if (!res) return [];

    const data = await res.json();

    return data.map((r) => ({
      fullName: r.full_name,
      url: r.html_url,
      language: r.language,
      contributor: login,
    }));
  });
};

const getUserReposGraphQLBatch = async (logins, token) => {
  if (!token) return null;
  if (!Array.isArray(logins) || logins.length === 0) return [];

  const cached = new Map();
  const missing = [];

  for (const login of logins) {
    const key = `userRepos:${login}`;
    const value = userReposCache.get(key);
    if (Array.isArray(value)) cached.set(login, value);
    else missing.push(login);
  }

  if (missing.length === 0) {
    return logins.map((login) => cached.get(login) ?? []);
  }

  const fields = `repositories(first: 100, privacy: PUBLIC, orderBy: {field: UPDATED_AT, direction: DESC}) {\n\t\tnodes {\n\t\t\tnameWithOwner\n\t\t\turl\n\t\t\tprimaryLanguage { name }\n\t\t\tisFork\n\t\t}\n\t}`;

  const query = `query {\n${missing
    .map((login, i) => {
      const safeLogin = String(login)
        .replaceAll("\\", "\\\\")
        .replaceAll('"', '\\"');
      return `u${i}: user(login: "${safeLogin}") {\n\t${fields}\n}`;
    })
    .join("\n")}\n}`;

  const data = await safePostGraphQL({ query, variables: {}, token });
  if (!data) return null;

  for (let i = 0; i < missing.length; i++) {
    const login = missing[i];
    const user = data?.[`u${i}`];
    const repos = user?.repositories?.nodes;
    const parsed = Array.isArray(repos)
      ? repos
          .filter((r) => r?.nameWithOwner && !r?.isFork)
          .map((r) => ({
            fullName: r.nameWithOwner,
            url: r.url ?? null,
            language: r.primaryLanguage?.name ?? null,
            contributor: login,
          }))
      : [];

    userReposCache.set(`userRepos:${login}`, parsed);
    cached.set(login, parsed);
  }

  return logins.map((login) => cached.get(login) ?? []);
};

export {
  GITHUB,
  GITHUB_GRAPHQL,
  headers,
  safeFetch,
  buildSimilarity,
  getRepoContributors,
  getUserRepos,
  getUserReposGraphQLBatch,
};
