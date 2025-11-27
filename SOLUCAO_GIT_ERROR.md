# 🔧 Solução para Erro "Git: Failed to execute git"

## 🔍 Problema Identificado

O erro ocorre porque:
- O Cursor/VSCode tenta acessar `origin/main` (linha 13 do `.git/config`)
- A referência remota `origin/main` não existe (nunca foi feito fetch)
- Isso causa o erro: `ENOENT: no such file or directory, open 'refs/remotes/origin/main'`

## ✅ Solução Aplicada

1. **Removida a linha problemática** do `.git/config`:
   - Removida: `vscode-merge-base = origin/main`

## 🚀 Próximos Passos

### Opção 1: Fazer Fetch do Repositório Remoto (Recomendado)

Execute no terminal:

```powershell
git fetch origin
```

Isso criará a referência `origin/main` se ela existir no repositório remoto.

### Opção 2: Se o Repositório Remoto Estiver Vazio

Se você ainda não fez push, isso é normal. O erro deve desaparecer após:
1. Reiniciar o Cursor
2. Ou fazer o primeiro push: `git push -u origin main`

### Opção 3: Usar Terminal Externo para Commits

Se o erro persistir, use o terminal externo (Git Bash ou PowerShell):

```powershell
cd C:\Users\morei\Desktop\DevadrianSwapLIPT
git add SECURITY_AUDIT.md .gitignore
git commit -m "fix: Remove PowerShell template syntax and improve .gitignore"
```

## 📝 Comandos Úteis

```powershell
# Verificar se origin/main existe
git rev-parse --verify origin/main

# Fazer fetch do remoto
git fetch origin

# Ver todas as referências remotas
git branch -r

# Verificar configuração
git config --list | grep remote
```

## ⚠️ Nota

Se você modificar o `.git/config` manualmente, certifique-se de não quebrar a sintaxe. O arquivo deve ter:
- Seções entre `[seção]`
- Chaves e valores com tabs
- Sem espaços extras

