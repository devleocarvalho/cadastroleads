import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);
  const ADMIN_KEY = process.env.ADMIN_KEY || 'admin123';

  // --- [HEAD] & [OPTIONS] ---
  if (req.method === 'HEAD') return res.status(200).end();
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'GET, POST, PUT, PATCH, DELETE');
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
    const { nome, email, telefone, servico, mensagem } = req.body;
    try {
      // 1. Verifica duplicidade no CRM
      const existing = await sql`SELECT id FROM crm.Leads WHERE email = ${email} LIMIT 1`;
      if (existing.length > 0) return res.status(409).json({ error: 'E-mail já existe no CRM!' });

      // 2. Grava no CRM
      const lead = await sql`
        INSERT INTO crm.Leads (nome, email) 
        VALUES (${nome}, ${email}) 
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

  // --- [PATCH] Update Status (CRM Schema) ---
  if (req.method === 'PATCH') {
    const { id, status } = req.body;
    try {
      const result = await sql`
        UPDATE crm.Leads SET status = ${status} WHERE id = ${Number(id)} RETURNING *
      `;
      return res.status(200).json(result[0]);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // --- [DELETE] Delete (CRM Schema) ---
  if (req.method === 'DELETE') {
    const { id } = req.query;
    try {
      // DICA: A Trigger no banco vai pegar essa exclusão e salvar no Schema 'audit'!
      await sql`DELETE FROM crm.Leads WHERE id = ${Number(id)}`;
      return res.status(200).json({ message: 'Excluído e auditado!' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
