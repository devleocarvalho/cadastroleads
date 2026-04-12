import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);
  const ADMIN_KEY = process.env.ADMIN_KEY || 'admin123'; // Senha mestra

  // --- [HEAD] & [OPTIONS] ---
  if (req.method === 'HEAD') {
    res.setHeader('X-System-Status', 'Operational');
    return res.status(200).end();
  }
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS');
    return res.status(204).end();
  }

  // --- PROTEÇÃO DE CIBERSEGURANÇA (AUTORIZAÇÃO) ---
  // Apenas GET e POST (Públicos) não precisam de chave.
  // DELETE, PUT, PATCH (Administrativos) precisam da chave X-Admin-Key.
  const sensitiveMethods = ['DELETE', 'PUT', 'PATCH'];
  if (sensitiveMethods.includes(req.method)) {
    const userKey = req.headers['x-admin-key'];
    if (userKey !== ADMIN_KEY) {
      return res.status(401).json({ 
        error: 'Não autorizado!', 
        lesson: 'Cibersegurança: O servidor bloqueou este método (Authorization Fail). Somente administradores com a chave correta podem alterar dados.' 
      });
    }
  }

  // --- [GET] Read ---
  if (req.method === 'GET') {
    try {
      const leads = await sql`SELECT * FROM Leads ORDER BY created_at DESC`;
      return res.status(200).json(leads);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // --- [POST] Create Lead + Create Account ---
  if (req.method === 'POST') {
    const { nome, email, telefone, servico, mensagem } = req.body;
    try {
      // 1. Insere o Lead
      const leadResult = await sql`
        INSERT INTO Leads (nome, email, telefone, servico, mensagem) 
        VALUES (${nome}, ${email}, ${telefone}, ${servico}, ${mensagem}) 
        RETURNING *
      `;
      
      // 2. Cria automaticamente a Conta de saldo (se não existir)
      await sql`
        INSERT INTO Contas (email, saldo_horas)
        VALUES (${email}, 0)
        ON CONFLICT (email) DO NOTHING
      `;

      return res.status(201).json(leadResult[0]);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // --- [PUT] Replace ---
  if (req.method === 'PUT') {
    const { id, nome, email, telefone, servico, mensagem } = req.body;
    try {
      const result = await sql`
        UPDATE Leads 
        SET nome=${nome}, email=${email}, telefone=${telefone}, servico=${servico}, mensagem=${mensagem}
        WHERE id = ${Number(id)}
        RETURNING *
      `;
      return res.status(200).json(result[0]);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // --- [PATCH] Partial ---
  if (req.method === 'PATCH') {
    const { id, status } = req.body;
    try {
      const result = await sql`UPDATE Leads SET status = ${status} WHERE id = ${Number(id)} RETURNING *`;
      return res.status(200).json(result[0]);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // --- [DELETE] Delete ---
  if (req.method === 'DELETE') {
    const { id } = req.query;
    try {
      await sql`DELETE FROM Leads WHERE id = ${Number(id)}`;
      return res.status(200).json({ message: 'Excluído' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
