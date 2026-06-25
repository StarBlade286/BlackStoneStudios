# 📋 Regras de Branches - Equipa BlackStoneStudios

## 📖 Visão Geral

Este documento estabelece as regras para criação, utilização e integração de branches no projeto **BlackStoneStudios**. O objetivo é manter a organização, evitar conflitos e garantir qualidade no código.

---

## 🏗️ Estrutura de Branches

### 1. **Branch Principal (Main/Master)**
- ✅ Contém código **pronto para produção**
- ✅ Código **testado e aprovado**
- ❌ Nenhum commit direto (apenas PRs)
- 🔒 **Protegida** - Requer aprovação antes de merge

### 2. **Branch de Desenvolvimento (Develop)**
- ✅ Contém as **últimas features em desenvolvimento**
- ✅ Base para criar novas branches
- ✅ Servidor de teste antes de ir para main
- ⚠️ Código ainda em desenvolvimento

---

## 🚀 Como Criar uma Branch

### Passo 1: Atualizar Develop
```bash
git checkout develop
git pull origin develop
```

### Passo 2: Criar a Nova Branch
```bash
git checkout -b feature/nome-descritivo
```

### Passo 3: Publicar a Branch
```bash
git push origin feature/nome-descritivo
```

### ✅ Convenção de Nomes
- **Usar kebab-case** (palavras separadas por hífen)
- **Descritivo e claro**
- Exemplos ✅:
  - `feature/user-authentication`
  - `feature/mobile-responsiveness`
  - `feature/database-connection`

- Exemplos ❌:
  - `feature/novo` (vago)
  - `feature_login` (underscore)
  - `featurLogin` (camelCase)

---

## 💻 Desenvolvimento na Branch

### Commits
```bash
# Fazer alterações
git add .
git commit -m "tipo: descrição clara e concisa"
```

### Tipos de Commit
- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `refactor:` - Alteração de código sem mudar funcionalidade
- `style:` - Formatação, indentação, espaços
- `docs:` - Documentação
- `test:` - Testes

### Exemplos de Commits
```
feat: adicionar formulário de login
fix: corrigir erro de CSS em mobile
refactor: simplificar lógica de validação
docs: atualizar README
```

### Push Frequente
```bash
# Fazer push regularmente (várias vezes por dia)
git push origin feature/seu-nome
```

---

## 🔄 Integração e Merge (Pull Request)

### Passo 1: Criar Pull Request (PR)
1. Ir para GitHub
2. Clicar em "Compare & pull request"
3. Verificar que:
   - ✅ Base branch: `develop`
   - ✅ Compare branch: sua `feature/nome`

### Passo 2: Descrever o PR
```markdown
## 📝 Descrição
Resumo breve do que foi feito.

## 🎯 Tipo de Alteração
- [ ] Nova Funcionalidade
- [ ] Correção de Bug
- [ ] Alteração de Documentação

## ✅ Checklist
- [ ] Código testado localmente
- [ ] Sem conflitos com develop
- [ ] Commits com mensagens claras
- [ ] Documentação atualizada
```

### Passo 3: Revisão de Código
- **Pelo menos 1 aprovação** de outro membro da equipa
- Resolver comentários e fazer ajustes
- Push dos novos commits na mesma branch

### Passo 4: Merge
- Após aprovação, fazer merge na branch base
- Deletar a branch remota após merge
- ```bash
  git branch -d feature/seu-nome
  git push origin --delete feature/seu-nome
  ```

---

## 📊 Fluxo Visual (Git Flow Simplificado)

```
main (produção)
  ↑
develop (desenvolvimento)
  ↑
  ├─← feature/... (nova funcionalidade)
  └─← feature/... (outra funcionalidade)
```

---

## ⚠️ Regras Importantes

### ✅ O QUE FAZER
1. ✅ Criar uma branch **para cada funcionalidade**
2. ✅ Fazer commits **pequenos e frequentes**
3. ✅ Descrever bem **o que foi feito**
4. ✅ Pedir **revisão antes de merge**
5. ✅ **Atualizar** antes de começar a trabalhar
6. ✅ **Deletar** branches após merge

### ❌ O QUE NÃO FAZER
1. ❌ Commit direto em `develop` ou `main`
2. ❌ Branches sem descrição clara
3. ❌ Merge sem revisão da equipa
4. ❌ Misturar múltiplas funcionalidades numa branch
5. ❌ Deixar branches antigas/abandonadas
6. ❌ Commits com mensagens genéricas ("fix", "update")

---

## 📋 Checklist Antes de Fazer Merge

- [ ] Branch criada a partir de `develop`?
- [ ] Commits com mensagens descritivas?
- [ ] Sem conflitos com `develop`?
- [ ] Código testado localmente?
- [ ] Aprovação de pelo menos 1 colega?
- [ ] PR tem descrição clara?
- [ ] Documentação atualizada?
- [ ] Sem código comentado/desnecessário?

---

## 🆘 Resolvendo Conflitos

### Se houver conflito ao fazer merge:

```bash
# 1. Atualizar sua branch
git fetch origin
git merge origin/develop

# 2. Resolver conflitos no editor
# (Procurar por <<<<<<, ======, >>>>>>>)

# 3. Adicionar e confirmar
git add .
git commit -m "fix: resolver conflitos com develop"

# 4. Push
git push origin feature/seu-nome
```

---

## 🎓 Resumo Rápido

| Ação | Comando |
|------|---------|
| Criar branch | `git checkout -b feature/nome` |
| Ver branches | `git branch -a` |
| Mudar branch | `git checkout develop` |
| Atualizar | `git pull origin develop` |
| Enviar | `git push origin feature/nome` |
| Deletar local | `git branch -d feature/nome` |
| Deletar remoto | `git push origin --delete feature/nome` |

---

**Versão:** 1.0  
**Última atualização:** 2026-06-25  
**Autor:** Equipa BlackStoneStudios
