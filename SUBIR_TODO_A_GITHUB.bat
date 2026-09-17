@echo off
title SUBIR SISTEMA COMPLETO A GITHUB - FARMACIA DOLOROSA
color 0A
echo =====================================================================
echo       SUBIENDO TODOS LOS ARCHIVOS A GITHUB (Farmacia-Dolorosa)
echo =====================================================================
echo.
cd /d "%~dp0"

set "GIT=C:\Users\TECNOMAX\.gemini\antigravity-ide\scratch\mingit\cmd\git.exe"

"%GIT%" remote remove origin 2>nul
"%GIT%" remote add origin https://github.com/ryscarazo-ctrl/Farmacia-Dolorosa.git

echo.
echo =====================================================================
echo  GitHub te solicitara identificarte para permitir subir el codigo:
echo  1. Si te pide 'Username': escribe: ryscarazo-ctrl
echo  2. Si te pide 'Password': pega tu Token de GitHub o tu clave.
echo =====================================================================
echo.
"%GIT%" push -f https://github.com/ryscarazo-ctrl/Farmacia-Dolorosa.git main

echo.
if %errorlevel% equ 0 (
    echo =====================================================================
    echo  [EXITO TOTAL] Se subieron todos los archivos a GitHub!
    echo  Ahora en Vercel presiona el boton "Redeploy" y tu web estara lista.
    echo =====================================================================
) else (
    echo.
    echo [NOTA] Si no tienes un Token de GitHub, tambien puedes usar GitHub Desktop
    echo (https://desktop.github.com) para sincronizar con un solo clic.
)
pause
