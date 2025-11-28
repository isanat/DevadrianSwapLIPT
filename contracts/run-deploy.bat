@echo off
echo Executando deploy completo...
echo.
set HARDHAT_DISABLE_TELEMETRY=1
node_modules\.bin\hardhat.cmd run scripts/deploy-complete.cjs --network mainnet
pause

