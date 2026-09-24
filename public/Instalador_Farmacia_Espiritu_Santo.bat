@echo off
title INSTALADOR OFICIAL - FARMACIA ESPIRITU SANTO
color 0A
echo =====================================================================
echo    INSTALANDO SISTEMA FARMACIA ESPIRITU SANTO (1 SOLO CLIC)
echo =====================================================================
echo.
echo [1/3] Descargando icono oficial y recursos...

powershell -Command "$appDir = \"$env:LOCALAPPDATA\FarmaciaEspirituSantoApp\"; if (-not (Test-Path $appDir)) { New-Item -ItemType Directory -Force -Path $appDir | Out-Null }; $icoPath = Join-Path $appDir 'logo.ico'; try { (New-Object System.Net.WebClient).DownloadFile('https://farmacia-espiritusanto.vercel.app/logo.ico', $icoPath) } catch {}; $edgePath = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'; if (-not (Test-Path $edgePath)) { $edgePath = 'C:\Program Files\Microsoft\Edge\Application\msedge.exe' }; if (-not (Test-Path $edgePath)) { $edgePath = 'C:\Program Files\Google\Chrome\Application\chrome.exe' }; if (-not (Test-Path $edgePath)) { $edgePath = 'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe' }; $shortcutPath = \"$env:USERPROFILE\Desktop\Farmacia Espiritu Santo.lnk\"; $shell = New-Object -ComObject WScript.Shell; $shortcut = $shell.CreateShortcut($shortcutPath); $shortcut.TargetPath = $edgePath; $shortcut.Arguments = '--app=https://farmacia-espiritusanto.vercel.app --user-data-dir=\"\"' + $appDir + '\"\"'; $shortcut.Description = 'Sistema Integral Farmacia Espiritu Santo'; if (Test-Path $icoPath) { $shortcut.IconLocation = $icoPath }; $shortcut.WindowStyle = 1; $shortcut.Save()"

echo [2/3] Creando acceso oficial en el Escritorio...
echo [3/3] Abriendo el Sistema Farmacia Espiritu Santo...
echo.
echo =====================================================================
echo  ¡INSTALACION COMPLETA Y EXITOSA!
echo  Se ha creado el acceso oficial en tu Escritorio.
echo =====================================================================
echo.

start "" "%USERPROFILE%\Desktop\Farmacia Espiritu Santo.lnk"
timeout /t 2 >nul
exit
