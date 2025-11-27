# Script para corrigir erro do Git relacionado a origin/main não encontrado

Write-Host "Verificando configuração do Git..." -ForegroundColor Cyan

# Configurar Git para não usar pager
$env:GIT_PAGER = ""
git config --global core.pager ""

# Verificar se remote existe
$remoteUrl = git config --get remote.origin.url 2>$null
if (-not $remoteUrl) {
    Write-Host "AVISO: Nenhum remote 'origin' configurado" -ForegroundColor Yellow
    Write-Host "O erro pode ser resolvido configurando um remote ou removendo a referência" -ForegroundColor Yellow
} else {
    Write-Host "Remote encontrado: $remoteUrl" -ForegroundColor Green
    
    # Tentar fazer fetch para criar referências remotas
    Write-Host "`nExecutando git fetch origin..." -ForegroundColor Cyan
    git fetch origin 2>&1 | Out-String | Write-Host
    
    # Verificar se origin/main existe agora
    $mainExists = git rev-parse --verify origin/main 2>$null
    if ($mainExists) {
        Write-Host "`n✓ Referência origin/main criada com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "`nAVISO: origin/main ainda não existe" -ForegroundColor Yellow
        Write-Host "Isso pode ser normal se o repositório remoto usa um branch diferente" -ForegroundColor Yellow
    }
}

# Verificar status
Write-Host "`nStatus atual do Git:" -ForegroundColor Cyan
git status --short 2>&1 | Select-Object -First 10

Write-Host "`n✓ Processo concluído!" -ForegroundColor Green
Write-Host "Tente fechar e reabrir o Cursor/VSCode para que o erro desapareça." -ForegroundColor Yellow

