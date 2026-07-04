@echo off
setlocal
cd /d "%~dp0"

set "BUNDLED_NODE=C:\Users\keven\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
set "BUNDLED_PNPM=C:\Users\keven\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\pnpm.cmd"
set "PATH=C:\Users\keven\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;C:\Users\keven\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin;%PATH%"
set "NODE_CMD=%BUNDLED_NODE%"

if not exist "%NODE_CMD%" (
  set "NODE_CMD=node"
)

echo.
echo Abrindo a previa do OKH WorkLedger...
echo.

if not exist "node_modules" (
  echo Instalando dependencias. Aguarde...
  call :install_deps
)

if not exist "node_modules\@next\swc-win32-x64-msvc\next-swc.win32-x64-msvc.node" (
  echo Corrigindo pacote do Next para Windows. Aguarde...
  call :install_deps
)

if not exist "node_modules\@next\swc-win32-x64-msvc\next-swc.win32-x64-msvc.node" (
  echo.
  echo Nao foi possivel instalar o pacote do Next para Windows.
  echo Conecte a internet e execute o arquivo corrigir-swc.bat.
  echo.
  pause
  exit /b 1
)

echo.
echo Quando aparecer "Ready", abra:
echo http://localhost:3000
echo.
echo Para fechar a previa, feche esta janela.
echo.

"%NODE_CMD%" ".\node_modules\next\dist\bin\next" dev --hostname 127.0.0.1 --port 3000

pause
exit /b 0

:install_deps
if exist "%BUNDLED_PNPM%" (
  call "%BUNDLED_PNPM%" install --no-frozen-lockfile --config.confirmModulesPurge=false --store-dir .pnpm-store
  exit /b %ERRORLEVEL%
)

where pnpm >nul 2>nul
if not errorlevel 1 (
  call pnpm install --no-frozen-lockfile --config.confirmModulesPurge=false --store-dir .pnpm-store
  exit /b %ERRORLEVEL%
)

call npm install
exit /b %ERRORLEVEL%
