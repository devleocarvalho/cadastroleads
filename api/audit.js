import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);
  const ADMIN_KEY = process.env.ADMIN_KEY || 'admin123';

  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido. Use GET para consultar auditoria.' });
  }

  // Validação de acesso administrativo ao schema audit
  if (req.headers['x-admin-key'] !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Não autorizado! O Schema de Auditoria exige chave administrativa.' });
  }

  try {
    const logs = await sql`
      SELECT id, tabela, acao, dados_anteriores, executado_em 
      FROM audit.Log 
      ORDER BY executado_em DESC 
      LIMIT 50;
    `;
    return res.status(200).json(logs);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao consultar audit.Log: ' + error.message });
  }
}
