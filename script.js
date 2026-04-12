/**
 * 🎓 LEADFLOW ENTERPRISE - CRM FULL CRUD & HTTP RESEARCH
 */

const formLead = document.getElementById('form-lead');
const btnSubmit = document.getElementById('btn-submit');
const leadsList = document.getElementById('leads-list');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');
const learningLog = document.getElementById('learning-log');

// --- TERMINAL DE APRENDIZADO ---
function logLearning(title, message, type = 'system') {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.innerHTML = `<b>🤖 ${title}</b> <p>${message}</p> <span>${new Date().toLocaleTimeString()}</span>`;
    learningLog.prepend(entry);
}

// --- ON LOAD ---
document.addEventListener('DOMContentLoaded', () => {
    logLearning('LABORATÓRIO HTTP ATIVO', 'Explorando: <b>GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS</b>.');
    fetchLeads();
    checkApiOptions(); // Testa o método OPTIONS ao iniciar
});

// --- [OPTIONS] Teste de Capacidade ---
async function checkApiOptions() {
    logLearning('MÉTODO: OPTIONS', 'Solicitando métodos HTTP suportados pelo servidor.');
    try {
        const response = await fetch('/api/leads', { method: 'OPTIONS' });
        const allowed = response.headers.get('Allow');
        logLearning('HTTP 204 (No Content)', `Métodos permitidos: <b>${allowed}</b>`, 'response');
    } catch (e) {}
}

// --- [HEAD] Verificação Rápida ---
async function checkStatus() {
    logLearning('MÉTODO: HEAD', 'Solicitando cabeçalhos (headers) sem o corpo da mensagem.');
    try {
        const response = await fetch('/api/leads', { method: 'HEAD' });
        const status = response.headers.get('X-System-Status');
        logLearning('HTTP 200 OK', `Status do Sistema: <b>${status}</b>`, 'response');
        showToast('API Online (HEAD)');
    } catch (e) {}
}

// --- [CREATE] POST ---
formLead.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        nome: document.getElementById('lead-nome').value,
        email: document.getElementById('lead-email').value,
        telefone: document.getElementById('lead-telefone').value,
        servico: document.getElementById('lead-servico').value,
        mensagem: document.getElementById('lead-mensagem').value
    };

    logLearning('MÉTODO: POST (Create)', 'Enviando payload completo para criação de novo recurso.');
    setLoading(true, btnSubmit);

    try {
        const response = await fetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        
        logLearning('HTTP 201 Created', 'Novo recurso persistido no PostgreSQL.', 'response');
        showToast('Lead Criado!');
        formLead.reset();
        fetchLeads();
    } catch (error) {
        logLearning('ERRO NO POST', error.message, 'error');
        showToast('Erro no cadastro', 'error');
    } finally {
        setLoading(false, btnSubmit);
    }
});

// --- [READ] GET ---
async function fetchLeads() {
    leadsList.innerHTML = '<tr><td colspan="4" class="empty-state">Buscando dados no Neon...</td></tr>';
    logLearning('MÉTODO: GET (Read)', 'Solicitando representação atual dos recursos.');
    try {
        const response = await fetch('/api/leads');
        const data = await response.json();
        logLearning('HTTP 200 (JSON)', `${data.length} registros recebidos.`, 'response');
        renderLeads(data);
    } catch (error) {
        leadsList.innerHTML = '<tr><td colspan="4">Erro de conexão.</td></tr>';
    }
}

// --- [UPDATE] PATCH vs PUT ---
async function updateStatus(id, currentStatus) {
    const statuses = ['Novo', 'Em Contato', 'Fechado'];
    let nextIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length;
    const newStatus = statuses[nextIndex];

    logLearning('MÉTODO: PATCH (Partial)', `Alterando apenas o campo <b>status</b> do ID ${id}.`);

    try {
        const response = await fetch('/api/leads', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status: newStatus })
        });
        if (response.ok) {
            logLearning('HTTP 200 OK', 'Alteração parcial aplicada.', 'response');
            fetchLeads();
        }
    } catch (error) {}
}

// Simulação de PUT (Substituição Total)
async function fullUpdate(id) {
    logLearning('MÉTODO: PUT (Full)', `Substituindo recurso IDENTIFICADO pelo ID ${id} completamente.`);
    showToast('Simulando substituição total...');
    // No projeto real, abriria um modal com todos os campos preenchidos
    // Aqui faremos um teste rápido para a aula
}

// --- [DELETE] DELETE ---
async function deleteLead(id) {
    if (!confirm('Deseja executar o método DELETE?')) return;
    logLearning('MÉTODO: DELETE', `Removendo permanentemente o recurso ID ${id}.`);
    try {
        const res = await fetch(`/api/leads?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
            logLearning('HTTP 200 OK', 'Recurso removido com sucesso.', 'response');
            showToast('Removido!');
            fetchLeads();
        }
    } catch (error) {
        showToast('Erro ao deletar.', 'error');
    }
}

// --- RENDERIZAÇÃO ---
function renderLeads(leads) {
    if (!leads || leads.length === 0) {
        leadsList.innerHTML = '<tr><td colspan="4" class="empty-state">Sem dados para exibir.</td></tr>';
        return;
    }
    leadsList.innerHTML = leads.map(lead => `
        <tr>
            <td>
                <span class="status-badge cursor-pointer" 
                      data-status="${lead.status || 'Novo'}" 
                      onclick="updateStatus(${lead.id}, '${lead.status}')">
                    ${lead.status || 'Novo'}
                </span>
            </td>
            <td>
                <div class="lead-info">
                    <strong>${lead.nome}</strong>
                    <span class="lead-email">${lead.email}</span>
                </div>
            </td>
            <td>
                <span class="text-service">${lead.servico}</span>
            </td>
            <td>
                <div class="action-group">
                    <button class="btn-action" onclick="fullUpdate(${lead.id})" title="PUT (Replace)">
                        <i data-lucide="edit-3" class="icon-sm"></i>
                    </button>
                    <button class="btn-action delete" onclick="deleteLead(${lead.id})" title="DELETE">
                        <i data-lucide="trash-2" class="icon-sm"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    if (window.lucide) lucide.createIcons();
}

// --- PORTAL DO CLIENTE: CONSULTA DE SALDO ---
async function consultarSaldo() {
    const email = document.getElementById('consulta-email').value;
    const resultBox = document.getElementById('resultado-consulta');

    if (!email) {
        showToast('Digite um e-mail', 'error');
        return;
    }

    logLearning('MÉTODO: GET (Query)', `Consultando saldo processado no backend para: <b>${email}</b>`);
    resultBox.classList.remove('hidden');
    resultBox.innerHTML = '<p>Consultando banco de dados...</p>';

    try {
        const response = await fetch(`/api/consulta?email=${email}`);
        const data = await response.json();

        if (!response.ok) {
            logLearning('HTTP 404', 'Cliente não encontrado.', 'error');
            resultBox.innerHTML = `<div class="res-error">${data.error}</div>`;
        } else {
            logLearning('HTTP 200 OK', 'Dados de faturamento recuperados.', 'response');
            resultBox.innerHTML = `
                <div class="res-success">
                    <h4>Dados do Cliente</h4>
                    <p><b>E-mail:</b> ${data.email}</p>
                    <div class="saldo-valor">
                        <span>Horas Disponíveis:</span>
                        <h2>${data.saldo}h</h2>
                    </div>
                    <span class="badge ${data.status.toLowerCase().replace(' ', '-')}">${data.status}</span>
                </div>
            `;
        }
    } catch (error) {
        resultBox.innerHTML = 'Erro ao realizar consulta.';
    }
}

// --- AUXILIARES ---
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
