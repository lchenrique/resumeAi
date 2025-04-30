# Plano Estratégico: Micro-SaaS de Currículos com IA

## 1. Visão Geral

**Ideia Central:** Criar um editor/criador de currículos online (Micro-SaaS) potencializado por Inteligência Artificial (IA) para ajudar usuários a criar, otimizar e gerenciar seus currículos.

**Modelo de Negócio:** Freemium com planos pagos baseados em limites de uso, recursos avançados e/ou modelos de IA premium.

**Público:** Profissionais buscando criar ou melhorar seus currículos para candidaturas de emprego.

## 2. Análise do Estado Atual (Resumo)

*   **Prós:**
    *   Editor visual funcional (Yoopta).
    *   Integração básica com APIs de IA (Gemini, OpenRouter) com streaming.
    *   Base tecnológica moderna (Next.js, React, Edge Runtime).
*   **Contras (para um SaaS):**
    *   Ausência de sistema de usuários/autenticação.
    *   Falta de armazenamento persistente de currículos por usuário.
    *   Memória de chat apenas de curto prazo (KV com TTL curto).
    *   Estrutura não preparada para múltiplos usuários/currículos.
    *   Sem lógica de monetização/planos.

## 3. Tecnologias Sugeridas

*   **Frontend:** Next.js (App Router), React, Tailwind CSS, Yoopta Editor, `@vercel/kv` (cache/memória temporária de chat).
*   **Backend:** Next.js API Routes (Serverless/Edge), Google Gemini API, OpenRouter API.
*   **Autenticação:** **NextAuth.js** (Padrão Next.js, flexível).
*   **Banco de Dados:** **Vercel Postgres** (Serverless, boa integração com Vercel). Alternativas: Supabase, PlanetScale. *ORM recomendado: Prisma ou Drizzle*.
*   **Pagamentos:** Stripe.
*   **Hospedagem:** Vercel.

## 4. Fases do Projeto

---

### Fase 1: Fundação - Autenticação e Armazenamento Persistente (MVP Core)

*   **Objetivo:** Permitir que usuários se cadastrem, loguem, criem, editem e salvem múltiplos currículos de forma persistente.
*   **Ações:**
    1.  **Configurar Autenticação:**
        *   Instalar e configurar `next-auth`.
        *   Implementar provedores de login (ex: Google, Email).
        *   Criar UI de Login/Signup.
        *   Proteger rotas/páginas.
    2.  **Configurar Banco de Dados (Vercel Postgres):**
        *   Criar DB e conectar ao projeto.
        *   Definir Schemas (ORM recomendado - Prisma/Drizzle):
            *   `User`: (Gerenciado por NextAuth) `id`, `name`, `email`, `image`, etc.
            *   `Resume`: `id`, `userId` (FK), `title`, `content` (JSON Yoopta), `createdAt`, `updatedAt`.
    3.  **Implementar CRUD de Currículos:**
        *   Criar API routes (`/api/resumes`) protegidas para:
            *   Listar currículos do usuário (`GET`).
            *   Criar novo currículo (`POST`).
            *   Obter currículo específico (`GET [resumeId]`).
            *   Atualizar currículo (`PUT [resumeId]`, salva Yoopta JSON).
            *   Deletar currículo (`DELETE [resumeId]`).
        *   Integrar Frontend:
            *   Chamar APIs para carregar/salvar no Yoopta Editor.
            *   Criar um dashboard/lista para seleção de currículos.
    4.  **(Opcional)** Desativar funcionalidades de IA temporariamente para focar na base.
*   **Resultado Esperado:** Aplicação funcional onde usuários logados podem gerenciar seus próprios currículos salvos no banco de dados.

---

### Fase 2: Integração da IA (Chat e Sugestões)

*   **Objetivo:** Reintroduzir a IA de forma contextualizada para o currículo ativo do usuário.
*   **Ações:**
    1.  **Refinar APIs de Chat (`/api/gemini-chat`, `/api/openrouter-chat`):**
        *   Manter Vercel KV para memória de curto prazo da conversa (TTL curto).
        *   Receber `resumeId` e `conversationId`.
        *   Carregar `content` do currículo (`resumeId`) do **Banco de Dados (Postgres)** para usar como `resumeContext`.
        *   Manter lógica de limite de contexto e streaming (SSE).
    2.  **Atualizar Frontend (`AIChatPanel.tsx`):**
        *   Passar o `resumeId` ativo para a API de chat.
        *   Manter seleção de modelo e processamento SSE.
    3.  **Melhorar Prompts:** Criar prompts de sistema mais específicos para tarefas de currículo.
    4.  **(Opcional Avançado)** Explorar retorno de sugestões estruturadas em JSON pela IA.
*   **Resultado Esperado:** Usuários podem interagir com a IA para obter ajuda sobre o currículo específico que estão editando, com a IA acessando o conteúdo atual e a conversa tendo memória de curto prazo.

---

### Fase 3: Monetização e Recursos Adicionais

*   **Objetivo:** Implementar um modelo Freemium com planos pagos e funcionalidades exclusivas.
*   **Ações:**
    1.  **Definir Planos (Free/Paid):** Estabelecer limites e recursos para cada nível (nº currículos, interações IA, modelos IA, templates).
    2.  **Integrar Pagamentos (Stripe):**
        *   Configurar Stripe (Products, Prices, Checkout).
        *   Implementar webhooks para atualizar status da assinatura no DB do usuário (`planId`, `status` no schema `User`).
    3.  **Aplicar Limites no Backend:** Verificar o plano do usuário antes de permitir ações (criar currículo, chamar IA).
    4.  **Implementar Contagem (Opcional):** Se cobrar por uso, implementar rastreamento (KV pode ser usado para contadores simples com TTL mensal). *Recomendação: Iniciar com limites mensais*.
    5.  **UI de Planos/Conta:** Criar páginas para gerenciamento de assinatura.
    6.  **Desenvolver Recursos Premium:** Templates, modelos de IA avançados, etc.
*   **Resultado Esperado:** Aplicação funcionando como SaaS com modelo freemium, capaz de receber pagamentos e diferenciar funcionalidades por plano.

---

### Fase 4: Crescimento e Otimização

*   **Objetivo:** Melhorar o produto, otimizar custos e escalar.
*   **Ações:**
    1.  **Analytics & Monitoramento:** Implementar Vercel Analytics, Sentry (erros), etc.
    2.  **Feedback:** Coletar ativamente feedback dos usuários.
    3.  **Otimização:**
        *   Custos de IA (escolha de modelos, caching de respostas comuns).
        *   Performance de Banco de Dados / KV.
    4.  **Novas Funcionalidades:** Baseado em feedback (Ex: Importação LinkedIn, Análise de Vagas, Cartas de Apresentação).
    5.  **Marketing & SEO:** Atrair usuários.
*   **Resultado Esperado:** Produto em melhoria contínua, base de usuários crescente, e operação otimizada.

---

## 5. Considerações sobre Monetização

*   **Cobrança por Interação:** Possível, mas complexa para rastrear e faturar. Pode gerar ansiedade no usuário.
*   **Modelo de Assinatura (Recomendado para Iniciar):** Mais simples de implementar e comunicar. Definir limites mensais de uso da IA (ou níveis de acesso a modelos) é um bom ponto de partida.

--- 