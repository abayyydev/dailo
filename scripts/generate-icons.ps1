Add-Type -AssemblyName System.Drawing
$sourcePath = Join-Path $PSScriptRoot "..\public\icons\icon-512.png"
$sourceImg = [System.Drawing.Image]::FromFile($sourcePath)

$sizes = @{
    'mipmap-mdpi' = 48
    'mipmap-hdpi' = 72
    'mipmap-xhdpi' = 96
    'mipmap-xxhdpi' = 144
    'mipmap-xxxhdpi' = 192
}

foreach ($folder in $sizes.Keys) {
    $size = $sizes[$folder]
    $destFolder = Join-Path $PSScriptRoot "..\android\app\src\main\res\$folder"
    if (Test-Path $destFolder) {
        $bmp = New-Object System.Drawing.Bitmap $size, $size
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $g.DrawImage($sourceImg, 0, 0, $size, $size)
        $g.Dispose()

        $bmp.Save((Join-Path $destFolder "ic_launcher.png"), [System.Drawing.Imaging.ImageFormat]::Png)
        $bmp.Save((Join-Path $destFolder "ic_launcher_round.png"), [System.Drawing.Imaging.ImageFormat]::Png)
        $bmp.Save((Join-Path $destFolder "ic_launcher_foreground.png"), [System.Drawing.Imaging.ImageFormat]::Png)
        $bmp.Dispose()
        Write-Host "Generated $folder ($size x $size)"
    }
}
$sourceImg.Dispose()
Write-Host "All Android icons generated successfully from website icon!"
