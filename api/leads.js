import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);
  const ADMIN_KEY = process.env.ADMIN_KEY || 'admin123';

  // --- [HEAD] & [OPTIONS] ---
  if (req.method === 'HEAD') {
    res.setHeader('X-System-Status', 'Operational');
    return res.status(200).end();
  }
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS');
    return res.status(204).end();
  }

  // --- SEGURANÇA (ADMIN ONLY) ---
  const sensitiveMethods = ['DELETE', 'PUT', 'PATCH'];
  if (sensitiveMethods.includes(req.method)) {
    if (req.headers['x-admin-key'] !== ADMIN_KEY) {
      return res.status(401).json({ error: 'Não autorizado! Acesso negado ao Schema Administrativo.' });
    }
  }

  // --- [GET] Read (CRM Schema) ---
  if (req.method === 'GET') {
    try {
      const leads = await sql`SELECT * FROM crm.Leads ORDER BY created_at DESC`;
      return res.status(200).json(leads);
    } catch (error) {
      return res.status(500).json({ error: 'Erro no Schema CRM: ' + error.message });
    }
  }

  // --- [POST] Create (Sync CRM + BILLING) ---
  if (req.method === 'POST') {
    const { nome, email, telefone, servico, mensagem } = req.body || {};
    if (!nome || !email) {
      return res.status(400).json({ error: 'Nome e E-mail são obrigatórios!' });
    }

    try {
      // 1. Verifica duplicidade no CRM
      const existing = await sql`SELECT id FROM crm.Leads WHERE email = ${email} LIMIT 1`;
      if (existing.length > 0) return res.status(409).json({ error: 'E-mail já existe no CRM!' });

      // 2. Grava no CRM com todos os campos fornecidos
      const lead = await sql`
        INSERT INTO crm.Leads (nome, email, telefone, servico, mensagem) 
        VALUES (${nome}, ${email}, ${telefone || null}, ${servico || null}, ${mensagem || null}) 
        RETURNING *
      `;
      
      // 3. Grava no BILLING
      await sql`
        INSERT INTO billing.Contas (email, saldo_horas)
        VALUES (${email}, 0)
        ON CONFLICT (email) DO NOTHING
      `;

      return res.status(201).json(lead[0]);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // --- [PUT] Full Update (CRM Schema) ---
  if (req.method === 'PUT') {
    const { id, nome, email, telefone, servico, mensagem, status } = req.body || {};
    if (!id || !nome || !email) {
      return res.status(400).json({ error: 'ID, Nome e E-mail são obrigatórios para substituição completa (PUT).' });
    }

    try {
      const result = await sql`
        UPDATE crm.Leads 
        SET 
          nome = ${nome},
          email = ${email},
          telefone = ${telefone || null},
          servico = ${servico || null},
          mensagem = ${mensagem || null},
          status = COALESCE(${status}, status),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${Number(id)}
        RETURNING *
      `;

      if (result.length === 0) {
        return res.status(404).json({ error: 'Lead não encontrado para o ID informado.' });
      }

      return res.status(200).json(result[0]);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // --- [PATCH] Update Status (CRM Schema) ---
  if (req.method === 'PATCH') {
    const { id, status } = req.body || {};
    if (!id || !status) {
      return res.status(400).json({ error: 'ID e status são obrigatórios para atualização parcial (PATCH).' });
    }

    try {
      const result = await sql`
        UPDATE crm.Leads 
        SET status = ${status}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ${Number(id)} 
        RETURNING *
      `;

      if (result.length === 0) {
        return res.status(404).json({ error: 'Lead não encontrado.' });
      }

      return res.status(200).json(result[0]);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // --- [DELETE] Delete (CRM Schema) ---
  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'ID é obrigatório na query para exclusão (DELETE).' });
    }

    try {
      // DICA: A Trigger no banco (trg_audit_lead_delete) vai pegar essa exclusão e salvar no Schema 'audit'!
      const result = await sql`DELETE FROM crm.Leads WHERE id = ${Number(id)} RETURNING id`;

      if (result.length === 0) {
        return res.status(404).json({ error: 'Lead não encontrado para exclusão.' });
      }

      return res.status(200).json({ message: 'Excluído e auditado com sucesso!', id: result[0].id });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
