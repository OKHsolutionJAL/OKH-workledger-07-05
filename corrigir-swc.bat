@echo off
setlocal
cd /d "%~dp0"

set "BUNDLED_PNPM=C:\Users\keven\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\pnpm.cmd"
set "PATH=C:\Users\keven\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;C:\Users\keven\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin;%PATH%"
set "SWC_FILE=node_modules\@next\swc-win32-x64-msvc\next-swc.win32-x64-msvc.node"

echo.
echo Corrigindo dependencias do OKH WorkLedger...
echo Este processo precisa de internet para baixar o pacote do Next para Windows.
echo.

if exist "%BUNDLED_PNPM%" (
  call "%BUNDLED_PNPM%" install --no-frozen-lockfile --config.confirmModulesPurge=false --store-dir .pnpm-store
) else (
  where pnpm >nul 2>nul
  if not errorlevel 1 (
    call pnpm install --no-frozen-lockfile --config.confirmModulesPurge=false --store-dir .pnpm-store
  ) else (
    call npm install
  )
)

if errorlevel 1 (
  if exist "%SWC_FILE%" (
    echo.
    echo O pacote principal do Next para Windows ja foi instalado.
    echo Pode executar abrir-previa.bat.
    echo.
    pause
    exit /b 0
  )

  echo.
  echo Nao consegui concluir a instalacao.
  echo Verifique a internet e tente executar este arquivo novamente.
  echo.
  pause
  exit /b 1
)

echo.
echo Dependencias corrigidas.
echo Agora execute abrir-previa.bat para abrir o sistema.
echo.
pause
