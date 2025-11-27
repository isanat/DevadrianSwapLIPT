# Script para fazer commit das correções
Write-Host "Adicionando arquivos ao stage..." -ForegroundColor Cyan
git add SECURITY_AUDIT.md
git add .gitignore

Write-Host "`nStatus do Git:" -ForegroundColor Cyan
git status --short

Write-Host "`nFazendo commit..." -ForegroundColor Cyan
git commit -m "fix: Remove PowerShell template syntax from SECURITY_AUDIT.md

- Replace dynamic PowerShell date commands with static ISO 8601 dates
- Fix .gitignore to properly protect contracts/.env with multiple patterns
- Ensure documentation contains only standard markdown format"

Write-Host "`nCommit realizado com sucesso!" -ForegroundColor Green
Write-Host "`nPara ver o log:" -ForegroundColor Yellow
Write-Host "  git log --oneline -3" -ForegroundColor Gray

