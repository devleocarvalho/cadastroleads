/**
 * 🎓 LEADFLOW ENTERPRISE - CRM FULL CRUD
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
    logLearning('LABORATÓRIO CRUD ATIVO', 'O sistema agora suporta as 4 operações: <b>Create, Read, Update e Delete</b>.');
    fetchLeads();
});

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

    logLearning('MÉTODO: POST (Create)', 'Enviando nova linha para o PostgreSQL.');
    setLoading(true, btnSubmit);

    try {
        const response = await fetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error();
        logLearning('HTTP 201', 'Lead persistido com sucesso.', 'response');
        showToast('Cadastrado! ✅');
        formLead.reset();
        fetchLeads();
    } catch (error) {
        showToast('Erro ao cadastrar.', 'error');
    } finally {
        setLoading(false, btnSubmit);
    }
});

// --- [READ] GET ---
async function fetchLeads() {
    leadsList.innerHTML = '<tr><td colspan="4">Consultando banco...</td></tr>';
    logLearning('MÉTODO: GET (Read)', 'Solicitando lista de registros.');
    try {
        const response = await fetch('/api/leads');
        const data = await response.json();
        logLearning('DADOS RECEBIDOS', `${data.length} leads retornados em formato JSON.`, 'response');
        renderLeads(data);
    } catch (error) {
        leadsList.innerHTML = '<tr><td colspan="4">Erro de conexão.</td></tr>';
    }
}

// --- [UPDATE] PATCH ---
// DICA DE TI: Usamos PATCH para atualizar apenas uma parte do registro.
async function updateStatus(id, currentStatus) {
    const statuses = ['Novo', 'Em Contato', 'Fechado'];
    let nextIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length;
    const newStatus = statuses[nextIndex];

    logLearning('MÉTODO: PATCH (Update)', `Alterando status do ID ${id} para <b>${newStatus}</b>.`);

    try {
        const response = await fetch('/api/leads', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status: newStatus })
        });

        if (response.ok) {
            logLearning('HTTP 200 OK', 'Status atualizado no PostgreSQL.', 'response');
            fetchLeads(); // Recarrega a lista para mostrar a mudança.
        }
    } catch (error) {
        logLearning('ERRO NO UPDATE', 'Não foi possível salvar o novo status.', 'error');
    }
}

// --- [DELETE] DELETE ---
async function deleteLead(id) {
    if (!confirm('Excluir permanentemente?')) return;
    logLearning('MÉTODO: DELETE (Delete)', `Removendo ID ${id} do banco.`);
    try {
        const res = await fetch(`/api/leads?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
            logLearning('HTTP 200 OK', 'Registro apagado fisicamente.', 'response');
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
        leadsList.innerHTML = '<tr><td colspan="4" class="empty-state">Banco de dados vazio. Nenhum lead capturado ainda.</td></tr>';
        return;
    }
    leadsList.innerHTML = leads.map(lead => `
        <tr>
            <td>
                <span class="status-badge cursor-pointer" 
                      data-status="${lead.status || 'Novo'}" 
                      onclick="updateStatus(${lead.id}, '${lead.status}')" 
                      title="Clique para mudar status">
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
                    <button class="btn-action whatsapp" 
                            onclick="window.open('https://wa.me/55${lead.telefone.replace(/\D/g, '')}')"
                            title="Conversar no WhatsApp">
                        <i data-lucide="message-circle" class="icon-sm"></i>
                    </button>
                    <button class="btn-action delete" 
                            onclick="deleteLead(${lead.id})"
                            title="Excluir Registro">
                        <i data-lucide="trash-2" class="icon-sm"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    // Recarregar ícones Lucide após injetar HTML dinâmico
    if (window.lucide) {
        lucide.createIcons();
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
