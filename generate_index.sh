#!/usr/bin/env bash

echo "Generating index.html..."

find . -type d -not -path '*/.git/*' -exec bash -c '
  DIR="{}"
  INDEX="$DIR/index.html"

  echo "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\">" > "$INDEX"
  echo "<title>Index of $DIR</title>" >> "$INDEX"

  echo "<style>
    body { font-family: Arial, sans-serif; line-height: 1.7; padding: 0 20px; }
    ul { list-style: none; padding-left: 0; }
    li { margin: 10px 0; }

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
    .file::before   { content: \"📄 \"; }
    .folder::before { content: \"📁 \"; }
    .image::before  { content: \"🖼 \"; }

    /* 图片预览 */
    .preview {
      margin-left: 10px;
      vertical-align: middle;
    }
    .preview img {
      width: 120px;
      height: auto;
      border: 1px solid #ddd;
      border-radius: 5px;
    }
  </style>" >> "$INDEX"

  echo "</head><body>" >> "$INDEX"

  echo "<div class=\"topbar\">" >> "$INDEX"
  echo "<strong>📂 Index Navigation:</strong> " >> "$INDEX"
  echo "<a href=\"./index.html\">Home</a>" >> "$INDEX"

  if [ \"$DIR\" != \".\" ]; then
    echo " | <a href=\"../\">⬆ Go Up</a>" >> "$INDEX"
  fi

  echo "</div>" >> "$INDEX"

  echo "<div class=\"container\">" >> "$INDEX"
  echo "<h2>Index of $DIR</h2>" >> "$INDEX"
  echo "<ul>" >> "$INDEX"

  for file in $DIR/*; do
    base=$(basename "$file")
    [ "$base" = "index.html" ] && continue

    # 识别图片扩展名
    ext="${base##*.}"
    ext_lower=$(echo "$ext" | tr A-Z a-z)

    case "$ext_lower" in
      jpg|jpeg|png|gif|webp|svg)
        # 图片文件
        echo "<li class=\"image\"><a href=\"$base\">$base</a> <span class=\"preview\"><img src=\"$base\"></span></li>" >> "$INDEX"
        ;;
      *)
        # 判断是否文件夹
        if [ -d "$file" ]; then
          echo "<li class=\"folder\"><a href=\"$base/\">$base/</a></li>" >> "$INDEX"
        elif [ -f "$file" ]; then
          echo "<li class=\"file\"><a href=\"$base\">$base</a></li>" >> "$INDEX"
        fi
        ;;
    esac
  done

  echo "</ul>" >> "$INDEX"
  echo "</div></body></html>" >> "$INDEX"

' \;

echo "index.html generation complete."
