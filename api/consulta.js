import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Use o método GET para consultar' });
  }

  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'E-mail é obrigatório para a consulta' });
  }

  try {
    // Lógica de Backend: Busca apenas um campo específico no Schema Billing
    const result = await sql`SELECT saldo_horas FROM billing.Contas WHERE email = ${email} LIMIT 1`;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado no sistema de faturamento.' });
    }

    // Retorna o saldo processado
    return res.status(200).json({ 
        email: email,
        saldo: result[0].saldo_horas,
        status: result[0].saldo_horas > 0 ? 'Ativo' : 'Sem Créditos'
    });

  } catch (error) {
    return res.status(500).json({ error: 'Erro interno: ' + error.message });
  }
}
