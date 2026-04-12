/**
 * 🎓 LEADFLOW ENTERPRISE - SERVERLESS API (BACKEND)
 * 
 * Este arquivo roda nos servidores da Vercel. Ele é o coração do seu sistema.
 * É aqui que a mágica do Banco de Dados PostgreSQL acontece.
 * 
 * --- CONCEITOS INTEGRADOS ---
 * 1. SERVER-SIDE: Código que roda no servidor, não no navegador.
 * 2. DATABASE CONNECTION: Como o código "fala" com o PostgreSQL.
 * 3. ENV VARIABLES: Proteção de senhas e links sensíveis.
 * 4. SQL: A linguagem padrão para manipular bancos de dados relacionais.
 */

import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // 🔗 CONEXÃO SEGURA
  // process.env.DATABASE_URL é uma variável de ambiente definida no painel da Vercel.
  // DICA DE TI: Nunca escreva a senha diretamente no código (Hardcoding).
  const sql = neon(process.env.DATABASE_URL);

  /**
   * 🔍 CASO: LISTAGEM (GET)
   * Objetivo: Ler todas as linhas da tabela 'Leads'.
   */
  if (req.method === 'GET') {
    try {
      // Executamos o comando SELECT no Postgres.
      const leads = await sql`SELECT * FROM Leads ORDER BY created_at DESC`;
      
      // Devolvemos um status 200 (OK) e os dados em formato JSON.
      return res.status(200).json(leads);
    } catch (error) {
      console.error('SERVER ERROR:', error);
      return res.status(500).json({ error: 'Erro ao conectar ao PostgreSQL' });
    }
  }

  /**
   * 📥 CASO: CRIAÇÃO (POST)
   * Objetivo: Inserir uma nova linha com os dados vindos do Frontend.
   */
  if (req.method === 'POST') {
    const { nome, email, telefone, servico, mensagem } = req.body;
    
    // Obtemos a origem do tráfego (Referer) para fins de BI (Business Intelligence).
    const origem = req.headers['referer'] || 'Direto/Sistema';

    try {
      // O comando INSERT grava os dados permanentemente no banco Neon.
      const result = await sql`
        INSERT INTO Leads (nome, email, telefone, servico, mensagem, origem) 
        VALUES (${nome}, ${email}, ${telefone}, ${servico}, ${mensagem}, ${origem}) 
        RETURNING *
      `;
      
      // Status 201: Significa que o recurso foi "Criado" com sucesso.
      return res.status(201).json(result[0]);
    } catch (error) {
      console.error('SERVER ERROR:', error);
      return res.status(500).json({ error: 'Falha na persistência dos dados' });
    }
  }

  /**
   * ❌ CASO: EXCLUSÃO (DELETE)
   * Objetivo: Remover um registro específico usando o ID.
   */
  if (req.method === 'DELETE') {
    const { id } = req.query; // Capturamos o ID via Query String (?id=123)
    try {
      await sql`DELETE FROM Leads WHERE id = ${id}`;
      return res.status(200).json({ success: true, message: 'Registro removido' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao executar DELETE no banco' });
    }
  }

  // Se o método não for GET, POST ou DELETE, avisamos que não é suportado.
  return res.status(405).json({ error: 'Método HTTP não permitido nesta rota.' });
}
