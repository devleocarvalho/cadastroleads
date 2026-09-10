/**
 * 🎓 LEADFLOW ENTERPRISE v3.0 - CRM & CYBER SECURITY LAB
 */

const learningLog = document.getElementById('learning-log');
const authIndicator = document.getElementById('auth-status-indicator');

// Estado Global da Aplicação
window.currentLeads = [];
window.filteredLeads = [];

// --- MONITOR DE CIBERSEGURANÇA ---
function logSecurity(title, message, type = 'system') {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    const icon = type === 'error' ? '🚫' : (type === 'response' ? '✅' : '🔒');
    entry.innerHTML = `<b>${icon} ${title}</b> <p>${message}</p> <span>${new Date().toLocaleTimeString()}</span>`;
    learningLog.prepend(entry);
}

// --- ON LOAD ---
document.addEventListener('DOMContentLoaded', () => {
    logSecurity('LAB INICIADO', 'Monitorando integridade das chamadas REST e cabeçalhos de autorização.');
    fetchLeads();
    
    // Listener para o campo de senha
    const keyInput = document.getElementById('admin-key-input');
    if (keyInput) {
        keyInput.addEventListener('input', (e) => {
            const hasValue = e.target.value.length > 0;
            authIndicator.innerHTML = hasValue 
                ? `<span class="status-dot active"></span> Modo: Tentativa Admin` 
                : `<span class="status-dot"></span> Modo: Visitante (Leitura)`;
        });
    }
});

// --- Helper para pegar a chave do admin ---
function getAdminKey() {
    return document.getElementById('admin-key-input')?.value || '';
}

// --- [VERIFY] HEAD ---
async function checkStatus() {
    logSecurity('HEAD Request', 'Disparando verificação rápida de integridade da API via HEAD.');
    try {
        const res = await fetch('/api/leads', { method: 'HEAD' });
        if (res.ok) {
            const serverStatus = res.headers.get('X-System-Status') || 'Operational';
            logSecurity('HEAD 200 OK', `API Online e responsiva. Status: ${serverStatus}`, 'response');
            showToast('API Online (Status 200 OK)');
        } else {
            logSecurity(`HEAD ${res.status}`, 'API retornou status inesperado.', 'error');
            showToast('API offline ou com instabilidade', 'error');
        }
    } catch (err) {
        logSecurity('Erro HEAD', 'Não foi possível conectar à API.', 'error');
        showToast('Falha na conexão com a API', 'error');
    }
}

// --- [VERIFY] OPTIONS ---
async function checkMethods() {
    logSecurity('OPTIONS Request', 'Consultando capacidades do servidor e métodos HTTP permitidos via OPTIONS.');
    try {
        const res = await fetch('/api/leads', { method: 'OPTIONS' });
        const allowHeader = res.headers.get('Allow') || 'GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS';
        logSecurity('OPTIONS 204', `Métodos HTTP aceitos pelo endpoint: [${allowHeader}]`, 'response');
        showToast(`Métodos Permitidos: ${allowHeader}`);
    } catch (err) {
        logSecurity('Erro OPTIONS', 'Falha ao consultar métodos OPTIONS.', 'error');
        showToast('Falha na requisição OPTIONS', 'error');
    }
}

// --- [READ] GET ---
async function fetchLeads() {
    const list = document.getElementById('leads-list');
    list.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem;">Consultando banco via GET Seguro...</td></tr>';
    
    try {
        const response = await fetch('/api/leads');
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Erro ao carregar leads');
        }

        logSecurity('GET (crm.Leads)', 'Leitura pública permitida no Schema CRM.', 'response');
        window.currentLeads = Array.isArray(data) ? data : [];
        updateKPIs(window.currentLeads);
        applyFilters();
    } catch (e) {
        logSecurity('Erro GET', 'Falha na conexão com o banco: ' + e.message, 'error');
        list.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--danger); padding: 2rem;">Erro ao conectar com o banco de dados: ${e.message}</td></tr>`;
        updateKPIs([]);
    }
}

// --- KPI METRICS ---
function updateKPIs(leads) {
    const list = Array.isArray(leads) ? leads : [];
    const total = list.length;
    const novos = list.filter(l => l.status === 'Novo').length;
    const contato = list.filter(l => l.status === 'Em Contato').length;
    const fechados = list.filter(l => l.status === 'Fechado').length;

    const elTotal = document.getElementById('kpi-total');
    const elNovos = document.getElementById('kpi-novos');
    const elContato = document.getElementById('kpi-contato');
    const elFechados = document.getElementById('kpi-fechados');

    if (elTotal) elTotal.innerText = total;
    if (elNovos) elNovos.innerText = novos;
    if (elContato) elContato.innerText = contato;
    if (elFechados) elFechados.innerText = fechados;
}

// --- FILTROS & BUSCA ---
function applyFilters() {
    const searchTerm = (document.getElementById('filter-search')?.value || '').toLowerCase().trim();
    const statusFilter = document.getElementById('filter-status')?.value || '';
    const servicoFilter = document.getElementById('filter-servico')?.value || '';

    const allLeads = window.currentLeads || [];
    window.filteredLeads = allLeads.filter(l => {
        const matchSearch = !searchTerm || 
            (l.nome && l.nome.toLowerCase().includes(searchTerm)) ||
            (l.email && l.email.toLowerCase().includes(searchTerm)) ||
            (l.telefone && l.telefone.toLowerCase().includes(searchTerm));
        
        const matchStatus = !statusFilter || l.status === statusFilter;
        const matchServico = !servicoFilter || l.servico === servicoFilter;

        return matchSearch && matchStatus && matchServico;
    });

    renderLeads(window.filteredLeads);
}

// --- EXPORTAR CSV ---
function exportCSV() {
    const leads = window.filteredLeads && window.filteredLeads.length > 0 
        ? window.filteredLeads 
        : (window.currentLeads || []);

    if (leads.length === 0) {
        showToast('Nenhum lead disponível para exportar.', 'error');
        return;
    }

    const headers = ['ID', 'Nome', 'Email', 'Telefone', 'Servico', 'Status', 'Mensagem', 'Data_Criacao'];
    const rows = leads.map(l => [
        l.id,
        `"${(l.nome || '').replace(/"/g, '""')}"`,
        `"${(l.email || '').replace(/"/g, '""')}"`,
        `"${(l.telefone || '').replace(/"/g, '""')}"`,
        `"${(l.servico || '').replace(/"/g, '""')}"`,
        `"${(l.status || '').replace(/"/g, '""')}"`,
        `"${(l.mensagem || '').replace(/"/g, '""')}"`,
        `"${l.created_at || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leads-leadflow-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logSecurity('CSV EXPORT', `${leads.length} leads exportados com sucesso.`, 'response');
    showToast(`${leads.length} leads exportados com sucesso!`);
}

// --- [CREATE] POST ---
document.getElementById('form-lead').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        nome: document.getElementById('lead-nome').value.trim(),
        email: document.getElementById('lead-email').value.trim(),
        telefone: document.getElementById('lead-telefone').value.trim(),
        servico: document.getElementById('lead-servico').value,
        mensagem: document.getElementById('lead-mensagem').value.trim() || null
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
            logSecurity('HTTP 201 Created', `Lead "${data.nome}" salvo no CRM e Conta sincronizada no Billing.`, 'response');
            showToast('Lead cadastrado com sucesso!');
            document.getElementById('form-lead').reset();
            showSection('dashboard');
            fetchLeads();
        } else {
            logSecurity('Erro POST', data.error || 'Falha ao salvar lead.', 'error');
            showToast(data.error || 'Erro ao cadastrar lead.', 'error');
        }
    } catch (err) {
        logSecurity('Erro POST', 'Falha na comunicação de rede.', 'error');
        showToast('Erro de conexão com o servidor.', 'error');
    }
});

// --- MODAL & [UPDATE] PUT (Substituição Completa) ---
function openEditModal(id) {
    const lead = window.currentLeads?.find(l => l.id === id);
    if (!lead) return;

    document.getElementById('edit-id').value = lead.id;
    document.getElementById('edit-nome').value = lead.nome || '';
    document.getElementById('edit-email').value = lead.email || '';
    document.getElementById('edit-telefone').value = lead.telefone || '';
    document.getElementById('edit-servico').value = lead.servico || 'Consultoria';
    document.getElementById('edit-status').value = lead.status || 'Novo';
    document.getElementById('edit-mensagem').value = lead.mensagem || '';

    document.getElementById('modal-edit').classList.remove('hidden');
    lucide.createIcons();
}

function closeEditModal() {
    document.getElementById('modal-edit').classList.add('hidden');
}

async function submitEditLead(e) {
    e.preventDefault();
    const id = Number(document.getElementById('edit-id').value);
    const payload = {
        id,
        nome: document.getElementById('edit-nome').value.trim(),
        email: document.getElementById('edit-email').value.trim(),
        telefone: document.getElementById('edit-telefone').value.trim() || null,
        servico: document.getElementById('edit-servico').value,
        status: document.getElementById('edit-status').value,
        mensagem: document.getElementById('edit-mensagem').value.trim() || null
    };

    const key = getAdminKey();
    logSecurity('PUT (crm.Leads)', `Substituição completa do Lead ID ${id} via Modal PUT.`);

    try {
        const res = await fetch('/api/leads', {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'x-admin-key': key 
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.status === 401) {
            logSecurity('Auth Error 401', 'Ação PUT bloqueada. Chave de administrador ausente ou inválida.', 'error');
            showToast('Acesso Negado! Chave admin necessária.', 'error');
        } else if (!res.ok) {
            logSecurity(`Erro PUT (${res.status})`, data.error, 'error');
            showToast(data.error, 'error');
        } else {
            logSecurity('HTTP 200 OK', `Lead ID ${id} atualizado completamente via PUT no Schema CRM.`, 'response');
            showToast('Lead atualizado com sucesso!');
            closeEditModal();
            fetchLeads();
        }
    } catch (err) {
        logSecurity('Erro PUT', 'Falha na requisição.', 'error');
        showToast('Erro de comunicação com o servidor.', 'error');
    }
}

// --- [UPDATE] PATCH (Status Único) ---
async function updateStatus(id, currentStatus) {
    const newStatus = currentStatus === 'Novo' ? 'Em Contato' : (currentStatus === 'Em Contato' ? 'Fechado' : 'Novo');
    const key = getAdminKey();

    logSecurity('PATCH (crm.Leads)', `Alteração parcial de status do Lead ID ${id} -> "${newStatus}".`);

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
            showToast('Acesso Negado! Chave admin necessária.', 'error');
        } else if (!res.ok) {
            logSecurity(`Erro PATCH (${res.status})`, data.error, 'error');
            showToast(data.error, 'error');
        } else {
            logSecurity('HTTP 200 OK', `Status alterado para "${newStatus}" no Schema CRM.`, 'response');
            fetchLeads();
        }
    } catch (err) {
        logSecurity('Erro PATCH', 'Falha na requisição.', 'error');
    }
}

// --- [DELETE] Delete com Trigger ---
async function deleteLead(id) {
    if (!confirm('Deseja realmente deletar este lead? Esta ação será registrada no schema audit.')) return;
    const key = getAdminKey();

    logSecurity('DELETE (crm.Leads)', `Remoção do Lead ID ${id} via CRM Schema. Acionando Gatilho de Auditoria (audit.Log).`);

    try {
        const res = await fetch(`/api/leads?id=${id}`, {
            method: 'DELETE',
            headers: { 'x-admin-key': key }
        });

        const data = await res.json();

        if (res.status === 401) {
            logSecurity('Auth Error 401', 'Ação bloqueada no Schema CRM. Chave administrativa incorreta.', 'error');
            showToast('Chave Errada!', 'error');
        } else if (!res.ok) {
            logSecurity(`Erro DELETE (${res.status})`, data.error, 'error');
            showToast(data.error, 'error');
        } else {
            logSecurity('HTTP 200 OK', 'Registro removido e Trigger audit.log_lead_deletion executada.', 'response');
            showToast('Lead excluído e auditado!');
            fetchLeads();
        }
    } catch (err) {
        logSecurity('Erro DELETE', 'Falha na requisição.', 'error');
    }
}

// --- PORTAL DO CLIENTE ---
async function consultarSaldo() {
    const email = document.getElementById('consulta-email').value.trim();
    const box = document.getElementById('resultado-consulta');
    if (!email) {
        showToast('Digite um e-mail para consultar.', 'error');
        return;
    }

    logSecurity('GET (billing.Contas)', `Consultando saldo direto no Schema de Faturamento para ${email}.`);
    box.classList.remove('hidden');
    box.innerHTML = 'Pesquisando no Schema Billing...';

    try {
        const res = await fetch(`/api/consulta?email=${encodeURIComponent(email)}`);
        const data = await res.json();

        if (res.ok) {
            logSecurity('Data Recv', 'Informação do Schema Billing recuperada com sucesso.', 'response');
            box.innerHTML = `
                <div style="line-height: 1.6;">
                    <b>E-mail:</b> ${data.email}<br>
                    <b>Saldo de Horas:</b> <span style="color: var(--success); font-size: 1.2rem; font-weight: bold;">${data.saldo}h</span><br>
                    <b>Status:</b> <span class="status-badge" data-status="${data.status === 'Ativo' ? 'Fechado' : 'Novo'}">${data.status}</span>
                </div>
            `;
        } else {
            logSecurity(`Consulta (${res.status})`, data.error, 'error');
            box.innerHTML = `<span style="color: var(--danger);">${data.error || 'Cliente não encontrado.'}</span>`;
        }
    } catch (e) {
        box.innerHTML = '<span style="color: var(--danger);">Falha ao consultar faturamento.</span>';
    }
}

// --- AUDIT LOGS ---
async function fetchAuditLogs() {
    const list = document.getElementById('audit-list');
    if (!list) return;
    list.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem;">Buscando registros do schema audit.Log...</td></tr>';
    const key = getAdminKey();

    logSecurity('GET (audit.Log)', 'Consultando registros de auditoria gravados pela Trigger PL/pgSQL.');

    try {
        const res = await fetch('/api/audit', {
            headers: { 'x-admin-key': key }
        });
        const data = await res.json();

        if (res.status === 401) {
            logSecurity('Auth Error 401', 'Acesso ao schema de auditoria negado. Chave admin requerida.', 'error');
            list.innerHTML = '<tr><td colspan="4" style="text-align:center; color: #fbbf24; padding: 2rem;">🔒 Acesso Restrito. Insira a Chave do Admin (admin123) na barra lateral esquerda para visualizar os logs de auditoria.</td></tr>';
            showToast('Insira a chave admin para ver auditoria.', 'error');
            return;
        }

        if (!res.ok) {
            logSecurity(`Erro Audit (${res.status})`, data.error, 'error');
            list.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--danger); padding: 2rem;">${data.error}</td></tr>`;
            return;
        }

        logSecurity('HTTP 200 OK', `${data.length} logs de auditoria recuperados do PostgreSQL.`, 'response');

        if (data.length === 0) {
            list.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem; color: #94a3b8;">Nenhum log registrado ainda. Delete um lead no Dashboard para ver o gatilho (Trigger) em ação!</td></tr>';
            return;
        }

        list.innerHTML = data.map(log => {
            const oldData = log.dados_anteriores || {};
            const dataStr = new Date(log.executado_em).toLocaleString('pt-BR');
            return `
                <tr>
                    <td>
                        <span class="status-badge" style="background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4);">
                            #${log.id} ${log.acao}
                        </span>
                    </td>
                    <td><code>${log.tabela}</code></td>
                    <td>
                        <b>${oldData.nome || 'N/A'}</b><br>
                        <small style="color: #94a3b8;">${oldData.email || 'N/A'}</small>
                        ${oldData.servico ? `<br><small style="color:#818cf8;">Serviço: ${oldData.servico}</small>` : ''}
                    </td>
                    <td style="font-size: 0.8rem; color: #94a3b8;">${dataStr}</td>
                </tr>
            `;
        }).join('');
        lucide.createIcons();
    } catch (err) {
        logSecurity('Erro Audit', 'Falha ao buscar logs de auditoria.', 'error');
        list.innerHTML = '<tr><td colspan="4" style="text-align:center; color: var(--danger); padding: 2rem;">Falha na conexão com o servidor.</td></tr>';
    }
}

// --- RENDER LEADS ---
function renderLeads(leads) {
    const list = document.getElementById('leads-list');
    if (!list) return;

    if (!Array.isArray(leads) || leads.length === 0) {
        list.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem; color: #94a3b8;">Nenhum lead encontrado para os filtros selecionados.</td></tr>';
        return;
    }

    list.innerHTML = leads.map(l => `
        <tr>
            <td>
                <span class="status-badge" onclick="updateStatus(${l.id}, '${l.status}')" data-status="${l.status}" title="Clique para alternar o status via PATCH">
                    ${l.status}
                </span>
            </td>
            <td>
                <b>${l.nome}</b><br>
                <small style="color: #94a3b8;">${l.email}</small>
                ${l.telefone ? `<br><small style="color: #64748b;">📞 ${l.telefone}</small>` : ''}
                ${l.mensagem ? `<br><small style="color: #94a3b8; font-style: italic;">"${l.mensagem}"</small>` : ''}
            </td>
            <td>
                <span style="background: rgba(255,255,255,0.06); padding: 0.3rem 0.6rem; border-radius: 6px; font-size: 0.8rem;">
                    ${l.servico || 'Geral'}
                </span>
            </td>
            <td>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-action edit" onclick="openEditModal(${l.id})" title="Editar Lead (PUT)">
                        <i data-lucide="pencil"></i>
                    </button>
                    <button class="btn-action delete" onclick="deleteLead(${l.id})" title="Excluir Lead (DELETE)">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    lucide.createIcons();
}

// --- UI HELPERS ---
function showSection(id) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    
    const targetSection = document.getElementById(`section-${id}`);
    const targetNav = document.getElementById(`nav-${id}`);
    
    if (targetSection) targetSection.classList.add('active');
    if (targetNav) targetNav.classList.add('active');

    if (id === 'auditoria') {
        fetchAuditLogs();
    } else if (id === 'dashboard') {
        fetchLeads();
    }
}

function showToast(m, type = 'success') {
    const t = document.getElementById('toast');
    const msg = document.getElementById('toast-message');
    if (msg) {
        msg.textContent = m;
    } else {
        t.innerHTML = m;
    }
    t.className = `toast ${type}`;
    t.classList.remove('hidden');
    setTimeout(() => t.classList.add('hidden'), 3500);
}
