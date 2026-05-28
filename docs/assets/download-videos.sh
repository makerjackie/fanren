#!/usr/bin/env bash
# Batch download all candidate videos from fanren-video-source-index.json
# Requires: yutto (pip install yutto)
#
# Usage:
#   First time:   yutto auth login   # Log in to Bilibili for higher quality
#   Then run:     bash download-videos.sh
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
INDEX_FILE="$SCRIPT_DIR/fanren-video-source-index.json"
VIDEO_ROOT="$PROJECT_DIR/public/media/videos/candidates"

mkdir -p "$VIDEO_ROOT"

# Check if yutto is authenticated
if ! yutto auth info --no-color 2>/dev/null | grep -q "已登录"; then
  echo "⚠  Not logged in to Bilibili — videos will be limited to 480P max."
  echo "   For higher quality, run: yutto auth login"
  echo "   Then re-run this script."
  echo ""
  read -rp "Continue without login? (y/N) " choice
  if [[ ! "$choice" =~ ^[Yy]$ ]]; then
    echo "Aborted. Run 'yutto auth login' first."
    exit 1
  fi
fi

# Count items and process
python3 -c "
import json, os, subprocess, sys

data = json.load(open('$INDEX_FILE'))
items = data['items']

for item in items:
    vid  = item['id']
    title = item['title']
    url  = item['source_url']
    bvid = item['bvid']
    out  = f'{VIDEO_ROOT}/{vid}'
    os.makedirs(out, exist_ok=True)

    print(f'\\n{\"=\"*48}')
    print(f'Downloading: {title}')
    print(f'  BVID: {bvid}')
    print(f'  URL:  {url}')
    print(f'  Dest: {out}/')
    print(f'{\"=\"*48}')

    # Download via yutto
    result = subprocess.run([
        'yutto', 'download', url,
        '-d', out,
        '--video-quality', '120',  # 4K
        '--no-danmaku',
        '--overwrite',
        '--no-color',
        '--no-progress',
    ], capture_output=True, text=True)

    if result.returncode != 0:
        print(f'  ✗ yutto error: {result.stderr[:200]}')
        continue

    # Find the downloaded mp4
    import glob
    mp4s = glob.glob(os.path.join(out, '*.mp4'))
    if not mp4s:
        print(f'  ✗ No mp4 found in {out}')
        print(f'    yutto stdout: {result.stdout[-200:]}')
        continue

    # Rename to hero.mp4 (keep original as alias)
    src = mp4s[0]
    dst = os.path.join(out, 'hero.mp4')
    if os.path.basename(src) != 'hero.mp4':
        if os.path.exists(dst):
            os.remove(dst)
        os.rename(src, dst)

    size_mb = os.path.getsize(dst) / (1024*1024)
    print(f'  ✓ Saved: hero.mp4 ({size_mb:.1f} MB)')
" 2>&1
