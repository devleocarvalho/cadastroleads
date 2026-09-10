-- ==========================================================
-- 🚀 LeadFlow Pro - Database Architecture (PostgreSQL / Neon)
-- ==========================================================
-- Este script configura os três schemas do sistema:
-- 1. crm: Gestão de Leads e Contatos
-- 2. billing: Gestão de Saldo e Faturamento
-- 3. audit: Rastreabilidade e Auditoria de Exclusões via Trigger
-- ==========================================================

-- 1. Criação dos Schemas
CREATE SCHEMA IF NOT EXISTS crm;
CREATE SCHEMA IF NOT EXISTS billing;
CREATE SCHEMA IF NOT EXISTS audit;

-- ==========================================================
-- 2. SCHEMA CRM: Tabela de Leads
-- ==========================================================
CREATE TABLE IF NOT EXISTS crm.Leads (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telefone VARCHAR(50),
    servico VARCHAR(100),
    mensagem TEXT,
    status VARCHAR(50) DEFAULT 'Novo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 3. SCHEMA BILLING: Tabela de Contas e Faturamento
-- ==========================================================
CREATE TABLE IF NOT EXISTS billing.Contas (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    saldo_horas NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 4. SCHEMA AUDIT: Tabela de Log de Auditoria
-- ==========================================================
CREATE TABLE IF NOT EXISTS audit.Log (
    id SERIAL PRIMARY KEY,
    tabela VARCHAR(100) NOT NULL,
    acao VARCHAR(50) NOT NULL,
    dados_anteriores JSONB,
    executado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 5. TRIGGER DE AUDITORIA: Salva automaticamente leads excluídos
-- ==========================================================
CREATE OR REPLACE FUNCTION audit.log_lead_deletion()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit.Log (tabela, acao, dados_anteriores)
    VALUES ('crm.Leads', 'DELETE', to_jsonb(OLD));
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_lead_delete ON crm.Leads;
CREATE TRIGGER trg_audit_lead_delete
AFTER DELETE ON crm.Leads
FOR EACH ROW
EXECUTE FUNCTION audit.log_lead_deletion();

-- ==========================================================
-- 6. DADOS INICIAIS DE TESTE (Seed)
-- ==========================================================
INSERT INTO crm.Leads (nome, email, telefone, servico, status)
VALUES 
    ('Ana Silva', 'ana.silva@exemplo.com', '(11) 98888-1111', 'Consultoria', 'Novo'),
    ('Carlos Eduardo', 'carlos.eduardo@exemplo.com', '(21) 97777-2222', 'Dev', 'Em Contato')
ON CONFLICT (email) DO NOTHING;

INSERT INTO billing.Contas (email, saldo_horas)
VALUES 
    ('ana.silva@exemplo.com', 10.5),
    ('carlos.eduardo@exemplo.com', 0)
ON CONFLICT (email) DO NOTHING;
