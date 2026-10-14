$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$iconRoot = Join-Path $projectRoot 'icons'
New-Item -ItemType Directory -Force -Path $iconRoot | Out-Null

foreach ($size in 16, 32, 48, 128) {
  $bitmap = New-Object System.Drawing.Bitmap($size, $size)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.Clear([System.Drawing.Color]::Transparent)

  $accent = [System.Drawing.Color]::FromArgb(88, 119, 158)
  $white = [System.Drawing.Color]::FromArgb(255, 255, 255)
  $radius = [Math]::Max(3, [int]($size * 0.22))
  $edge = [float]($size - 1)
  $rect = [System.Drawing.RectangleF]::new(0, 0, $edge, $edge)
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $diameter = $radius * 2
  $path.AddArc($rect.X, $rect.Y, $diameter, $diameter, 180, 90)
  $path.AddArc($rect.Right - $diameter, $rect.Y, $diameter, $diameter, 270, 90)
  $path.AddArc($rect.Right - $diameter, $rect.Bottom - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($rect.X, $rect.Bottom - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()

  $accentBrush = New-Object System.Drawing.SolidBrush($accent)
  $graphics.FillPath($accentBrush, $path)
  $penWidth = [Math]::Max(1.4, $size * 0.055)
  $pen = New-Object System.Drawing.Pen($white, $penWidth)
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $left = $size * 0.29
  $right = $size * 0.71
  foreach ($ratio in 0.34, 0.50, 0.66) {
    $y = $size * $ratio
    $lineRight = if ($ratio -eq 0.66) { $size * 0.56 } else { $right }
    $graphics.DrawLine($pen, $left, $y, $lineRight, $y)
  }

  $target = Join-Path $iconRoot "icon-$size.png"
  $bitmap.Save($target, [System.Drawing.Imaging.ImageFormat]::Png)
  $accentBrush.Dispose()
  $pen.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
  $path.Dispose()
}

Write-Output "Generated extension icons in $iconRoot"
