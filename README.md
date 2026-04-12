# 🚀 LeadFlow Pro - Premium Lead Management System

![LeadFlow Pro](https://img.shields.io/badge/Status-Professional_Edition-blueviolet?style=for-the-badge)
![Full Stack](https://img.shields.io/badge/Architecture-Full_Stack_Serverless-black?style=for-the-badge)

**LeadFlow Pro** é uma solução completa de CRM (Customer Relationship Management) projetada para demonstrar como aplicações modernas de alta performance funcionam na nuvem.

---

## 🏗️ Arquitetura do Sistema (Full Stack)

Diferente de sistemas estáticos, este projeto utiliza uma arquitetura de três camadas (**3-Tier Architecture**), garantindo segurança e escalabilidade.

### 1. Front-end (Camada de Cliente)
*   **Onde vive**: No navegador do usuário (Chrome, Safari, etc).
*   **Tecnologias**: HTML5, CSS3 (Glassmorphism), Vanilla JavaScript, Lucide Icons.
*   **Responsabilidade**: Fornecer a interface visual, coletar dados via formulários e disparar ordens para o servidor.

### 2. Back-end (Camada de Servidor - Serverless)
*   **Onde vive**: Nas **Vercel Edge Functions** (Servidores espalhados pelo mundo).
*   **Tecnologias**: Node.js, Vercel Serverless Functions.
*   **Responsabilidade**: É o **intermediário seguro**. Ele recebe as ordens do cliente, valida as permissões e traduz tudo para comandos SQL que o banco entende.
*   **Localização**: Pasta `/api/leads.js`.

### 3. Banco de Dados (Camada de Dados)
*   **Onde vive**: No **Neon Cloud PostgreSQL**.
*   **Tecnologia**: PostgreSQL 16.
*   **Responsabilidade**: Guardar as informações de forma permanente. Mesmo que o servidor desligue, o Neon garante a persistência dos dados.

---

## 📡 O Ciclo de Vida de uma Requisição (Fluxo de Dados)

Quando você clica em "Enviar para o PostgreSQL", o seguinte fluxo acontece:

```mermaid
sequenceDiagram
    participant User as 👤 Usuário
    participant Browser as 🌐 Navegador (Front)
    participant API as 🧠 Vercel Function (Back)
    participant Neon as 🐘 Neon DB (PostgreSQL)

    User->>Browser: Preenche form e clica "Enviar"
    Browser->>API: HTTP POST /api/leads (Payload JSON)
    Note over API: O Back-end "acorda", valida o JSON<br/>e prepara a query SQL.
    API->>Neon: SQL INSERT INTO Leads (...)
    Neon-->>API: Confirmação de Gravação (Row Data)
    API-->>Browser: HTTP 201 Created (Sucesso!)
    Browser-->>User: Mostra Mensagem de Sucesso (Toast)
```

1.  **Trigger (Front)**: O JavaScript intercepta o clique, cria um objeto JSON e envia via `fetch()`.
2.  **Request (HTTP)**: A mensagem viaja pela internet usando o protocolo **POST**.
3.  **Processamento (API)**: O nosso back-end Node.js recebe a mensagem, extrai os campos e se conecta ao Neon usando a `DATABASE_URL`.
4.  **Persistência (SQL)**: O comando SQL é executado no banco. O banco verifica a integridade e salva no disco.
5.  **Resposta (Response)**: O servidor envia um código de status de volta. O front-end lê esse código e avisa o usuário.

---

## 🛠️ Métodos HTTP Implementados

Este projeto é um laboratório completo de verbos HTTP:

*   **GET**: Recupera a lista de leads no banco.
*   **POST**: Cria um novo recurso (Lead).
*   **PUT**: Substituição completa de um lead (Edição total).
*   **PATCH**: Atualização parcial (Ex: Mudar apenas o status do lead).
*   **DELETE**: Remoção permanente do registro.
*   **HEAD**: Verifica se a API está online sem baixar dados.
*   **OPTIONS**: Consulta quais métodos o servidor permite usar.

---

## 🚀 Como subir o seu próprio sistema

### 1. Preparação do Neon (Banco)
Execute este script no Neon SQL Editor para "zerar" e criar a tabela correta:
```sql
DROP TABLE IF EXISTS Leads;
CREATE TABLE Leads (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefone VARCHAR(50),
    servico VARCHAR(100),
    mensagem TEXT,
    status VARCHAR(50) DEFAULT 'Novo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Deploy na Vercel
1.  Suba o código no seu GitHub.
2.  Importe na Vercel.
3.  Adicione a variável de ambiente `DATABASE_URL` com sua conexão do Neon.
4.  A Vercel criará automaticamente o **Endpoint de API** em `/api/leads`.

---
Desenvolvido por **Leonardo Carvalho** | *Tecnologia e Educação em Nuvem*
