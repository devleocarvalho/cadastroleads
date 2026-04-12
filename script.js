/**
 * 🎓 LEADFLOW ENTERPRISE v3.0 - CRM & CYBER SECURITY LAB
 */

const learningLog = document.getElementById('learning-log');
const authIndicator = document.getElementById('auth-status-indicator');

// --- MONITOR DE CIBERSEGURANÇA ---
function logSecurity(title, message, type = 'system') {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    // Ícones baseados no tipo de log
    const icon = type === 'error' ? '🚫' : (type === 'response' ? '✅' : '🔒');
    entry.innerHTML = `<b>${icon} ${title}</b> <p>${message}</p> <span>${new Date().toLocaleTimeString()}</span>`;
    learningLog.prepend(entry);
}

// --- ON LOAD ---
document.addEventListener('DOMContentLoaded', () => {
    logSecurity('LAB INICIADO', 'Monitorando integridade das chamadas REST e cabeçalhos de autorização.');
    fetchLeads();
    
    // Listener para o campo de senha
    document.getElementById('admin-key-input').addEventListener('input', (e) => {
        const hasValue = e.target.value.length > 0;
        authIndicator.innerHTML = hasValue 
            ? `<span class="status-dot active"></span> Modo: Tentativa Admin` 
            : `<span class="status-dot"></span> Modo: Visitante (Leitura)`;
    });
});

// Helper para pegar a chave do admin
function getAdminKey() {
    return document.getElementById('admin-key-input').value;
}

// --- [READ] GET ---
async function fetchLeads() {
    const list = document.getElementById('leads-list');
    list.innerHTML = '<tr><td colspan="4">Consultando banco via GET Seguro...</td></tr>';
    
    try {
        const response = await fetch('/api/leads');
        const data = await response.json();
        logSecurity('GET (crm.Leads)', 'Leitura pública permitida no Schema CRM.', 'response');
        renderLeads(data);
    } catch (e) {
        logSecurity('Erro GET', 'Falha na conexão com o banco.', 'error');
    }
}

// --- [CREATE] POST ---
document.getElementById('form-lead').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        nome: document.getElementById('lead-nome').value,
        email: document.getElementById('lead-email').value,
        telefone: document.getElementById('lead-telefone').value, // Embora não usemos no banco agora, mantemos o payload
        servico: document.getElementById('lead-servico').value
    };

    logSecurity('POST Request', 'Sincronizando dados entre crm.Leads e billing.Contas.');

    try {
        const res = await fetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok) {
            logSecurity('HTTP 201', 'Lead salvo no CRM e Conta criada no Billing.', 'response');
            showToast('Sucesso!');
            fetchLeads();
        } else {
            logSecurity('Erro 409', data.error, 'error');
            showToast(data.error, 'error');
        }
    } catch (err) {}
});

// --- [UPDATE] PATCH (SECRET!) ---
async function updateStatus(id, currentStatus) {
    const newStatus = currentStatus === 'Novo' ? 'Em Contato' : 'Fechado';
    const key = getAdminKey();

    logSecurity('PATCH (crm.Leads)', `Tentativa de acesso administrativo no Schema CRM para ID ${id}.`);

    try {
        const res = await fetch('/api/leads', {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'x-admin-key': key 
            },
            body: JSON.stringify({ id, status: newStatus })
        });
        
        const data = await res.json();

        if (res.status === 401) {
            logSecurity('401 Unauthorized', data.error, 'error');
            showToast('Acesso Negado!', 'error');
        } else {
            logSecurity('HTTP 200', 'Status alterado no Schema CRM.', 'response');
            fetchLeads();
        }
    } catch (err) {}
}

// --- [DELETE] (SECRET!) ---
async function deleteLead(id) {
    if(!confirm('Deseja deletar?')) return;
    const key = getAdminKey();

    logSecurity('DELETE (crm.Leads)', 'Remoção via CRM Schema. Acionando Gatilho de Auditoria (audit.Log).');

    try {
        const res = await fetch(`/api/leads?id=${id}`, {
            method: 'DELETE',
            headers: { 'x-admin-key': key }
        });

        if (res.status === 401) {
            logSecurity('Auth Error', 'Ação bloqueada no Schema CRM.', 'error');
            showToast('Chave Errada!', 'error');
        } else {
            logSecurity('HTTP 200', 'Registro removido e Log de auditoria gerado.', 'response');
            fetchLeads();
        }
    } catch (err) {}
}

// --- PORTAL DO CLIENTE ---
async function consultarSaldo() {
    const email = document.getElementById('consulta-email').value;
    const box = document.getElementById('resultado-consulta');
    if(!email) return;

    logSecurity('GET (billing.Contas)', `Consultando saldo direto no Schema de Faturamento.`);
    box.classList.remove('hidden');
    box.innerHTML = 'Pesquisando...';

    try {
        const res = await fetch(`/api/consulta?email=${email}`);
        const data = await res.json();

        if (res.ok) {
            logSecurity('Data Recv', 'Informação sensível do Schema Billing recuperada.', 'response');
            box.innerHTML = `Saldo: <b>${data.saldo}h</b> <br> Status: ${data.status}`;
        } else {
            box.innerHTML = 'Cliente não encontrado.';
        }
    } catch (e) {}
}

// --- RENDER ---
function renderLeads(leads) {
    const list = document.getElementById('leads-list');
    list.innerHTML = leads.map(l => `
        <tr>
            <td><span class="status-badge" onclick="updateStatus(${l.id}, '${l.status}')" data-status="${l.status}">${l.status}</span></td>
            <td><b>${l.nome}</b><br><small>${l.email}</small></td>
            <td>${l.servico}</td>
            <td>
                <button class="btn-action delete" onclick="deleteLead(${l.id})">
                    <i data-lucide="trash-2"></i>
                </button>
            </td>
        </tr>
    `).join('');
    lucide.createIcons();
}

// UI HELPERS
function showSection(id) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.getElementById(`section-${id}`).classList.add('active');
    document.getElementById(`nav-${id}`).classList.add('active');
}

function showToast(m, type='success') {
    const t = document.getElementById('toast');
    t.innerHTML = m;
    t.className = `toast ${type}`;
    t.classList.remove('hidden');
    setTimeout(() => t.classList.add('hidden'), 3000);
}
