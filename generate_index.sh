#!/bin/bash

# 为每个目录生成 index.html
find . -type d -not -path '*/.git/*' -exec bash -c '
  DIR="{}"
  INDEX="$DIR/index.html"

  # 如果目录不为空
  if [ "$(ls -A "$DIR")" ]; then
    echo "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\"><title>Index of $DIR</title>" > "$INDEX"
    echo "<style>body { font-family: Arial, sans-serif; }</style>" >> "$INDEX"
    echo "</head><body>" >> "$INDEX"

    # 固定导航栏
    echo "<div style=\"position: fixed; top: 0; left: 0; width: 100%; background-color: #f4f4f4; padding: 10px; border-bottom: 1px solid #ccc; z-index: 100;\">" >> "$INDEX"
    echo "<a href=\"../\">.. (Go Up)</a>" >> "$INDEX"
    echo "</div>" >> "$INDEX"

    # 页面内容
    echo "<div style=\"margin-top: 60px;\">" >> "$INDEX"
    echo "<h1>Index of $DIR</h1>" >> "$INDEX"
    echo "<ul>" >> "$INDEX"

    # 列出目录下的文件（排除 index.html 自己）
    for file in "$DIR"/*; do
      base=$(basename "$file")
      if [ -f "$file" ] && [ "$base" != "index.html" ]; then
        echo "<li><a href=\"/$DIR/$base\">$base</a></li>" >> "$INDEX"  # 绝对路径
      elif [ -d "$file" ]; then
        echo "<li><a href=\"/$DIR/$base/\">$base/</a></li>" >> "$INDEX"  # 绝对路径
      fi
    done

    echo "</ul>" >> "$INDEX"

    # 底部显示 index.html 和 Go Up
    echo "<hr>" >> "$INDEX"
    echo "<div style=\"margin-top:20px;\">" >> "$INDEX"
    echo "<a href=\"index.html\">index.html</a><br>" >> "$INDEX"
    echo "<a href=\"../\">.. (Go Up)</a>" >> "$INDEX"
    echo "</div></body></html>" >> "$INDEX"
  fi
' \;
