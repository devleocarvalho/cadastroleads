/**
 * 🎓 LEADFLOW ENTERPRISE - JAVASCRIPT LOGIC
 * 
 * Este arquivo orquestra a comunicação entre a interface do usuário (Browser)
 * e o servidor (Vercel API + Neon PostgreSQL).
 * 
 * --- CONCEITOS INTEGRADOS ---
 * 1. DOM SELECTORS: Captura de elementos da tela.
 * 2. FETCH API: O protocolo para falar com APIs via HTTP.
 * 3. JSON: O formato universal de troca de dados na TI.
 * 4. FEEDBACK LOOP: Notificar o usuário sobre o que está ocorrendo.
 */

// --- ⚙️ SELETORES DE INTERFACE ---
const formLead = document.getElementById('form-lead');
const btnSubmit = document.getElementById('btn-submit');
const leadsList = document.getElementById('leads-list');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');
const learningLog = document.getElementById('learning-log');

/**
 * 📖 LOGGER PEDAGÓGICO
 * Injeta explicações técnicas no terminal lateral da aplicação.
 */
function logLearning(title, message, type = 'system') {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.innerHTML = `
        <b>🤖 ${title}</b>
        <p>${message}</p>
        <span>${new Date().toLocaleTimeString()}</span>
    `;
    learningLog.prepend(entry);
}

/**
 * 🚀 BOOTSTRAP: O que acontece quando o site abre?
 */
document.addEventListener('DOMContentLoaded', () => {
    logLearning('APP OPERACIONAL', 'O Frontend carregou e está pronto para consumir a API local.');
    fetchLeads(); // Já busca os dados existentes assim que carrega.
});

/**
 * 📥 OPERAÇÃO: CREATE (POST Requisição)
 * DICA DE TI: Usamos o método POST para enviar informações sensíveis ou grandes volumes de dados.
 */
formLead.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita que o formulário recarregue a página (Padrão AJAX/SPA)
    
    // Agrupamento dos dados em um único objeto JSON (JavaScript Object Notation)
    const payload = {
        nome: document.getElementById('lead-nome').value,
        email: document.getElementById('lead-email').value,
        telefone: document.getElementById('lead-telefone').value,
        servico: document.getElementById('lead-servico').value,
        mensagem: document.getElementById('lead-mensagem').value
    };

    logLearning('MÉTODO: POST', `Enviando pacote JSON com ${Object.keys(payload).length} campos para o PostgreSQL.`);
    setLoading(true, btnSubmit);

    try {
        // Fetch: Faz a chamada de rede para a nossa API Serverless na Vercel.
        const response = await fetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }, // Dizemos ao servidor que estamos mandando um JSON.
            body: JSON.stringify(payload) // Transforma o objeto em String para a viagem.
        });

        if (!response.ok) throw new Error('Falha no Servidor');

        logLearning('HTTP 201 CREATED', 'O servidor confirmou a gravação do novo lead com sucesso!');
        showToast('Sucesso! Lead capturado. ✅');
        formLead.reset();
        fetchLeads(); // Atualiza a lista visual automaticamente.
    } catch (error) {
        logLearning('ERRO DE REDE', 'Não foi possível falar com a API. Verifique sua conexão.', 'error');
        showToast('Erro ao enviar dados.', 'error');
    } finally {
        setLoading(false, btnSubmit);
    }
});

/**
 * 🔍 OPERAÇÃO: READ (GET Requisição)
 * DICA DE TI: O método GET é usado para solicitar dados. Ele é o padrão de todos os navegadores.
 */
async function fetchLeads() {
    leadsList.innerHTML = '<tr><td colspan="4">Conectando ao Neon...</td></tr>';
    logLearning('MÉTODO: GET', 'Solicitando a lista atualizada de registros do CRM.');
    
    try {
        const response = await fetch('/api/leads');
        const data = await response.json();
        
        logLearning('DADOS CARREGADOS', `A API devolveu uma lista com ${data.length} objetos JSON.`);
        renderLeads(data);
    } catch (error) {
        logLearning('FALHA DE COMUNICAÇÃO', 'O banco de dados não pôde ser alcançado.', 'error');
        leadsList.innerHTML = '<tr><td colspan="4">Erro técnico ao carregar leads.</td></tr>';
    }
}

/**
 * 🖼️ RENDERIZADOR Dinâmico
 * Transforma Arrays do JavaScript em linhas de Tabela (HTML).
 */
function renderLeads(leads) {
    if (!leads || leads.length === 0) {
        leadsList.innerHTML = '<tr><td colspan="4">Nenhum lead encontrado no banco.</td></tr>';
        return;
    }

    leadsList.innerHTML = leads.map(lead => `
        <tr>
            <td><span class="status-badge">${lead.status || 'Novo'}</span></td>
            <td>
                <div class="lead-info">
                    <strong>${lead.nome}</strong>
                    <span class="lead-email">${lead.email}</span>
                </div>
            </td>
            <td>${lead.servico}</td>
            <td>
                <div class="action-group">
                    <button class="btn-action whatsapp" onclick="window.open('https://wa.me/55${lead.telefone.replace(/\D/g, '')}')">Whats</button>
                    <button class="btn-action delete" onclick="deleteLead(${lead.id})">Apagar</button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * ❌ OPERAÇÃO: DELETE
 */
async function deleteLead(id) {
    if (!confirm('Deseja deletar este registro permanentemente do PostgreSQL?')) return;
    
    logLearning('MÉTODO: DELETE', `Solicitando remoção da linha com ID: ${id}.`);
    try {
        const res = await fetch(`/api/leads?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
            logLearning('HTTP 200 OK', 'O registro foi removido com sucesso da nuvem.');
            showToast('Deletado com sucesso!');
            fetchLeads();
        }
    } catch (error) {
        showToast('Erro ao remover.', 'error');
    }
}

/**
 * --- UTILS E UI CONTROLLERS ---
 */
function showSection(sectionId) {
    document.querySelectorAll('.nav-link').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`nav-${sectionId}`).classList.add('active');
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.getElementById(`section-${sectionId}`).classList.add('active');
    if (sectionId === 'dashboard') fetchLeads();
}

function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 4000);
}

function setLoading(isLoading, button) {
    const text = button.querySelector('.btn-text');
    const loader = button.querySelector('.btn-loader');
    if (isLoading) {
        button.disabled = true;
        text.classList.add('hidden');
        loader.classList.remove('hidden');
    } else {
        button.disabled = false;
        text.classList.remove('hidden');
        loader.classList.add('hidden');
    }
}
