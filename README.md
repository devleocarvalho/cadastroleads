# ⚡ LeadFlow Professional - Sistema de Gestão de Leads

Este projeto foi desenvolvido para ensinar os pilares de um sistema online profissional, utilizando tecnologias de ponta e arquitetura moderna.

## 🏗️ Arquitetura do Sistema

O sistema é dividido em três camadas principais:

### 1. Front-end (A Cara do Projeto)
*   **Tecnologias**: HTML5, CSS3 (Glassmorphism) e JavaScript (Vanilla).
*   **Função**: Captura os dados do usuário e exibe o dashboard administrativo.
*   **Interface**: Responsiva (funciona em celular e PC) e interativa (notificações em tempo real).

### 2. Back-end / Banco de Dados (O Cérebro)
*   **Tecnologia**: **PostgreSQL** (Gerenciado via Supabase).
*   **Conceito**: Diferente de um banco de dados local, este PostgreSQL vive na nuvem. Ele armazena os leads de forma persistente e segura.
*   **Segurança**: Utilizamos **RLS (Row Level Security)** e **JWT (JSON Web Tokens)** para garantir que apenas usuários autorizados acessem os dados.

### 3. Hospedagem e Deploy (Onde o Site Vive)
*   **Serviço**: **Vercel**.
*   **Processo**: Integrado ao GitHub. Cada vez que você faz um "Push" (sobe o código), a Vercel atualiza o site automaticamente em segundos.

---

## 📡 Protocolos e Fluxo de Dados

Para um dado sair do formulário e chegar ao banco de dados, ele segue este caminho:

1.  **Evento JS**: O navegador detecta o clique em "Cadastrar".
2.  **Requisição HTTP (POST)**: O JavaScript envia um pacote via protocolo **HTTPS** para o servidor.
3.  **API Gateway**: O Supabase recebe o pacote, valida a sua `API_KEY` e verifica se os dados são válidos.
4.  **SQL INSERT**: O servidor de banco de dados executa o comando SQL para gravar a linha na tabela.
5.  **WebSocket (Realtime)**: Assim que a gravação é confirmada, um sinal de rádio digital (WebSocket) é enviado para todos os dashboards abertos para atualizar a lista instantaneamente.

---

## 🚀 Como testar e subir Online (Deploy)

### Passo 1: O Banco de Dados (PostgreSQL)
1.  Crie uma conta gratuita em [supabase.com](https://supabase.com).
2.  Crie um novo projeto e uma tabela chamada `Leads` com as colunas: `id`, `Nome`, `Telefone` e `created_at`.
3.  Pegue sua `SUPABASE_URL` e `SUPABASE_KEY` no painel e coloque no seu `script.js`.

### Passo 2: O Código no GitHub
1.  Crie um repositório no seu GitHub.
2.  Suba os arquivos (`index.html`, `style.css`, `script.js`).

### Passo 3: Deploy na Vercel
1.  Crie uma conta em [vercel.com](https://vercel.com) (use seu GitHub para logar).
2.  Clique em **"Add New" > "Project"**.
3.  Importe o repositório que você criou.
4.  Clique em **"Deploy"**.
5.  **PRONTO!** Você receberá um link oficial (ex: `meu-projeto.vercel.app`) para testar de qualquer lugar.

---

## 🎓 Conceitos Aprendidos
- **BaaS (Backend as a Service)**: Usar infraestrutura pronta para ganhar velocidade.
- **SPA (Single Page Application)**: Navegar entre abas sem recarregar a página.
- **Realtime**: Sincronização de dados em tempo real.
- **Segurança de Dados**: Autenticação e proteção de rotas.

---
Feito com 💜 para aprendizado por @devleocarvalho
