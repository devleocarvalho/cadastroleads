import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  // --- [READ] BUSCAR LEADS ---
  if (req.method === 'GET') {
    try {
      const leads = await sql`SELECT * FROM Leads ORDER BY created_at DESC`;
      return res.status(200).json(leads);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar no banco' });
    }
  }

  // --- [CREATE] CRIAR LEAD ---
  if (req.method === 'POST') {
    const { nome, email, telefone, servico, mensagem } = req.body;
    const origem = req.headers['referer'] || 'Web-Site';
    try {
      const result = await sql`
        INSERT INTO Leads (nome, email, telefone, servico, mensagem, origem) 
        VALUES (${nome}, ${email}, ${telefone}, ${servico}, ${mensagem}, ${origem}) 
        RETURNING *
      `;
      return res.status(201).json(result[0]);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao salvar' });
    }
  }

  // --- [UPDATE] ATUALIZAR STATUS ---
  // DICA DE TI: Usamos PATCH para atualizações parciais (mudar apenas um campo).
  if (req.method === 'PATCH') {
    const { id, status } = req.body;
    try {
      const result = await sql`
        UPDATE Leads 
        SET status = ${status} 
        WHERE id = ${id} 
        RETURNING *
      `;
      return res.status(200).json(result[0]);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar status' });
    }
  }

  // --- [DELETE] EXCLUIR LEAD ---
  if (req.method === 'DELETE') {
    const { id } = req.query;
    try {
      await sql`DELETE FROM Leads WHERE id = ${id}`;
      return res.status(200).json({ message: 'Excluído' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao excluir' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
