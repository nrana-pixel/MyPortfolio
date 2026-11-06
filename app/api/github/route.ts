import { unstable_cache } from 'next/cache';

const GH_USER = 'nrana-pixel';
const GH_API = `https://api.github.com/users/${GH_USER}`;
const CONTRIB_API = `https://github-contributions-api.jogruber.de/v4/${GH_USER}?y=last`;
const REFRESH_SECONDS = 28800;

async function getJson(url: string, headers?: HeadersInit) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${url} responded ${res.status}`);
  return res.json();
}

const loadGitHub = unstable_cache(
  async () => {
    const token = process.env.GITHUB_TOKEN;
    const ghHeaders: HeadersInit = {
      Accept: 'application/vnd.github+json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const [profile, repos, events, contrib] = await Promise.allSettled([
      getJson(GH_API, ghHeaders),
      getJson(`${GH_API}/repos?per_page=100&sort=pushed`, ghHeaders),
      getJson(`${GH_API}/events/public?per_page=30`, ghHeaders),
      getJson(CONTRIB_API),
    ]);
    if (profile.status !== 'fulfilled' || !profile.value?.login) {
      throw new Error('GitHub profile unavailable');
    }
    if (repos.status !== 'fulfilled' || !Array.isArray(repos.value) || events.status !== 'fulfilled' || !Array.isArray(events.value)) {
      throw new Error('GitHub repos or events unavailable');
    }
    return {
      profile: profile.value,
      repos: repos.value,
      events: events.value,
      contrib: contrib.status === 'fulfilled' && Array.isArray(contrib.value?.contributions) ? contrib.value : null,
      fetchedAt: new Date().toISOString(),
    };
  },
  ['github-status', GH_USER],
  { revalidate: REFRESH_SECONDS },
);

export async function GET() {
  try {
    return Response.json(await loadGitHub());
  } catch {
    return Response.json({ error: 'GitHub data unavailable' }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }
}
