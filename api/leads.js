import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  // --- [HEAD] Verificação de disponibilidade ---
  if (req.method === 'HEAD') {
    res.setHeader('X-System-Status', 'Operational');
    return res.status(200).end();
  }

  // --- [OPTIONS] Métodos Suportados ---
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS');
    return res.status(204).end();
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

  // --- [POST] Create ---
  if (req.method === 'POST') {
    const { nome, email, telefone, servico, mensagem } = req.body;
    try {
      const result = await sql`
        INSERT INTO Leads (nome, email, telefone, servico, mensagem) 
        VALUES (${nome}, ${email}, ${telefone}, ${servico}, ${mensagem}) 
        RETURNING *
      `;
      return res.status(201).json(result[0]);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // --- [PUT] Replace (Substituição Total) ---
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

  // --- [PATCH] Update Parcial ---
  if (req.method === 'PATCH') {
    const { id, status } = req.body;
    try {
      const result = await sql`
        UPDATE Leads SET status = ${status} WHERE id = ${Number(id)} RETURNING *
      `;
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
