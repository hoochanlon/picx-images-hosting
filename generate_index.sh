#!/usr/bin/env bash

echo "Generating index.html..."

BASE_URL="https://hoochanlon.github.io/picx-images-hosting"

find . -type d -not -path '*/.git/*' | while read -r DIR; do
  INDEX="$DIR/index.html"

  echo "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\">" > "$INDEX"
  echo "<title>Index of $DIR</title>" >> "$INDEX"

  # ------------------------ CSS ------------------------
  cat >> "$INDEX" <<'EOF'
<style>
  body { font-family: Arial, sans-serif; line-height: 1.7; padding: 0 20px; }
  ul { list-style: none; padding-left: 0; }

  li {
    margin: 6px 0;
    display: flex;
    align-items: center;
  }

  /* 文件名区域（固定宽度 650px，使按钮对齐在蓝框区域） */
  .left {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 0 0 650px;   /* ⭐ 文件名区域固定宽度 */
    min-width: 0;      /* 允许缩略号 */
  }

  .right {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;    /* 按钮区不被压缩 */
    margin-left: 12px; /* 文件名与按钮间距 */
  }

  a { color: #0366d6; text-decoration: none; }
  a:hover { text-decoration: underline; }

  .topbar {
    position: fixed;
    top: 0; left: 0;
    width: 100%;
    background: #f7f7f7;
    border-bottom: 1px solid #ccc;
    padding: 12px 20px;
    z-index: 1000;
  }

  .container { margin-top: 90px; }

  .file::before   { content: "📄 "; }
  .folder::before { content: "📁 "; }
  .image::before  { content: "🖼 "; }

  .preview-btn, .copy-btn {
    padding: 2px 6px;
    background: #eee;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8em;
  }
  .preview-btn:hover, .copy-btn:hover { background: #ddd; }

  #lightbox {
    display: none;
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.75);
    justify-content: center;
    align-items: center;
    z-index: 2000;
  }

  #lightbox img {
    max-width: 90%;
    max-height: 90%;
    border-radius: 6px;
    box-shadow: 0 0 20px rgba(0,0,0,0.5);
  }

  .file-name {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .breadcrumb {
    font-size: 1em;
    margin-bottom: 10px;
  }
</style>
EOF

  # ------------------------ JavaScript ------------------------
  cat >> "$INDEX" <<EOF
<script>
function showImage(src) {
  const lb = document.getElementById("lightbox");
  const img = document.getElementById("lightbox-img");
  img.src = src;
  lb.style.display = "flex";
}

function hideLightbox() {
  document.getElementById("lightbox").style.display = "none";
}

function copyPath(src) {
  const fullUrl = "$BASE_URL/" + src.replace(/^\\.\//, "");
  navigator.clipboard.writeText(fullUrl);
}
</script>
EOF

  echo "</head><body>" >> "$INDEX"

  # Lightbox
  cat >> "$INDEX" <<'EOF'
<div id="lightbox" onclick="hideLightbox()">
  <img id="lightbox-img" src="">
</div>
EOF

  # ------------------------ 面包屑导航 ------------------------
  REL_PATH="${DIR#./}"
  IFS='/' read -ra parts <<< "$REL_PATH"

  breadcrumb_html="<div class=\"breadcrumb\"><strong>📂 当前定位：</strong> <a href=\"$BASE_URL\">Home</a>"

  running_path=""
  for part in "${parts[@]}"; do
    [ -z "$part" ] && continue
    running_path="$running_path/$part"
    breadcrumb_html="$breadcrumb_html &gt; <a href=\"$BASE_URL$running_path/\">$part</a>"
  done

  breadcrumb_html="$breadcrumb_html</div>"

  # 顶部导航
  echo "<div class=\"topbar\"><strong>📂 Index Navigation:</strong> <a href=\"$BASE_URL\">Home</a>" >> "$INDEX"
  if [ "$DIR" != "." ]; then
    echo " | <a href=\"../\">⬆ Go Up</a>" >> "$INDEX"
  fi
  echo "</div>" >> "$INDEX"

  echo "<div class=\"container\">" >> "$INDEX"
  echo "$breadcrumb_html" >> "$INDEX"
  echo "<h2>Index of $DIR</h2>" >> "$INDEX"
  echo "<ul>" >> "$INDEX"

  # ------------------------ 文件列表 ------------------------
  find "$DIR" -maxdepth 1 -mindepth 1 | while read -r file; do
    base=$(basename "$file")
    [ "$base" = "index.html" ] && continue

    url_path="$REL_PATH/$base"
    url_path="${url_path#/}"

    # 超长文件名 → 缩略
    name_len=${#base}
    if (( name_len > 30 )); then
      short_name="${base:0:27}..."
    else
      short_name="$base"
    fi

    ext=$(echo "${base##*.}" | tr 'A-Z' 'a-z')

    if [ -d "$file" ]; then
      echo "<li>
              <span class=\"left folder\">
                <a href=\"$base/\" class=\"file-name\">${short_name}/</a>
              </span>
              <span class=\"right\"></span>
            </li>" >> "$INDEX"

    elif [[ "$ext" =~ ^(jpg|jpeg|png|gif|webp|svg)$ ]]; then
      echo "<li>
              <span class=\"left image\">
                <a href=\"$base\" class=\"file-name\">$short_name</a>
              </span>
              <span class=\"right\">
                <span class=\"preview-btn\" onclick=\"showImage('$base')\">预览</span>
                <span class=\"copy-btn\" onclick=\"copyPath('$url_path')\">复制url</span>
              </span>
            </li>" >> "$INDEX"

    else
      echo "<li>
              <span class=\"left file\">
                <a href=\"$base\" class=\"file-name\">$short_name</a>
              </span>
              <span class=\"right\"></span>
            </li>" >> "$INDEX"
    fi
  done

  echo "</ul></div></body></html>" >> "$INDEX"

done

echo "index.html generation complete."
