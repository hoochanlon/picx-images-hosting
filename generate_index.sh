#!/usr/bin/env bash

echo "Generating index.html..."

find . -type d -not -path '*/.git/*' | while read -r DIR; do
  INDEX="$DIR/index.html"

  echo "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\">" > "$INDEX"
  echo "<title>Index of $DIR</title>" >> "$INDEX"

  ###############################
  # CSS（紧凑列表 + 预览按钮 + Lightbox）
  ###############################
  cat >> "$INDEX" <<'EOF'
<style>
  body { font-family: Arial, sans-serif; line-height: 1.7; padding: 0 20px; }
  ul { list-style: none; padding-left: 0; }
  li { margin: 6px 0; display: flex; align-items: center; }

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

  .container { margin-top: 75px; }

  /* 图标 */
  .file::before   { content: "📄 "; }
  .folder::before { content: "📁 "; }
  .image::before  { content: "🖼️ "; }

  /* 预览按钮 */
  .preview-btn {
    margin-left: 10px;
    padding: 2px 6px;
    background: #eee;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8em;
  }
  .preview-btn:hover { background: #ddd; }

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
</style>
EOF

  ###############################
  # JS（Lightbox）
  ###############################
  cat >> "$INDEX" <<'EOF'
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
</script>
EOF

  echo "</head><body>" >> "$INDEX"

  ###############################
  # Lightbox HTML 容器
  ###############################
  cat >> "$INDEX" <<'EOF'
<div id="lightbox" onclick="hideLightbox()">
  <img id="lightbox-img" src="">
</div>
EOF

  ###############################
  # 顶部导航
  ###############################
  echo "<div class=\"topbar\">" >> "$INDEX"
  echo "<strong>📂 Index Navigation:</strong> " >> "$INDEX"
  echo "<a href=\"./index.html\">Home</a>" >> "$INDEX"

  if [ "$DIR" != "." ]; then
    echo " | <a href=\"../\">⬆ Go Up</a>" >> "$INDEX"
  fi

  echo "</div>" >> "$INDEX"

  ###############################
  # 文件列表
  ###############################
  echo "<div class=\"container\">" >> "$INDEX"
  echo "<h2>Index of $DIR</h2>" >> "$INDEX"
  echo "<ul>" >> "$INDEX"

  find "$DIR" -maxdepth 1 -mindepth 1 | while read -r file; do
    base=$(basename "$file")

    [ "$base" = "index.html" ] && continue

    ext=$(echo "${base##*.}" | tr 'A-Z' 'a-z')

    if [ -d "$file" ]; then
      echo "<li class=\"folder\"><a href=\"$base/\">$base/</a></li>" >> "$INDEX"

    elif [[ "$ext" =~ ^(jpg|jpeg|png|gif|webp|svg)$ ]]; then
      echo "<li class=\"image\"><a href=\"$base\">$base</a> <span class=\"preview-btn\" onclick=\"showImage('$base')\">预览</span></li>" >> "$INDEX"

    else
      echo "<li class=\"file\"><a href=\"$base\">$base</a></li>" >> "$INDEX"
    fi
  done

  echo "</ul>" >> "$INDEX"
  echo "</div></body></html>" >> "$INDEX"

done

echo "index.html generation complete."
