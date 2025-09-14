/**
 * ================================================================
 * SCRIPT: Restaurar Sistema Completo de Doadores
 * ================================================================
 * 
 * VERSÃO: 1.3.0
 * DATA: 12/09/2025
 * OBJETIVO: Restaurar completamente a funcionalidade de doadores
 * 
 * DESCRIÇÃO:
 * Restaura o sistema de doadores que existia antes:
 * - Adiciona rotas no server.js
 * - Cria interface de doadores no dashboard
 * - Adiciona modal de cadastro/edição
 * - Implementa busca e listagem
 * 
 * ================================================================
 */

const fs = require('fs');
const path = require('path');

console.log('╔════════════════════════════════════════════════════╗');
console.log('║   RESTAURAÇÃO DE DOADORES - SISTEMA v1.3.0        ║');
console.log('╚════════════════════════════════════════════════════╝');
console.log(`\nData/Hora: ${new Date().toLocaleString('pt-BR')
// Abrir modal de novo doador
function openDonorModal(doadorId) {
    const modal = document.getElementById('modal-doador');
    const title = document.getElementById('modal-doador-title');
    
    if (!modal) return;
    
    currentEditingDonorId = doadorId || null;
    
    if (doadorId) {
        title.textContent = 'Editar Doador';
        loadDonorData(doadorId);
    } else {
        title.textContent = 'Novo Doador';
        clearDonorFields();
    }
    
    modal.style.display = 'flex';
}

// Carregar dados do doador para edição
async function loadDonorData(doadorId) {
    try {
        const response = await fetch('/api/doadores/' + doadorId);
        if (!response.ok) throw new Error('Doador não encontrado');
        
        const doador = await response.json();
        
        document.getElementById('doador-nome').value = doador.nome || '';
        document.getElementById('doador-cpf').value = doador.cpf || '';
        document.getElementById('doador-email').value = doador.email || '';
        document.getElementById('doador-telefone1').value = doador.telefone1 || '';
        document.getElementById('doador-telefone2').value = doador.telefone2 || '';
        document.getElementById('doador-cep').value = doador.cep || '';
        document.getElementById('doador-logradouro').value = doador.logradouro || '';
        document.getElementById('doador-numero').value = doador.numero || '';
        document.getElementById('doador-complemento').value = doador.complemento || '';
        document.getElementById('doador-bairro').value = doador.bairro || '';
        document.getElementById('doador-cidade').value = doador.cidade || '';
        document.getElementById('doador-estado').value = doador.estado || '';
        
    } catch (error) {
        console.error('Erro ao carregar doador:', error);
        showNotification('Erro ao carregar dados do doador', 'error');
    }
}

// Limpar campos do modal
function clearDonorFields() {
    const campos = [
        'doador-nome', 'doador-cpf', 'doador-email', 'doador-telefone1', 'doador-telefone2',
        'doador-cep', 'doador-logradouro', 'doador-numero', 'doador-complemento',
        'doador-bairro', 'doador-cidade', 'doador-estado'
    ];
    
    campos.forEach(function(id) {
        const campo = document.getElementById(id);
        if (campo) campo.value = '';
    });
}

// Fechar modal de doador
function closeDonorModal() {
    const modal = document.getElementById('modal-doador');
    if (modal) {
        modal.style.display = 'none';
        currentEditingDonorId = null;
    }
}

// Salvar doador
async function saveDonor() {
    try {
        const formData = {
            nome: document.getElementById('doador-nome').value.trim(),
            cpf: document.getElementById('doador-cpf').value.trim(),
            email: document.getElementById('doador-email').value.trim(),
            telefone1: document.getElementById('doador-telefone1').value.trim(),
            telefone2: document.getElementById('doador-telefone2').value.trim(),
            cep: document.getElementById('doador-cep').value.trim(),
            logradouro: document.getElementById('doador-logradouro').value.trim(),
            numero: document.getElementById('doador-numero').value.trim(),
            complemento: document.getElementById('doador-complemento').value.trim(),
            bairro: document.getElementById('doador-bairro').value.trim(),
            cidade: document.getElementById('doador-cidade').value.trim(),
            estado: document.getElementById('doador-estado').value.trim()
        };
        
        // Validação
        if (!formData.nome) {
            showNotification('Nome é obrigatório', 'error');
            return;
        }
        if (!formData.telefone1) {
            showNotification('Telefone principal é obrigatório', 'error');
            return;
        }
        
        const url = currentEditingDonorId ? '/api/doadores/' + currentEditingDonorId : '/api/doadores';
        const method = currentEditingDonorId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showNotification(
                currentEditingDonorId ? 'Doador atualizado com sucesso!' : 'Doador criado com sucesso!', 
                'success'
            );
            closeDonorModal();
            loadDonors();
        } else {
            const error = await response.json();
            showNotification('Erro ao salvar: ' + error.error, 'error');
        }
        
    } catch (error) {
        console.error('Erro ao salvar doador:', error);
        showNotification('Erro ao salvar doador: ' + error.message, 'error');
    }
}

// Editar doador
function editDonor(id) {
    openDonorModal(id);
}

// Excluir doador
async function deleteDonor(id) {
    if (!confirm('Tem certeza que deseja excluir este doador?')) {
        return;
    }
    
    try {
        const response = await fetch('/api/doadores/' + id, { method: 'DELETE' });
        
        if (response.ok) {
            showNotification('Doador excluído com sucesso!', 'success');
            loadDonors();
        } else {
            const error = await response.json();
            showNotification('Erro ao excluir: ' + error.error, 'error');
        }
    } catch (error) {
        console.error('Erro ao excluir doador:', error);
        showNotification('Erro ao excluir doador: ' + error.message, 'error');
    }
}

// Ver histórico do doador
function viewDonorHistory(id) {
    showNotification('Funcionalidade de histórico em desenvolvimento', 'info');
}

// Buscar doadores
function searchDonors() {
    const searchTerm = document.getElementById('search-doador').value.toLowerCase();
    
    if (!searchTerm) {
        renderDonorsTable();
        return;
    }
    
    const filteredDonors = allDonors.filter(function(doador) {
        return doador.nome.toLowerCase().includes(searchTerm) ||
               (doador.cpf && doador.cpf.includes(searchTerm)) ||
               doador.telefone1.includes(searchTerm) ||
               (doador.telefone2 && doador.telefone2.includes(searchTerm));
    });
    
    const tbody = document.getElementById('doadores-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = filteredDonors.map(function(doador) {
        return '<tr class="hover:bg-gray-50">' +
            '<td class="px-6 py-4">' +
                '<div class="text-sm">' +
                    '<div class="font-medium text-gray-900">' + doador.nome + '</div>' +
                    '<div class="text-gray-500">' + (doador.codigo_doador || 'D' + String(doador.id).padStart(3, '0')) + '</div>' +
                    (doador.cpf ? '<div class="text-gray-400 text-xs">' + formatCPFDisplay(doador.cpf) + '</div>' : '') +
                '</div>' +
            '</td>' +
            '<td class="px-6 py-4">' +
                '<div class="text-sm">' +
                    '<div class="text-gray-900">' + doador.telefone1 + '</div>' +
                    (doador.telefone2 ? '<div class="text-gray-500">' + doador.telefone2 + '</div>' : '') +
                    (doador.email ? '<div class="text-gray-400 text-xs">' + doador.email + '</div>' : '') +
                '</div>' +
            '</td>' +
            '<td class="px-6 py-4">' +
                '<div class="text-sm font-semibold text-green-600">' +
                    'R$ ' + (doador.total_doado || 0).toFixed(2).replace('.', ',') +
                '</div>' +
            '</td>' +
            '<td class="px-6 py-4">' +
                '<span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">' +
                    (doador.total_doacoes || 0) + ' doações' +
                '</span>' +
            '</td>' +
            '<td class="px-6 py-4 text-sm font-medium">' +
                '<div class="flex gap-2">' +
                    '<button onclick="editDonor(' + doador.id + ')" class="text-blue-600 hover:text-blue-900 transition-colors" title="Editar">' +
                        '<i data-feather="edit" class="h-4 w-4"></i>' +
                    '</button>' +
                    '<button onclick="viewDonorHistory(' + doador.id + ')" class="text-green-600 hover:text-green-900 transition-colors" title="Ver histórico">' +
                        '<i data-feather="eye" class="h-4 w-4"></i>' +
                    '</button>' +
                    '<button onclick="deleteDonor(' + doador.id + ')" class="text-red-600 hover:text-red-900 transition-colors" title="Excluir">' +
                        '<i data-feather="trash-2" class="h-4 w-4"></i>' +
                    '</button>' +
                '</div>' +
            '</td>' +
        '</tr>';
    }).join('');
    
    feather.replace();
}

// Formatar CPF para exibição
function formatCPFDisplay(cpf) {
    if (!cpf) return '';
    return cpf.replace(/(\\d{3})(\\d{3})(\\d{3})(\\d{2})/, '$1.$2.$3-$4');
}

// Sistema de abas
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            const targetTab = button.dataset.tab;
            
            tabButtons.forEach(function(btn) { btn.classList.remove('active'); });
            tabContents.forEach(function(content) { content.classList.remove('active'); });
            
            button.classList.add('active');
            const targetContent = document.getElementById('tab-' + targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
                
                if (targetTab === 'doadores') {
                    loadDonors();
                }
            }
        });
    });
}

// Event listeners para doadores
document.addEventListener('DOMContentLoaded', function() {
    initTabs();
    
    const btnNovoDoador = document.getElementById('btn-novo-doador');
    if (btnNovoDoador) {
        btnNovoDoador.addEventListener('click', function() { openDonorModal(); });
    }
    
    const btnCloseModalDoador = document.getElementById('btn-close-modal-doador');
    if (btnCloseModalDoador) {
        btnCloseModalDoador.addEventListener('click', closeDonorModal);
    }
    
    const btnCancelDoador = document.getElementById('btn-cancel-doador');
    if (btnCancelDoador) {
        btnCancelDoador.addEventListener('click', closeDonorModal);
    }
    
    const btnSaveDoador = document.getElementById('btn-save-doador');
    if (btnSaveDoador) {
        btnSaveDoador.addEventListener('click', saveDonor);
    }
    
    const searchDoador = document.getElementById('search-doador');
    if (searchDoador) {
        searchDoador.addEventListener('input', searchDonors);
    }
});

// Expor funções globalmente
window.loadDonors = loadDonors;
window.openDonorModal = openDonorModal;
window.editDonor = editDonor;
window.deleteDonor = deleteDonor;
window.viewDonorHistory = viewDonorHistory;
`;\n`);

// ================================================================
// 1. VERIFICAR ARQUIVOS
// ================================================================

console.log('1️⃣  VERIFICANDO ARQUIVOS...\n');

const serverPath = './server.js';
const indexPath = './public/index.html';
const appPath = './public/app.js';

if (!fs.existsSync(serverPath)) {
    console.log('❌ server.js não encontrado!');
    process.exit(1);
}

if (!fs.existsSync(indexPath)) {
    console.log('❌ index.html não encontrado!');
    process.exit(1);
}

if (!fs.existsSync(appPath)) {
    console.log('❌ app.js não encontrado!');
    process.exit(1);
}

console.log('✅ Todos os arquivos encontrados');

// ================================================================
// 2. ADICIONAR ROTAS DE DOADORES NO SERVER.JS
// ================================================================

console.log('\n2️⃣  ADICIONANDO ROTAS DE DOADORES NO SERVER.JS...\n');

let serverContent = fs.readFileSync(serverPath, 'utf8');

// Backup do server.js
const backupName = `server.js.backup_doadores_${Date.now()}`;
fs.writeFileSync(backupName, serverContent);
console.log(`💾 Backup criado: ${backupName}`);

// Verificar se as rotas já existem
if (serverContent.includes('/api/doadores')) {
    console.log('⚠️ Rotas de doadores já existem no server.js');
} else {
    // Adicionar rotas de doadores antes da última linha
    const rotasDoadores = `

// ================================================================
// ROTAS DE DOADORES - Restauradas v1.3.0
// ================================================================

// Listar todos os doadores
app.get('/api/doadores', (req, res) => {
    const query = \`
        SELECT d.*, 
               COUNT(doac.id) as total_doacoes,
               COALESCE(SUM(doac.valor), 0) as total_doado
        FROM doadores d
        LEFT JOIN doacoes doac ON d.id = doac.doador_id
        GROUP BY d.id
        ORDER BY d.nome ASC
    \`;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Erro ao buscar doadores:', err);
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Buscar doador específico
app.get('/api/doadores/:id', (req, res) => {
    const { id } = req.params;
    
    const query = \`
        SELECT d.*, 
               COUNT(doac.id) as total_doacoes,
               COALESCE(SUM(doac.valor), 0) as total_doado
        FROM doadores d
        LEFT JOIN doacoes doac ON d.id = doac.doador_id
        WHERE d.id = ?
        GROUP BY d.id
    \`;
    
    db.get(query, [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (!row) {
            res.status(404).json({ error: 'Doador não encontrado' });
        } else {
            res.json(row);
        }
    });
});

// Criar novo doador
app.post('/api/doadores', (req, res) => {
    const { 
        nome, cpf, telefone1, telefone2, email,
        cep, logradouro, numero, complemento, bairro, cidade, estado 
    } = req.body;

    if (!nome || !telefone1) {
        return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
    }

    // Gerar código único
    const codigoQuery = 'SELECT COUNT(*) as total FROM doadores';
    db.get(codigoQuery, [], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const numero = (row.total + 1).toString().padStart(3, '0');
        const iniciais = nome.split(' ')
            .map(palavra => palavra.charAt(0).toUpperCase())
            .slice(0, 3)
            .join('');
        const codigo = \`D\${numero}-\${iniciais}\`;

        const insertQuery = \`
            INSERT INTO doadores (
                codigo_doador, nome, cpf, telefone1, telefone2, email,
                cep, logradouro, numero, complemento, bairro, cidade, estado
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        \`;

        db.run(insertQuery, [
            codigo, nome, cpf || null, telefone1, telefone2 || null, email || null,
            cep || null, logradouro || null, numero || null, complemento || null,
            bairro || null, cidade || null, estado || null
        ], function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ 
                    id: this.lastID, 
                    codigo_doador: codigo,
                    message: 'Doador criado com sucesso' 
                });
            }
        });
    });
});

// Atualizar doador
app.put('/api/doadores/:id', (req, res) => {
    const { id } = req.params;
    const { 
        nome, cpf, telefone1, telefone2, email,
        cep, logradouro, numero, complemento, bairro, cidade, estado 
    } = req.body;

    if (!nome || !telefone1) {
        return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
    }

    const updateQuery = \`
        UPDATE doadores SET
            nome = ?, cpf = ?, telefone1 = ?, telefone2 = ?, email = ?,
            cep = ?, logradouro = ?, numero = ?, complemento = ?,
            bairro = ?, cidade = ?, estado = ?
        WHERE id = ?
    \`;

    db.run(updateQuery, [
        nome, cpf || null, telefone1, telefone2 || null, email || null,
        cep || null, logradouro || null, numero || null, complemento || null,
        bairro || null, cidade || null, estado || null, id
    ], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: 'Doador atualizado com sucesso' });
        }
    });
});

// Excluir doador
app.delete('/api/doadores/:id', (req, res) => {
    const { id } = req.params;

    // Verificar se o doador tem doações
    db.get('SELECT COUNT(*) as total FROM doacoes WHERE doador_id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (row.total > 0) {
            return res.status(400).json({ 
                error: 'Não é possível excluir doador que possui doações registradas' 
            });
        }

        // Excluir doador
        db.run('DELETE FROM doadores WHERE id = ?', [id], function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ message: 'Doador excluído com sucesso' });
            }
        });
    });
});

// Verificar duplicatas
app.post('/api/doadores/check-duplicates', (req, res) => {
    const { cpf, telefone1, telefone2, excludeId } = req.body;
    
    let query = 'SELECT id, nome, cpf, telefone1, telefone2 FROM doadores WHERE ';
    let params = [];
    let conditions = [];
    
    if (cpf) {
        conditions.push('cpf = ?');
        params.push(cpf);
    }
    
    if (telefone1) {
        conditions.push('telefone1 = ? OR telefone2 = ?');
        params.push(telefone1, telefone1);
    }
    
    if (telefone2) {
        conditions.push('telefone1 = ? OR telefone2 = ?');
        params.push(telefone2, telefone2);
    }
    
    if (conditions.length === 0) {
        return res.json({ duplicates: [] });
    }
    
    query += conditions.join(' OR ');
    
    if (excludeId) {
        query += ' AND id != ?';
        params.push(excludeId);
    }
    
    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ duplicates: rows });
        }
    });
});
`;

    // Adicionar as rotas antes da última linha
    const linhas = serverContent.split('\n');
    const ultimaLinha = linhas.pop();
    linhas.push(rotasDoadores);
    linhas.push(ultimaLinha);
    serverContent = linhas.join('\n');
    
    console.log('✅ Rotas de doadores adicionadas ao server.js');
}

// ================================================================
// 3. ADICIONAR INTERFACE DE DOADORES NO INDEX.HTML
// ================================================================

console.log('\n3️⃣  ADICIONANDO INTERFACE DE DOADORES...\n');

let indexContent = fs.readFileSync(indexPath, 'utf8');

// Backup do index.html
const indexBackupName = `index.html.backup_doadores_${Date.now()}`;
fs.writeFileSync(indexBackupName, indexContent);
console.log(`💾 Backup do index.html criado: ${indexBackupName}`);

// Verificar se já tem sistema de abas
if (indexContent.includes('tab-doadores')) {
    console.log('⚠️ Interface de doadores já existe no index.html');
} else {
    // Adicionar estilos das abas no <head>
    const estilosAbas = `
    <style>
        /* Estilos para as abas */
        .tab-button {
            padding: 0.75rem 1.5rem;
            font-weight: 500;
            color: #6b7280;
            border-bottom: 2px solid transparent;
            transition: all 0.3s;
            cursor: pointer;
        }
        
        .tab-button:hover {
            color: #3b82f6;
        }
        
        .tab-button.active {
            color: #3b82f6;
            border-bottom-color: #3b82f6;
        }
        
        .tab-content {
            display: none;
        }
        
        .tab-content.active {
            display: block;
        }
    </style>`;

    // Adicionar estilos antes de </head>
    indexContent = indexContent.replace('</head>', estilosAbas + '\n</head>');

    // Adicionar sistema de abas após o header
    const sistemaAbas = `
    <!-- Sistema de Abas -->
    <div class="bg-white shadow-sm border-b mb-6">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex space-x-8" id="tab-buttons">
                <button class="tab-button active" data-tab="doacoes">
                    <div class="flex items-center space-x-2">
                        <i data-feather="gift" class="h-5 w-5"></i>
                        <span>Doações</span>
                    </div>
                </button>
                <button class="tab-button" data-tab="doadores">
                    <div class="flex items-center space-x-2">
                        <i data-feather="users" class="h-5 w-5"></i>
                        <span>Doadores</span>
                    </div>
                </button>
            </div>
        </div>
    </div>`;

    // Encontrar onde adicionar as abas (após header)
    const posHeader = indexContent.indexOf('</header>');
    if (posHeader !== -1) {
        const antesHeader = indexContent.substring(0, posHeader + 9);
        const depoisHeader = indexContent.substring(posHeader + 9);
        indexContent = antesHeader + sistemaAbas + depoisHeader;
    }

    // Envolver conteúdo existente em tab-content
    indexContent = indexContent.replace(
        '<main class="flex-1 p-8">',
        '<main class="flex-1 p-8">\n        <!-- Tab de Doações -->\n        <div id="tab-doacoes" class="tab-content active">'
    );

    // Adicionar tab de doadores antes de </main>
    const tabDoadores = `
        </div>
        
        <!-- Tab de Doadores -->
        <div id="tab-doadores" class="tab-content">
            <div class="max-w-7xl mx-auto">
                <!-- Controles de Doadores -->
                <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                        <div class="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
                            <input type="text" id="search-doador" placeholder="Buscar por nome, CPF ou telefone..." 
                                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1">
                        </div>
                        <button id="btn-novo-doador" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                            <i data-feather="user-plus" class="h-5 w-5"></i>
                            <span>Novo Doador</span>
                        </button>
                    </div>
                </div>
                
                <!-- Tabela de Doadores -->
                <div class="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Doador
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contato
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total Doado
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Doações
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody id="doadores-tbody" class="bg-white divide-y divide-gray-200">
                                <!-- Doadores serão carregados aqui -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Empty State Doadores -->
                <div id="empty-state-doadores" class="text-center py-12 bg-white rounded-lg shadow" style="display: none;">
                    <i data-feather="users" class="mx-auto h-12 w-12 text-gray-400"></i>
                    <h3 class="mt-2 text-sm font-medium text-gray-900">Nenhum doador encontrado</h3>
                    <p class="mt-1 text-sm text-gray-500">Comece adicionando um novo doador</p>
                </div>
            </div>
        </div>`;

    indexContent = indexContent.replace('</main>', tabDoadores + '\n    </main>');

    // Adicionar modal de doadores antes de </body>
    const modalDoadores = `
    <!-- Modal de Doador -->
    <div id="modal-doador" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" style="display: none;">
        <div class="bg-white rounded-lg max-w-4xl w-full p-6 max-h-screen overflow-y-auto">
            <div class="flex justify-between items-center mb-6">
                <h2 id="modal-doador-title" class="text-2xl font-bold text-gray-900">Novo Doador</h2>
                <button id="btn-close-modal-doador" class="text-gray-500 hover:text-gray-700">
                    <i data-feather="x" class="h-6 w-6"></i>
                </button>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- COLUNA 1: DADOS PESSOAIS -->
                <div class="space-y-4">
                    <h3 class="text-lg font-medium text-gray-900 border-b pb-2">👤 Dados Pessoais</h3>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                        <input type="text" id="doador-nome" required 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                        <input type="text" id="doador-cpf" maxlength="14" placeholder="000.000.000-00"
                            oninput="formatCPFInput(this)"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" id="doador-email"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Telefone Principal *</label>
                        <input type="text" id="doador-telefone1" required maxlength="15" placeholder="(00) 00000-0000"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Telefone Secundário</label>
                        <input type="text" id="doador-telefone2" maxlength="15" placeholder="(00) 00000-0000"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                </div>
                
                <!-- COLUNA 2: ENDEREÇO -->
                <div class="space-y-4">
                    <h3 class="text-lg font-medium text-gray-900 border-b pb-2">📍 Endereço</h3>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                            <input type="text" id="doador-cep" maxlength="9" placeholder="00000-000"
                                oninput="formatCEPInput(event)" onblur="buscarCEP(this.value, 'doador')"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Número</label>
                            <input type="text" id="doador-numero" placeholder="123"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Logradouro</label>
                        <input type="text" id="doador-logradouro" placeholder="Rua, Avenida..."
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                        <input type="text" id="doador-complemento" placeholder="Apto, Bloco, Sala..."
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                        <input type="text" id="doador-bairro"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                            <input type="text" id="doador-cidade"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                            <input type="text" id="doador-estado" maxlength="2" placeholder="UF" style="text-transform: uppercase;"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Modal Footer -->
            <div class="flex justify-end gap-3 mt-6 pt-6 border-t">
                <button id="btn-cancel-doador" class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Cancelar
                </button>
                <button id="btn-save-doador" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Salvar Doador
                </button>
            </div>
        </div>
    </div>`;

    indexContent = indexContent.replace('</body>', modalDoadores + '\n</body>');

    console.log('✅ Interface de doadores adicionada ao index.html');
}

// ================================================================
// 4. ADICIONAR FUNÇÕES JAVASCRIPT NO APP.JS
// ================================================================

console.log('\n4️⃣  ADICIONANDO FUNÇÕES JAVASCRIPT...\n');

let appContent = fs.readFileSync(appPath, 'utf8');

// Backup do app.js
const appBackupName = `app.js.backup_doadores_${Date.now()}`;
fs.writeFileSync(appBackupName, appContent);
console.log(`💾 Backup do app.js criado: ${appBackupName}`);

// Verificar se as funções já existem
if (appContent.includes('loadDonors')) {
    console.log('⚠️ Funções de doadores já existem no app.js');
} else {
    // Adicionar funções de doadores
    const funcoesDoadores = `

// ================================================================
// SISTEMA DE DOADORES - Restaurado v1.3.0
// ================================================================

let allDonors = [];
let currentEditingDonorId = null;

// Carregar doadores
async function loadDonors() {
    try {
        console.log('👥 Carregando doadores...');
        
        const response = await fetch('/api/doadores');
        if (!response.ok) throw new Error('Erro ao carregar doadores');
        
        allDonors = await response.json();
        console.log(\`✅ \${allDonors.length} doadores carregados\`);
        
        renderDonorsTable();
        
    } catch (error) {
        console.error('❌ Erro ao carregar doadores:', error);
        showNotification('Erro ao carregar doadores: ' + error.message, 'error');
    }
}

// Renderizar tabela de doadores
function renderDonorsTable() {
    const tbody = document.getElementById('doadores-tbody');
    const emptyState = document.getElementById('empty-state-doadores');
    
    if (!tbody) return;
    
    if (allDonors.length === 0) {
        tbody.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    tbody.innerHTML = allDonors.map(doador => \`
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4">
                <div class="text-sm">
                    <div class="font-medium text-gray-900">\${doador.nome}</div>
                    <div class="text-gray-500">\${doador.codigo_doador || 'D' + String(doador.id).padStart(3, '0')}</div>
                    \${doador.cpf ? \`<div class="text-gray-400 text-xs">\${formatCPFDisplay(doador.cpf)}</div>\` : ''}
                </div>
            </td>
            <td class="px-6 py-4">
                <div class="text-sm">
                    <div class="text-gray-900">\${doador.telefone1}</div>
                    \${doador.telefone2 ? \`<div class="text-gray-500">\${doador.telefone2}</div>\` : ''}
                    \${doador.email ? \`<div class="text-gray-400 text-xs">\${doador.email}</div>\` : ''}
                </div>
            </td>
            <td class="px-6 py-4">
                <div class="text-sm font-semibold text-green-600">
                    R$ \${(doador.total_doado || 0).toFixed(2).replace('.', ',')}
                </div>
            </td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    \${doador.total_doacoes || 0} doações
                </span>
            </td>
            <td class="px-6 py-4 text-sm font-medium">
                <div class="flex gap-2">
                    <button onclick="editDonor(\${doador.id})" class="text-blue-600 hover:text-blue-