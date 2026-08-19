#!/usr/bin/env bash
# Assembles the deployable site into dist/.
# Netlify runs this on every push; nothing here needs installing.
#
# Why a build step on a site that has none: it guarantees only these files
# ship. The repo root also holds working notes and, historically, 17MB of
# backup snapshots containing superseded copy. Copying an explicit list is the
# difference between publishing the site and publishing the workshop.
set -uo pipefail

# Best-effort clean. Netlify starts from a fresh checkout so this is usually a
# no-op; it's tolerant of failure because some local mounts disallow deletes.
rm -rf dist 2>/dev/null || true
mkdir -p dist/assets

cp -f index.html styles.css app.js ui.js og-image.jpg _redirects dist/
cp -f assets/* dist/assets/

# Preview build: keep it out of search results. Delete this block at launch.
cat > dist/robots.txt <<'ROBOTS'
User-agent: *
Disallow: /
ROBOTS

# Fail loudly if anything essential is missing, rather than deploying a broken site.
for f in index.html styles.css app.js ui.js; do
  [ -s "dist/$f" ] || { echo "BUILD FAILED: dist/$f missing or empty"; exit 1; }
done

echo "built dist/ — $(du -sh dist | cut -f1), $(find dist -type f | wc -l) files"
