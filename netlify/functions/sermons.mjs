/**
 * Sermon feed — reads YouTube's public Atom feed for the church channel.
 *
 * WHY THIS EXISTS INSTEAD OF THE YOUTUBE DATA API
 * The Data API needs a key. A key in front-end code is public, has a daily
 * quota that can be exhausted by anyone who finds it, needs domain
 * restrictions configured in Google Cloud, and expires or gets revoked.
 * The Atom feed needs none of that — it is public, unauthenticated and
 * unmetered. The only reason the page cannot read it directly is that
 * YouTube sends no CORS header, so this function fetches it server-side and
 * hands back JSON from our own origin.
 *
 * No credentials. Nothing to leak, restrict, rotate or run out of.
 */

const CHANNEL_ID = 'UCzr3Q1kImqSqozM-E2g0lJQ';
const FEED = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

/* Atom is predictable enough to read without pulling in an XML dependency. */
function parseFeed(xml) {
  const entries = [];
  const blocks = xml.split('<entry>').slice(1);
  for (const block of blocks) {
    const pick = (tag) => {
      const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
      return m ? m[1].trim() : '';
    };
    const id = pick('yt:videoId');
    if (!id) continue;
    /* Only what cannot be derived. The thumbnail and watch URLs are both
       pure functions of the id, so sending them roughly tripled the payload
       for zero extra information. The client rebuilds them. */
    entries.push({ id, title: decode(pick('title')), published: pick('published').slice(0, 10) });
  }
  return entries;
}

function decode(s) {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'");
}

export default async function handler() {
  try {
    const res = await fetch(FEED, { headers: { 'User-Agent': 'yakimafoursquare.org' } });
    if (!res.ok) throw new Error(`feed responded ${res.status}`);

    /* The feed returns 15; the page renders at most 9. Sending the rest is
       bytes nobody reads. */
    const items = parseFeed(await res.text()).slice(0, 9);
    if (!items.length) throw new Error('feed parsed but contained no videos');

    return new Response(JSON.stringify({ items }), {
      headers: {
        'Content-Type': 'application/json',
        /* Cache at the edge for an hour. A church posts a few videos a week;
           there is no reason to hit YouTube on every page view. */
        'Cache-Control': 'public, max-age=0, s-maxage=3600'
      }
    });
  } catch (err) {
    /* Fail soft. The Sermons page is built to work with no data at all, so a
       broken feed shows the static archive link rather than an error. */
    return new Response(JSON.stringify({ items: [], error: String(err.message || err) }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });
  }
}
