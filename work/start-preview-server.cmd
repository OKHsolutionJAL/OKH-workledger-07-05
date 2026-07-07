@echo off
cd /d "C:\Users\keven\Documents\Codex\2026-06-24\transforme-o-sistema-em-um-saas-2"

set "NODE_EXE=C:\Users\keven\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
set "NEXT_BIN=C:\Users\keven\Documents\Codex\2026-06-24\transforme-o-sistema-em-um-saas-2\node_modules\next\dist\bin\next"
set "LOG_DIR=C:\Users\keven\Documents\Codex\2026-06-24\transforme-o-sistema-em-um-saas-2\work"

echo Starting OKH WorkLedger preview at %date% %time%>> "%LOG_DIR%\scheduled-preview.log"
"%NODE_EXE%" "%NEXT_BIN%" dev --hostname 127.0.0.1 --port 3000 >> "%LOG_DIR%\scheduled-preview.log" 2>> "%LOG_DIR%\scheduled-preview.err.log"
