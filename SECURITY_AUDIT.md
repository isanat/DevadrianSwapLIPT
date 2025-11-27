# 🔒 AUDITORIA DE SEGURANÇA - Credenciais e Histórico Git

## ⚠️ AVISO DE SEGURANÇA CRÍTICO

Este documento contém informações sobre verificação e remediação de credenciais potencialmente expostas no histórico do Git.

---

## 📋 RESUMO DA VERIFICAÇÃO

**Data da Verificação:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

### ✅ Resultados das Verificações

1. **Arquivo `.env` no histórico:**
   - ✅ Nenhum arquivo `.env` encontrado no histórico do Git
   - ✅ Arquivo `contracts/.env` nunca foi commitado
   - ✅ Arquivo protegido pelo `.gitignore` atualizado

2. **Credenciais hardcoded no código:**
   - ✅ Nenhuma chave privada (`PRIVATE_KEY`) encontrada hardcoded
   - ✅ `hardhat.config.cjs` usa apenas `process.env.PRIVATE_KEY` (seguro)
   - ✅ Nenhuma API key encontrada hardcoded no código

3. **Padrões de segurança:**
   - ✅ `.gitignore` configurado com múltiplas camadas de proteção
   - ⚠️ **AÇÃO NECESSÁRIA:** Verificar se repositório remoto foi commitado antes da proteção

---

## 🚨 AÇÕES RECOMENDADAS (MESMO SEM EXPOSIÇÃO CONFIRMADA)

### 1. **Rotação de Credenciais (RECOMENDADO)**

Mesmo sem encontrar exposição no histórico local, é recomendado rotacionar credenciais como medida preventiva:

#### 🔑 Rotacionar Alchemy API Key:
1. Acesse [Alchemy Dashboard](https://dashboard.alchemy.com/)
2. Vá até o App criado
3. Gere uma nova API Key
4. Atualize o arquivo `contracts/.env` com a nova chave
5. **Desabilite/delete a chave antiga** (se houver)

#### 🔐 Rotacionar Chave Privada (SE POSSÍVEL):
**⚠️ ATENÇÃO:** Se a chave privada for de uma carteira com fundos, você precisa:
1. Transferir todos os fundos para uma nova carteira
2. Criar uma nova chave privada
3. Atualizar `contracts/.env` com a nova chave
4. **NUNCA reutilize a chave antiga**

#### 🔑 Rotacionar Polygonscan API Key:
1. Acesse [Polygonscan API](https://polygonscan.com/apis)
2. Gere uma nova API Key
3. Atualize o arquivo `contracts/.env`

---

### 2. **Verificação do Repositório Remoto**

Se o repositório foi enviado para GitHub/GitLab/Bitbucket, verifique:

```bash
# Verificar commits que foram enviados para o remoto
git log origin/main --all --full-history --source -- "*/.env*"

# Verificar se há credenciais no remoto
# AVISO: Isso pode expor credenciais na URL, use com cuidado
```

**Se encontrar credenciais no remoto:**
1. ✅ Rotacione TODAS as credenciais imediatamente
2. ✅ Limpe o histórico (veja seção 3)
3. ✅ Force push (cuidado - avise colaboradores)

---

### 3. **Limpeza do Histórico Git (SE NECESSÁRIO)**

**⚠️ AVISO:** Isso reescreve o histórico. Use apenas se:
- Credenciais foram confirmadamente commitadas
- Você tem permissão para reescrever o histórico
- Todos os colaboradores foram avisados

#### Opção A: Usando `git-filter-repo` (RECOMENDADO)

```bash
# Instalar git-filter-repo
pip install git-filter-repo

# Remover arquivo .env do histórico
git filter-repo --path contracts/.env --invert-paths

# OU remover por padrão
git filter-repo --path-glob '**/.env*' --invert-paths
```

#### Opção B: Usando BFG Repo-Cleaner

```bash
# Download BFG: https://rtyley.github.io/bfg-repo-cleaner/
# Remover arquivo
java -jar bfg.jar --delete-files contracts/.env

# Limpar reflog
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

#### Opção C: Usando git filter-branch (DEPRECADO, mas funciona)

```bash
# Remover arquivo do histórico
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch contracts/.env" \
  --prune-empty --tag-name-filter cat -- --all

# Limpar
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

**Após limpar o histórico:**
```bash
# Force push (CUIDADO!)
git push origin --force --all
git push origin --force --tags
```

---

### 4. **Prevenção Futura**

#### ✅ Já Implementado:
- `.gitignore` com múltiplas camadas de proteção
- Padrões recursivos `**/.env*`
- Entrada explícita para `contracts/.env`

#### 📝 Recomendações Adicionais:

1. **Git Hooks:**
   ```bash
   # Criar pre-commit hook para verificar credenciais
   # .git/hooks/pre-commit
   #!/bin/bash
   if git diff --cached | grep -E "(PRIVATE_KEY|API_KEY|SECRET)" | grep -v "process.env"; then
     echo "ERRO: Possível credencial hardcoded detectada!"
     exit 1
   fi
   ```

2. **Secret Scanning:**
   - Configure [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
   - Ou use ferramentas como [git-secrets](https://github.com/awslabs/git-secrets)

3. **Variáveis de Ambiente:**
   - Sempre use `process.env.VARIABLE_NAME`
   - Nunca hardcode credenciais no código
   - Use `.env.example` para documentação (sem valores reais)

---

## 🔍 COMANDOS DE VERIFICAÇÃO

Execute periodicamente para verificar exposição:

```bash
# 1. Verificar se .env está no histórico
git log --all --full-history --source -- "*/.env*"

# 2. Buscar padrões de chaves privadas
git log --all -p -S "0x[a-fA-F0-9]{64}" | grep -i "private"

# 3. Buscar API keys no histórico
git log --all -p -S "alchemy" | grep -i "api.*key"

# 4. Verificar arquivos rastreados
git ls-files | grep -i "\.env"

# 5. Verificar se arquivo está ignorado
git check-ignore -v contracts/.env
```

---

## 📞 EM CASO DE EXPOSIÇÃO CONFIRMADA

1. **Imediatamente:**
   - ✅ Rotacione TODAS as credenciais expostas
   - ✅ Verifique logs de acesso (Alchemy, Polygonscan)
   - ✅ Transfira fundos se chave privada foi exposta

2. **Documentação:**
   - ✅ Registre a data/hora da exposição
   - ✅ Liste credenciais afetadas
   - ✅ Documente ações tomadas

3. **Limpeza:**
   - ✅ Limpe histórico Git (se apropriado)
   - ✅ Notifique colaboradores
   - ✅ Atualize este documento

---

## ✅ CHECKLIST DE SEGURANÇA

- [ ] Verificação do histórico Git completa
- [ ] Verificação do repositório remoto completa
- [ ] Credenciais rotacionadas (se necessário)
- [ ] Histórico Git limpo (se necessário)
- [ ] Pre-commit hooks configurados
- [ ] Secret scanning configurado
- [ ] Documentação atualizada
- [ ] Equipe notificada (se aplicável)

---

**Última Atualização:** $(Get-Date -Format "yyyy-MM-dd")
**Próxima Revisão Recomendada:** $(Get-Date).AddMonths(3).ToString("yyyy-MM-dd")

