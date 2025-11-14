
# 图片重命名

picx目前版本不支持完全哈希、完全时间戳将图片重命名。下载图片处理工具[exiftool](https://blog.csdn.net/m0_56182552/article/details/142977362)来进行批量重命名

```cmd
exiftool "-FileName<FileModifyDate" -d "%Y%m%d_%H%M%S%%-c.%%e" C:\Users\hooch\Downloads\*.png
```

* `-FileName<FileModifyDate` 以修改时间来生成时间戳
* `-FileName<CreateDate`：将文件名设置为照片的拍摄时间
* `-d "%Y%m%d_%H%M%S"`：设置重命名的时间格式（年月日_时分秒）
* `%%-c`：如果有重名的文件，会自动加上 -1、-2 等后缀
* `%%e`：保留原文件扩展名


或使用powershell

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

根据时间戳命名

```powershell
cd "C:\Users\hooch\Downloads"
$counter = 1
Get-ChildItem *.png | ForEach-Object {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $newName = "$timestamp" + "_$counter$($_.Extension)"  # 使用递增的计数器
    Rename-Item $_.FullName -NewName $newName
    $counter++  # 递增计数器
}
```

根据随机数命名

```
cd "C:\Users\hooch\Downloads"
Get-ChildItem *.png | ForEach-Object {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmm"
    $random = Get-Random -Minimum 100000 -Maximum 999999  # 生成6位随机数，并标记为 random
    $newName = "$timestamp" + "_rand_$random$($_.Extension)"  # 使用 rand 标记
    Rename-Item $_.FullName -NewName $newName
}
```

根据guid命名

```powershell
cd "C:\Users\hooch\Downloads"
Get-ChildItem *.png | ForEach-Object {
    $guid = [guid]::NewGuid().ToString().Substring(0, 13)  # 截取 GUID 的前 13 个字符
    $newName = "$guid$($_.Extension)"
    Rename-Item $_.FullName -NewName $newName
}
```

> [!CAUTION]
> * 批量重命名工具：https://rename.jgrass.xyz （`<date.modify:YYYY-MMDD-HHmmss>`）
> * 网站故障检测工具：https://www.websiteplanet.com/zh-hans/webtools/down-or-not
> * 网站有效性链接检测：https://httpstatus.io 、 https://http.app
