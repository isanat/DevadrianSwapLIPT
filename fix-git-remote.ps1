# Script para corrigir referência remota origin/main faltando
Write-Host "Corrigindo referência remota do Git..." -ForegroundColor Cyan
Write-Host ""

# Configurar Git para não usar pager
$env:GIT_PAGER = ""
git config --global core.pager ""

Write-Host "1. Verificando remote configurado..." -ForegroundColor Yellow
$remoteUrl = git config --get remote.origin.url
if ($remoteUrl) {
    Write-Host "   Remote encontrado: $remoteUrl" -ForegroundColor Green
} else {
    Write-Host "   ERRO: Nenhum remote 'origin' configurado!" -ForegroundColor Red
    exit 1
}

Write-Host "`n2. Executando git fetch origin..." -ForegroundColor Yellow
$fetchOutput = git fetch origin 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Fetch executado com sucesso" -ForegroundColor Green
    Write-Host "   $fetchOutput" -ForegroundColor Gray
} else {
    Write-Host "   ⚠ Fetch retornou código: $LASTEXITCODE" -ForegroundColor Yellow
    Write-Host "   $fetchOutput" -ForegroundColor Gray
}

Write-Host "`n3. Verificando se origin/main existe agora..." -ForegroundColor Yellow
$mainRef = git rev-parse --verify origin/main 2>$null
if ($mainRef) {
    Write-Host "   ✓ Referência origin/main criada: $mainRef" -ForegroundColor Green
} else {
    Write-Host "   ⚠ origin/main ainda não existe" -ForegroundColor Yellow
    Write-Host "   Isso pode ser normal se o repositório remoto não tem branch 'main'" -ForegroundColor Gray
    
    # Tentar criar referência baseada no HEAD remoto
    $remoteHead = git ls-remote --heads origin main 2>$null
    if ($remoteHead) {
        Write-Host "   Tentando criar referência baseada no HEAD remoto..." -ForegroundColor Yellow
        git update-ref refs/remotes/origin/main (git ls-remote origin HEAD | Select-Object -First 1).Split()[0]
        Write-Host "   ✓ Referência criada" -ForegroundColor Green
    } else {
        Write-Host "   ℹ O repositório remoto pode estar vazio ou usar outro branch" -ForegroundColor Cyan
    }
}

Write-Host "`n4. Verificando status..." -ForegroundColor Yellow
git status --short | Select-Object -First 10

Write-Host "`n✓ Processo concluído!" -ForegroundColor Green
Write-Host "Reinicie o Cursor/VSCode para que as mudanças tenham efeito." -ForegroundColor Yellow

