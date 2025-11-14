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

  /* 文件名区域（固定宽度 650px，使按钮对齐在“蓝框”区域） */
  .left {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 0 0 650px;   /* ⭐ 文件名区域固定宽度 */
    min-width: 0;      /* 允许内部出现省略号 */
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

  /* Lightbox 整体遮罩层 */
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

  .lightbox-content {
    max-width: 90%;
    max-height: 90%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .lightbox-main {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  #lightbox-img {
    max-width: 80vw;
    max-height: 70vh;
    border-radius: 6px;
    box-shadow: 0 0 20px rgba(0,0,0,0.5);
    background: #222;
  }

  .lb-nav {
    background: rgba(255,255,255,0.85);
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    cursor: pointer;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
  }

  .lb-nav:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .lightbox-footer {
    width: 100%;
    background: rgba(0,0,0,0.65);
    padding: 8px 12px;
    border-radius: 6px;
    color: #fff;
    font-size: 0.85em;
    box-sizing: border-box;
  }

  .lightbox-url-text {
    margin-bottom: 4px;
    word-break: break-all;
  }

  .lightbox-url-actions {
    display: flex;
    gap: 8px;
  }

  #lightbox-url-input {
    flex: 1;
    font-size: 0.85em;
    padding: 4px 6px;
    border-radius: 4px;
    border: 1px solid #444;
    background: #111;
    color: #fff;
  }

  .breadcrumb {
    font-size: 1em;
    margin-bottom: 10px;
  }

  .file-name {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
EOF

  # ------------------------ JavaScript ------------------------
  cat >> "$INDEX" <<EOF
<script>
let imageList = [];   // 每个元素: { src, fullUrl }
let currentIndex = -1;

function openLightbox(index) {
  const lb = document.getElementById("lightbox");
  const img = document.getElementById("lightbox-img");

  if (!imageList.length || index < 0 || index >= imageList.length) return;

  currentIndex = index;
  const item = imageList[index];

  img.src = item.src;

  // 更新左右按钮可用状态
  const prevBtn = document.getElementById("lb-prev");
  const nextBtn = document.getElementById("lb-next");
  if (prevBtn) prevBtn.disabled = (index <= 0);
  if (nextBtn) nextBtn.disabled = (index >= imageList.length - 1);

  lb.style.display = "flex";
}

function closeLightbox() {
  const lb = document.getElementById("lightbox");
  if (lb) lb.style.display = "none";
}

function showPrev() {
  if (currentIndex > 0) {
    openLightbox(currentIndex - 1);
  }
}

function showNext() {
  if (currentIndex >= 0 && currentIndex < imageList.length - 1) {
    openLightbox(currentIndex + 1);
  }
}

// 列表里的“复制url”按钮：传入的是相对路径 url_path
function copyPath(src) {
  const fullUrl = "$BASE_URL/" + src.replace(/^\\.\//, "");
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(fullUrl);
  } else {
    const temp = document.createElement("input");
    temp.value = fullUrl;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    document.body.removeChild(temp);
  }
}

// Lightbox 底部区域的“复制url”
function copyCurrentUrl() {
  const input = document.getElementById("lightbox-url-input");
  if (!input) return;
  input.select();
  input.setSelectionRange(0, 99999);

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(input.value);
  } else {
    document.execCommand("copy");
  }
}

document.addEventListener("keydown", function(e) {
  if (e.key === "Escape") {
    closeLightbox();
  } else if (e.key === "ArrowLeft") {
    showPrev();
  } else if (e.key === "ArrowRight") {
    showNext();
  }
});
</script>
EOF

  echo "</head><body>" >> "$INDEX"

  # ------------------------ Lightbox HTML ------------------------
  cat >> "$INDEX" <<'EOF'
<div id="lightbox" onclick="if (event.target === this) closeLightbox()">
  <div class="lightbox-content" onclick="event.stopPropagation()">
    <div class="lightbox-main">
      <button id="lb-prev" class="lb-nav" onclick="event.stopPropagation(); showPrev()">&#8592;</button>
      <img id="lightbox-img" src="">
      <button id="lb-next" class="lb-nav" onclick="event.stopPropagation(); showNext()">&#8594;</button>
    </div>
    <div class="lightbox-footer">
      <div class="lightbox-url-actions">
        <input id="lightbox-url-input" readonly>
        <button class="copy-btn" onclick="copyCurrentUrl()">复制url</button>
      </div>
    </div>
  </div>
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
  img_index=0
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
                <span class=\"preview-btn\" onclick=\"openLightbox($img_index)\">预览</span>
                <span class=\"copy-btn\" onclick=\"copyPath('$url_path')\">复制url</span>
              </span>
            </li>" >> "$INDEX"

      # 为当前图片写入 imageList[$img_index]
      echo "<script>imageList[$img_index] = {src: \"$base\", fullUrl: \"$BASE_URL/$url_path\"};</script>" >> "$INDEX"

      img_index=$((img_index + 1))

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
