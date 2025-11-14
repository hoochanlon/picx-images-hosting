#!/usr/bin/env bash

echo "Generating index.html..."

BASE_URL="https://hoochanlon.github.io/picx-images-hosting"

# 排除 .git/ .github/ .deploy 文件夹和文件 .settings 文件
find . -type d \
  -not -path '*/.git/*' \
  -not -path '*/.github/*' \
  -not -path '*/.deploy' \
  -not -path '*/.settings' | while read -r DIR; do
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

  .left {
    flex: 0 0 650px;
    display: flex;
    gap: 6px;
    min-width: 0;
  }

  .right {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
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
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .loc {
    font-size: 1em;
    color: #333;
  }

  .container { margin-top: 110px; }

  .image::before { content: "🖼️ "; }
  .file::before { content: "📄 "; }
  .folder::before { content: "📁 "; }

  .preview-btn, .copy-btn {
    padding: 2px 6px;
    background: #eee;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8em;
  }

  .preview-btn:hover, .copy-btn:hover { background: #ddd; }

  /* Lightbox 遮罩 */
  #lightbox {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.75);
    justify-content: center;
    align-items: center;
    z-index: 2000;
  }

  .lightbox-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 90%;
    max-height: 90%;
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
    background: #222;
  }

  .lb-nav {
    width: 32px; height: 32px;
    border-radius: 50%;
    background: #fff;
    cursor: pointer;
  }

  .lightbox-footer {
    display: flex;
    justify-content: space-between;  /* 两端对齐 */
    background: rgba(0,0,0,0.65);
    padding: 8px;
    border-radius: 6px;
    color: #fff;
  }

  #lightbox-url-input {
    width: 80%;  /* 输入框占80%宽度 */
    padding: 5px;
    background: #111;
    color: #fff;
    border: 1px solid #333;
    border-radius: 4px;
  }

  .copy-btn {
    padding: 5px 10px;
    background: #eee;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8em;
    margin-left: 10px; /* 左边间距 */
  }

  .copy-btn:hover {
    background: #ddd;
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

  # ------------------------ JS ------------------------
  cat >> "$INDEX" <<EOF
<script>
let imageList = [];
let currentIndex = -1;

function openLightbox(i){
  if(i<0 || i>=imageList.length) return;
  currentIndex = i;

  document.getElementById("lightbox-img").src = imageList[i].src;
  document.getElementById("lightbox-url-input").value = imageList[i].fullUrl;

  document.getElementById("lightbox").style.display = "flex";
}

function closeLightbox(){ document.getElementById("lightbox").style.display="none"; }

function showPrev(){ if(currentIndex>0) openLightbox(currentIndex-1); }
function showNext(){ if(currentIndex < imageList.length-1) openLightbox(currentIndex+1); }

function copyPath(p){
  const full = "$BASE_URL/" + p.replace(/^\\.\//,"");
  navigator.clipboard.writeText(full);
}

function copyCurrentUrl(){
  let input = document.getElementById("lightbox-url-input");
  navigator.clipboard.writeText(input.value);
}

document.addEventListener("keydown", e=>{
  if(e.key==="Escape") closeLightbox();
  if(e.key==="ArrowLeft") showPrev();
  if(e.key==="ArrowRight") showNext();
});
</script>
EOF

  echo "</head><body>" >> "$INDEX"

  # ------------------------ Lightbox HTML ------------------------
  cat >> "$INDEX" <<'EOF'
<div id="lightbox" onclick="if(event.target===this)closeLightbox()">
  <div class="lightbox-content" onclick="event.stopPropagation()">
    <div class="lightbox-main">
      <button class="lb-nav" onclick="showPrev()">←</button>
      <img id="lightbox-img">
      <button class="lb-nav" onclick="showNext()">→</button>
    </div>

    <div class="lightbox-footer">
      <input id="lightbox-url-input" readonly>
      <button class="copy-btn" onclick="copyCurrentUrl()">复制url</button>
    </div>
  </div>
</div>
EOF

  # ------------------------ Breadcrumb（放到 topbar 内） ------------------------
  REL_PATH="${DIR#./}"
  IFS='/' read -ra parts <<< "$REL_PATH"

  breadcrumb="<div class=\"loc\"><strong>📍 当前定位：</strong> <a href=\"$BASE_URL\">Home</a>"
  running=""
  for part in "${parts[@]}"; do
    [ -z "$part" ] && continue
    running="$running/$part"
    breadcrumb="$breadcrumb &gt; <a href=\"$BASE_URL$running/\">$part</a>"
  done
  breadcrumb="$breadcrumb</div>"

  # ------------------------ TOPBAR（含 breadcrumb） ------------------------
  echo "<div class=\"topbar\">" >> "$INDEX"
  echo "<div><strong>🗂 picx-images-hosting:</strong> <a href=\"$BASE_URL\">Home</a>" >> "$INDEX"
  if [ "$DIR" != "." ]; then
    echo " | <a href=\"../\">⬆ Go Up</a>" >> "$INDEX"
  fi
  echo "</div>" >> "$INDEX"

  echo "$breadcrumb" >> "$INDEX"
  echo "</div>" >> "$INDEX"

  # ------------------------ 内容区域 ------------------------
  echo "<div class=\"container\">" >> "$INDEX"
  echo "<h2>Index of $DIR</h2><ul>" >> "$INDEX"

  img_index=0
  find "$DIR" -maxdepth 1 -mindepth 1 | while read -r file; do
    base=$(basename "$file")
    [ "$base" = "index.html" ] && continue

    url_path="${REL_PATH}/${base}"
    url_path="${url_path#/}"

    name="${base}"
    (( ${#name} > 60 )) && name="${name:0:27}..."

    ext="${base##*.}"
    ext="${ext,,}"

    if [ -d "$file" ]; then
      echo "<li><span class=\"left folder\"><a href=\"$base/\">$name/</a></span></li>" >> "$INDEX"

    elif [[ "$ext" =~ ^(jpg|jpeg|png|gif|webp|svg)$ ]]; then
      echo "<li>
        <span class=\"left image\"><a href=\"$base\">$name</a></span>
        <span class=\"right\">
          <span class=\"preview-btn\" onclick=\"openLightbox($img_index)\">预览</span>
          <span class=\"copy-btn\" onclick=\"copyPath('$url_path')\">复制url</span>
        </span>
      </li>" >> "$INDEX"

      echo "<script>imageList[$img_index] = {src: \"$base\", fullUrl: \"$BASE_URL/$url_path\"};</script>" >> "$INDEX"
      img_index=$((img_index+1))

    else
      echo "<li><span class=\"left file\"><a href=\"$base\">$name</a></span></li>" >> "$INDEX"
    fi
  done

  echo "</ul></div></body></html>" >> "$INDEX"
done

echo "index.html generation complete."
