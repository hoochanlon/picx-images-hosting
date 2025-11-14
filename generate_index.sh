#!/usr/bin/env bash

echo "Generating index.html..."

# ✔ 复制URL使用 GitHub Pages 作为主域名
BASE_URL="https://hoochanlon.github.io/picx-images-hosting"

find . -type d -not -path '*/.git/*' | while read -r DIR; do
  INDEX="$DIR/index.html"

  # HTML HEADER
  {
  echo "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\">"
  echo "<title>Index of $DIR</title>"
  } > "$INDEX"

# ----------------------------- CSS -----------------------------
cat >> "$INDEX" <<'EOF'
<style>
  body { font-family: Arial, sans-serif; line-height: 1.7; padding: 0 20px; }
  ul { list-style: none; padding-left: 0; }

  li {
    margin: 6px 0;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 12px;
  }

  .left { display: flex; align-items: center; gap: 6px; }
  .right { display: flex; align-items: center; gap: 6px; }

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

  .container { margin-top: 80px; }

  .file::before   { content: "📄 "; }
  .folder::before { content: "📁 "; }
  .image::before  { content: "🖼 "; }

  .preview-btn,
  .copy-btn {
    padding: 2px 6px;
    background: #eee;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8em;
  }
  .preview-btn:hover,
  .copy-btn:hover { background: #ddd; }

  /* Lightbox */
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

  /* 文件名自动省略 */
  .file-name {
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
EOF
# --------------------------- END CSS -----------------------------

# ----------------------------- JS（变量可展开） -----------------------------
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
# ---------------------------- END JS ------------------------------

# Lightbox HTML
cat >> "$INDEX" <<'EOF'
</head><body>
<div id="lightbox" onclick="hideLightbox()">
  <img id="lightbox-img" src="">
</div>
EOF

# ----------------------------- NAVIGATION -----------------------------
{
echo "<div class=\"topbar\">"
echo "<strong>📂 Index Navigation:</strong> "
echo "<a href=\"https://hoochanlon.github.io/picx-images-hosting\">Home</a>"
if [ "$DIR" != "." ]; then
  echo " | <a href=\"../\">⬆ Go Up</a>"
fi
echo "</div>"
} >> "$INDEX"

# ----------------------------- BODY -----------------------------
echo "<div class=\"container\"><h2>Index of $DIR</h2><ul>" >> "$INDEX"

# 当前目录路径
REL_PATH="${DIR#./}"

# 枚举文件与目录
find "$DIR" -maxdepth 1 -mindepth 1 | while read -r file; do
  base=$(basename "$file")
  [ "$base" = "index.html" ] && continue

  url_path="$REL_PATH/$base"
  url_path="${url_path#/}"  # 去掉首斜杠

  ext=$(echo "${base##*.}" | tr 'A-Z' 'a-z')

  if [ -d "$file" ]; then
    echo "<li>
            <span class=\"left folder\"><a href=\"$base/\" class=\"file-name\">$base/</a></span>
            <span class=\"right\"></span>
          </li>" >> "$INDEX"

  elif [[ "$ext" =~ ^(jpg|jpeg|png|gif|webp|svg)$ ]]; then
    echo "<li>
            <span class=\"left image\"><a href=\"$base\" class=\"file-name\">$base</a></span>
            <span class=\"right\">
              <span class=\"preview-btn\" onclick=\"showImage('$base')\">预览</span>
              <span class=\"copy-btn\" onclick=\"copyPath('$url_path')\">复制url</span>
            </span>
          </li>" >> "$INDEX"

  else
    echo "<li>
            <span class=\"left file\"><a href=\"$base\" class=\"file-name\">$base</a></span>
            <span class=\"right\">
              <span class=\"copy-btn\" onclick=\"copyPath('$url_path')\">复制url</span>
            </span>
          </li>" >> "$INDEX"
  fi
done

echo "</ul></div></body></html>" >> "$INDEX"

done

echo "index.html generation complete."
