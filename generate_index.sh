#!/usr/bin/env bash

# 根 URL（用于复制完整 URL）
BASE_URL="https://hoochanlon.github.io/picx-images-hosting"

echo "Generating index.html..."

find . -type d -not -path '*/.git/*' -exec bash -c '
  DIR="{}"
  INDEX="$DIR/index.html"

  REL_PATH="${DIR#./}"

  echo "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\">" > "$INDEX"
  echo "<title>Index of $REL_PATH</title>" >> "$INDEX"

  echo "<style>
    body { font-family: Arial, sans-serif; padding: 10px 20px; line-height: 1.6; }

    a { color: #0366d6; text-decoration: none; }
    a:hover { text-decoration: underline; }

    ul { list-style: none; padding-left: 0; }
    .item-row { display: flex; align-items: center; margin-bottom: 4px; }

    .filename {
      display: inline-block;
      max-width: 240px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-right: 8px;
    }

    .btn {
      margin-left: 6px;
      padding: 2px 6px;
      font-size: 12px;
      cursor: pointer;
      border: 1px solid #aaa;
      border-radius: 4px;
      background: #eee;
    }
    .btn:hover { background: #ddd; }

    /* 预览灯箱 */
    #lightbox {
      display: none;
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.6);
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }
    #lightbox img {
      max-width: 90%;
      max-height: 90%;
      border: 6px solid white;
      border-radius: 6px;
    }

  </style>" >> "$INDEX"

  echo "</head><body>" >> "$INDEX"

  # 导航栏
  echo "<div style=\"margin-bottom: 16px;\"><strong>📁 Index Navigation:</strong> 
        <a href=\"$BASE_URL\">Home</a>" >> "$INDEX"

  if [ \"$DIR\" != \".\" ]; then
    echo " | <a href=\"../\">⬆ Go Up</a>" >> "$INDEX"
  fi

  echo "</div>" >> "$INDEX"

  echo "<h2>Index of ./$REL_PATH</h2>" >> "$INDEX"
  echo "<ul>" >> "$INDEX"

  for file in "$DIR"/*; do
    base=$(basename "$file")
    [ "$base" = "index.html" ] && continue

    url_path="$REL_PATH/$base"
    url_path="${url_path#/}"   # 去除可能的开头斜杠

    echo "<li class=\"item-row\">" >> "$INDEX"

    # 图标
    if [[ -d "$file" ]]; then
      echo "📁" >> "$INDEX"
    else
      echo "🖼️" >> "$INDEX"
    fi

    # 文件名
    echo "<a class=\"filename\" href=\"$base\">$base</a>" >> "$INDEX"

    # 若为图片 → 添加预览按钮
    case "$base" in
      *.png|*.jpg|*.jpeg|*.webp|*.gif)
        echo "<button class=\"btn\" onclick=\"showImage('$base')\">预览</button>" >> "$INDEX"
        ;;
    esac

    # 复制 URL 按钮
    echo "<button class=\"btn\" onclick=\"copyPath('$url_path')\">复制url</button>" >> "$INDEX"

    echo "</li>" >> "$INDEX"
  done

  echo "</ul>" >> "$INDEX"

  # 灯箱与 JS
  cat >> "$INDEX" <<EOF
<div id="lightbox" onclick="hideLightbox()">
  <img id="lightbox-img">
</div>

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

function copyPath(path) {
  const fullUrl = "$BASE_URL/" + path.replace(/^\\//, "");
  navigator.clipboard.writeText(fullUrl);
}
</script>
EOF

  echo "</body></html>" >> "$INDEX"

' \;

echo "index.html generation complete."
