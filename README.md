# 🚀 LeadFlow Pro - Premium Lead Management System

![LeadFlow Pro](https://img.shields.io/badge/Status-Premium_Release-blueviolet?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-PostgreSQL_+_Neon_+_Vercel-black?style=for-the-badge)

**LeadFlow Pro** é um sistema de gestão de leads (CRM) de alto nível, projetado com uma estética SaaS premium e arquitetura serverless moderna. Este projeto não apenas gerencia dados, mas serve como um **laboratório interativo** para estudantes de TI dominarem o ciclo completo de uma aplicação Web Full Stack.

---

## 🎨 Design & Experiência (UX/UI)

O sistema foi reconstruído do zero para oferecer uma interface de impacto, utilizando as melhores práticas de design moderno:

- **Estética Pro SaaS**: Paleta de cores baseada em *Indigo, Slate e Rose* para um visual limpo e corporativo.
- **Glassmorphism v2**: Uso avançado de transparências, *backdrop-filter blur* e bordas sutis para profundidade.
- **Iconografia Premium**: Integração total com **Lucide Icons** para clareza visual.
- **Micro-interações**: Animações de entrada, estados de hover dinâmicos e feedbacks instantâneos via Toasts.
- **Dashboard Dual**: Alternância suave entre captura de leads e administração via conceito de SPA (Single Page Application).

---

## 🛠️ Stack Tecnológica

### Frontend (User Interface)
- **HTML5 & Vanilla CSS**: Zero frameworks pesados. CSS puro com variáveis (Design Tokens) e Grid Layout.
- **Vanilla JavaScript (ES6+)**: Lógica robusta sem dependências externas desnecessárias.
- **Lucide Icons & Google Fonts (Outfit)**: Tipografia e ícones de alta qualidade.

### Backend (Serverless Edge)
- **Neon Serverless PostgreSQL**: Banco de dados real na nuvem com alta performance.
- **Serverless Functions (Vercel API)**: Rotas de API em `/api/leads` que processam o CRUD completo via Node.js.
- **Neon SDK**: Conexão segura e otimizada para ambientes baseados em HTTPS.

---

## 📖 O Laboratório de APIs (Monitoramento em Real-time)

Uma das funcionalidades exclusivas deste projeto é o **Sidebar de Monitoramento**. Ele funciona como um log de desenvolvedor em tempo real, permitindo que o usuário veja:
- **Métodos HTTP**: Visualização clara de quando um `POST`, `GET`, `PATCH` ou `DELETE` é disparado.
- **Status Codes**: Explicação prática sobre respostas `200 OK`, `201 Created` e erros `500`.
- **Payloads JSON**: Exibição dos dados que estão trafegando entre o cliente e o banco de dados Neon.

---

## 🚀 Guia de Configuração e Deploy

### 1. Banco de Dados (Neon)
1.  Crie uma conta em [neon.tech](https://neon.tech).
2.  Crie um novo projeto e execute o seguinte SQL no console:
    ```sql
    CREATE TABLE Leads (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        telefone VARCHAR(50),
        servico VARCHAR(100),
        mensagem TEXT,
        status VARCHAR(50) DEFAULT 'Novo',
        origem VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    ```
3.  Copie a `DATABASE_URL` (Connection String).

### 2. Configuração Local
1.  Clone o repositório.
2.  Crie um arquivo `.env` (ou configure no dashboard da Vercel) com a variável:
    ```env
    DATABASE_URL=seu_link_aqui
    ```

### 3. Deploy na Vercel
1.  Conecte seu GitHub à [Vercel](https://vercel.com).
2.  Importe o projeto.
3.  Adicione as Variáveis de Ambiente (`DATABASE_URL`).
4.  O sistema de **Serverless Functions** da Vercel reconhecerá automaticamente a pasta `/api` e criará suas rotas backend.

---

## 🎓 Conceitos Profissionais Aplicados
- **CRUD Completo**: Create (Cadastro), Read (Listagem), Update (Mudar Status), Delete (Remover).
- **Edge Computing**: API próxima ao usuário para menor latência.
- **Clean Code**: Separação clara entre estilos, lógica e estrutura.
- **Responsive Design**: Totalmente adaptável para Mobile, Tablet e Desktop.

---
Desenvolvido com excelência por **Leonardo Carvalho** 🚀
*Edição Professional Educativa - 2024*
