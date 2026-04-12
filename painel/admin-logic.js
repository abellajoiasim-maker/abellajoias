// CONFIGURAÇÃO FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyDPBZSxW8XjtQmDMUknzAyIlFda51MvMJY",
    databaseURL: "https://catalogo-abella-joias-default-rtdb.firebaseio.com"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let pedidoEditando = null;
const fMoeda = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

// NAVEGAÇÃO
function showTab(id, btn) {
    document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    const target = document.getElementById(id);
    if(target) target.classList.add('active');
    if(btn) btn.classList.add('active');
}

// BUSCA AUTOMÁTICA POR SKU (PARA O EDITOR DE PEDIDOS)
function buscarDadosProduto(sku, inputElement) {
    if(!sku) return;
    db.ref('products').once('value', s => {
        let achou = false;
        s.forEach(child => {
            const p = child.val();
            if(p.sku && p.sku.toLowerCase() === sku.toLowerCase()) {
                const card = inputElement.closest('.item-editor');
                card.querySelector('.in-nome').value = p.name || '';
                card.querySelector('.in-peso').value = p.weight || p.peso || 0;
                card.querySelector('.in-preco').value = p.price || 0;
                card.querySelector('.in-foto').value = p.image || '';
                achou = true;
            }
        });
        if(achou) recalcularTotalEd();
        inputElement.style.borderColor = achou ? "#333" : "red";
    });
}

function carregarPedidos() {
    const busca = document.getElementById('buscaPedido')?.value.toLowerCase() || "";
    db.ref('orders').on('value', s => {
        const lista = document.getElementById('listaPedidos');
        if(!lista) return;
        lista.innerHTML = '';
        
        // Inverter para mostrar os mais recentes primeiro
        const pedidos = [];
        s.forEach(child => { pedidos.unshift({key: child.key, ...child.val()}); });

        pedidos.forEach(p => {
            const nomeCli = (p.cliente?.nome || "").toLowerCase();
            if(busca && !nomeCli.includes(busca)) return;

            lista.innerHTML += `
            <div class="card border-l-4 border-[#caa85c] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-3 group">
                <div class="flex-grow">
                    <div class="flex items-center gap-2">
                         <b class="text-[#caa85c] uppercase text-sm">${p.cliente?.nome || 'Cliente Sem Nome'}</b>
                         <span class="text-[9px] bg-[#222] px-2 py-0.5 rounded text-gray-400">ID: ${p.key.substring(1,6)}</span>
                    </div>
                    <p class="text-[10px] text-gray-500 mt-1">
                        📅 ${p.data || '---'} | 📦 ${p.totalPecas || 0} peças | ⚖️ ${(p.pesoTotal || 0).toFixed(2)}g
                    </p>
                </div>

                <div class="flex items-center gap-2 w-full md:w-auto border-t md:border-t-0 border-[#222] pt-2 md:pt-0">
                    <div class="text-right mr-4">
                        <div class="font-bold text-white text-sm">${fMoeda(p.total)}</div>
                    </div>
                    
                    <button class="btn bg-blue-900/20 text-blue-400 border-blue-900/50 hover:bg-blue-900" 
                            onclick="abrirEditorPedido('${p.key}')" title="Editar Pedido">
                        ✏️ <span class="hidden md:inline ml-1">Editar</span>
                    </button>

                    <button class="btn hover:border-[#caa85c]" 
                            onclick="duplicarPedido('${p.key}')" title="Duplicar Pedido">
                        👯
                    </button>

                    <button class="btn bg-red-900/10 text-red-500 border-red-900/30 hover:bg-red-600 hover:text-white" 
                            onclick="excluirPedido('${p.key}')" title="Excluir Pedido">
                        🗑️
                    </button>
                </div>
            </div>`;
        });
    });
}
function abrirEditorPedido(id) {
    pedidoEditando = id;
    db.ref('orders/'+id).once('value', s => {
        const p = s.val();
        document.getElementById('edClienteNome').value = p.cliente?.nome || '';
        document.getElementById('edClienteTel').value = p.cliente?.telefone || '';
        document.getElementById('edRua').value = p.entrega?.rua || '';
        document.getElementById('edCidade').value = p.entrega?.cidade || '';
        document.getElementById('edDescPromo').value = p.descontoPromo || 0;
        document.getElementById('edDescPix').value = p.descontoPix || 0;
        document.getElementById('edFrete').value = p.frete || 0;
        
        document.getElementById('edItens').innerHTML = '';
        const itens = Array.isArray(p.itens) ? p.itens : Object.values(p.itens || {});
        itens.forEach(addItemEditor);
        
        recalcularTotalEd();
        document.getElementById('editorPedido').classList.remove('hidden');
    });
}

function addItemEditor(i={}) {
    const div = document.createElement('div');
    div.className = "item-editor card bg-black/40 border-[#222] p-3 relative group mb-2";
    div.innerHTML = `
        <div class="grid grid-cols-2 md:grid-cols-6 gap-2">
            <div>
                <label class="text-[8px] text-gray-500 uppercase">SKU</label>
                <input class="in-sku !mb-0 text-[10px]" value="${i.sku||''}" onblur="buscarDadosProduto(this.value, this)">
            </div>
            <div class="md:col-span-2">
                <label class="text-[8px] text-gray-500 uppercase">Produto</label>
                <input class="in-nome !mb-0 text-[10px]" value="${i.name||i.nome||''}">
            </div>
            <div>
                <label class="text-[8px] text-gray-500 uppercase">Peso(g)</label>
                <input type="number" class="in-peso !mb-0 text-[10px]" value="${i.peso||i.weight||0}" oninput="recalcularTotalEd()">
            </div>
            <div>
                <label class="text-[8px] text-gray-500 uppercase">Preço</label>
                <input type="number" class="in-preco !mb-0 text-[10px]" value="${i.price||i.precoFinal||0}" oninput="recalcularTotalEd()">
            </div>
            <div>
                <label class="text-[8px] text-gray-500 uppercase">Qtd</label>
                <input type="number" class="in-qtd !mb-0 text-[10px] font-bold text-[#caa85c]" value="${i.quantidade||i.qtd||1}" oninput="recalcularTotalEd()">
            </div>
            <input type="hidden" class="in-foto" value="${i.image||i.foto||''}">
        </div>
        <button class="absolute -right-2 -top-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs" onclick="this.parentElement.remove();recalcularTotalEd();">×</button>
    `;
    document.getElementById('edItens').appendChild(div);
}

function recalcularTotalEd() {
    let subtotal = 0, qtdT = 0;
    document.querySelectorAll('.item-editor').forEach(div => {
        const p = Number(div.querySelector('.in-preco').value);
        const q = Number(div.querySelector('.in-qtd').value);
        subtotal += (p * q);
        qtdT += q;
    });
    const dP = Number(document.getElementById('edDescPromo').value);
    const dX = Number(document.getElementById('edDescPix').value);
    const f = Number(document.getElementById('edFrete').value);
    const total = subtotal - dP - dX + f;
    
    document.getElementById('totalPreview').innerText = fMoeda(total);
    document.getElementById('edQtdTotal').value = qtdT;
}

function salvarPedidoEditado() {
    const itens = [];
    document.querySelectorAll('.item-editor').forEach(div => {
        itens.push({
            sku: div.querySelector('.in-sku').value,
            name: div.querySelector('.in-nome').value,
            peso: Number(div.querySelector('.in-peso').value),
            price: Number(div.querySelector('.in-preco').value),
            quantidade: Number(div.querySelector('.in-qtd').value),
            image: div.querySelector('.in-foto').value
        });
    });

    const totalPecas = itens.reduce((acc, i) => acc + i.quantidade, 0);
    const subtotal = itens.reduce((acc, i) => acc + (i.price * i.quantidade), 0);
    const dP = Number(document.getElementById('edDescPromo').value);
    const dX = Number(document.getElementById('edDescPix').value);
    const f = Number(document.getElementById('edFrete').value);

    db.ref('orders/'+pedidoEditando).update({
        cliente: { nome: document.getElementById('edClienteNome').value, telefone: document.getElementById('edClienteTel').value },
        entrega: { rua: document.getElementById('edRua').value, cidade: document.getElementById('edCidade').value },
        itens, totalPecas, subtotal, 
        descontoPromo: dP, descontoPix: dX, frete: f,
        total: (subtotal - dP - dX + f)
    }).then(() => { alert("Salvo!"); fecharEditorPedido(); });
}

function duplicarPedido(id) {
    db.ref('orders/'+id).once('value', s => {
        const novo = s.val();
        novo.data = new Date().toLocaleString('pt-BR') + " (Cópia)";
        db.ref('orders').push(novo).then(() => alert("Pedido Duplicado!"));
    });
}

function excluirPedido(id) {
    if(confirm("Excluir este pedido permanentemente?")) {
        db.ref('orders/'+id).remove().then(() => fecharEditorPedido());
    }
}

function fecharEditorPedido() { 
    document.getElementById('editorPedido').classList.add('hidden'); 
}
// ============================================================
// LÓGICA DO DASHBOARD - CONTROLE DE MANUTENÇÃO
// ============================================================

function carregarStatusSite() {
    const statusTexto = document.getElementById('statusTexto');
    const btnManutencao = document.getElementById('btnManutencao');

    if (!statusTexto || !btnManutencao) return;

    db.ref('settings/manutencao').on('value', (snapshot) => {
        const emManutencao = snapshot.val();

        if (emManutencao) {
            statusTexto.innerText = "Site em Manutenção";
            statusTexto.classList.replace('text-green-500', 'text-red-500'); // Garante a cor
            statusTexto.style.color = "#ff4444"; 
            
            btnManutencao.innerText = "DESATIVAR MANUTENÇÃO";
            btnManutencao.className = "btn px-6 font-bold bg-green-900/20 text-green-500 border-green-900 hover:bg-green-600 hover:text-white";
        } else {
            statusTexto.innerText = "Site Online (Normal)";
            statusTexto.style.color = "#44ff44";
            
            btnManutencao.innerText = "ATIVAR MANUTENÇÃO";
            btnManutencao.className = "btn px-6 font-bold bg-red-900/20 text-red-500 border-red-900 hover:bg-red-600 hover:text-white";
        }
    });
}

function alternarManutencao() {
    db.ref('settings/manutencao').once('value').then((snapshot) => {
        const atual = snapshot.val();
        const novoStatus = !atual;
        
        if (confirm(novoStatus ? "Deseja colocar o site em MANUTENÇÃO?" : "Deseja colocar o site ONLINE?")) {
            db.ref('settings/manutencao').set(novoStatus)
                .then(() => {
                    console.log("Status de manutenção alterado para:", novoStatus);
                })
                .catch((error) => {
                    alert("Erro ao alterar status: " + error.message);
                });
        }
    });
}

async function imprimirRomaneio(id, tipo) {
    db.ref('orders/' + id).once('value', async s => {
        const p = s.val();
        if (!p) return;

        const empSnap = await db.ref('settings/empresa').once('value');
        const emp = empSnap.val() || { nome: "Abella Joias" };
        
        const itens = Array.isArray(p.itens) ? p.itens : Object.values(p.itens || {});
        
        // Configurações de exibição por tipo
        const isFin = [2, 5, 6].includes(tipo);    // Tipos que mostram valores
        const isFoto = [3, 6].includes(tipo);      // Tipos que mostram fotos
        const isGrade = [4, 5, 6].includes(tipo);  // Tipos em modo grade (2 colunas)

        // Títulos dos Romaneios
        const titulos = {
            1: "Conferência de Pedido", 2: "Romaneio Financeiro", 3: "Catálogo do Pedido",
            4: "Grade de Conferência", 5: "Grade Financeira", 6: "Romaneio Completo (Foto/Preço)"
        };

        let html = `<div style="padding: 20px; font-family: sans-serif; color: #000; background: #fff;">
            <div style="display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
                <div>
                    <h1 style="margin: 0; font-size: 22px; text-transform: uppercase;">${emp.nome}</h1>
                    <p style="margin: 0; font-size: 10px; color: #555;">${titulos[tipo]}</p>
                </div>
                <div style="text-align: right; font-size: 10px;">
                    <b>PEDIDO:</b> ${id.substring(1, 10).toUpperCase()}<br>
                    <b>DATA:</b> ${p.data}
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 11px; margin-bottom: 20px; background: #f9f9f9; padding: 10px; border-radius: 5px;">
                <div>
                    <b style="color: #caa85c; text-transform: uppercase;">Cliente</b><br>
                    ${p.cliente?.nome || 'Não informado'}<br>
                    ${p.cliente?.telefone || ''}
                </div>
                <div>
                    <b style="color: #caa85c; text-transform: uppercase;">Endereço de Entrega</b><br>
                    ${p.entrega?.rua || 'Retirada'} / ${p.entrega?.cidade || ''}
                </div>
            </div>`;

        // CORPO DO ROMANEIO (TABELA OU GRADE)
        if (isGrade) {
            html += `<div class="grid-romaneio" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">`;
            itens.forEach(i => {
                html += `
                <div style="border: 1px solid #eee; padding: 8px; border-radius: 8px; display: flex; align-items: center; gap: 10px; break-inside: avoid;">
                    ${isFoto ? `<img src="${i.image || i.foto}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">` : ''}
                    <div style="font-size: 10px;">
                        <b style="font-size: 11px;">${i.sku || 'S/SKU'}</b><br>
                        <span style="color: #555;">${i.name || i.nome}</span><br>
                        Qtd: <b>${i.quantidade}</b> | Peso: ${i.peso || 0}g
                        ${isFin ? `<br><b style="font-size: 11px;">${fMoeda(i.price * i.quantidade)}</b>` : ''}
                    </div>
                </div>`;
            });
            html += `</div>`;
        } else {
            html += `<table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                <thead>
                    <tr style="background: #f2f2f2; border-bottom: 1px solid #000;">
                        <th style="padding: 8px; text-align: left;">PRODUTO</th>
                        <th style="padding: 8px; text-align: center;">QTD</th>
                        <th style="padding: 8px; text-align: center;">PESO UN.</th>
                        ${isFin ? `<th style="padding: 8px; text-align: right;">TOTAL</th>` : ''}
                    </tr>
                </thead>
                <tbody>`;
            itens.forEach(i => {
                html += `<tr style="border-bottom: 1px solid #eee; break-inside: avoid;">
                    <td style="padding: 8px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            ${isFoto ? `<img src="${i.image || i.foto}" style="width: 40px; height: 40px; object-fit: cover;">` : ''}
                            <span><b>${i.sku || ''}</b> - ${i.name || i.nome}</span>
                        </div>
                    </td>
                    <td style="padding: 8px; text-align: center;">${i.quantidade}</td>
                    <td style="padding: 8px; text-align: center;">${(i.peso || 0).toFixed(2)}g</td>
                    ${isFin ? `<td style="padding: 8px; text-align: right;">${fMoeda(i.price * i.quantidade)}</td>` : ''}
                </tr>`;
            });
            html += `</tbody></table>`;
        }

        // RESUMO DETALHADO (O QUE VOCÊ PEDIU)
        const subtotalItens = itens.reduce((acc, i) => acc + (i.price * i.quantidade), 0);
        const pesoTotal = itens.reduce((acc, i) => acc + (Number(i.peso || 0) * i.quantidade), 0);
        const totalPecas = itens.reduce((acc, i) => acc + Number(i.quantidade), 0);

        html += `<div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #000; break-inside: avoid;">
            <div style="display: flex; justify-content: space-between;">
                <div style="font-size: 10px; line-height: 1.6;">
                    <b style="text-transform: uppercase; color: #caa85c;">Informações Técnicas</b><br>
                    Total de Modelos: <b>${itens.length}</b><br>
                    Total de Peças: <b>${totalPecas}</b><br>
                    Peso Total do Pedido: <b>${pesoTotal.toFixed(2)}g</b>
                </div>

                <div style="text-align: right; min-width: 200px;">
                    <table style="width: 100%; font-size: 11px; border-spacing: 0;">
                        ${isFin ? `
                            <tr><td style="padding: 2px;">Subtotal Itens:</td><td style="padding: 2px;">${fMoeda(subtotalItens)}</td></tr>
                            ${p.descontoPromo > 0 ? `<tr style="color: red;"><td style="padding: 2px;">Desconto Campanha:</td><td style="padding: 2px;">- ${fMoeda(p.descontoPromo)}</td></tr>` : ''}
                            ${p.descontoPix > 0 ? `<tr style="color: red;"><td style="padding: 2px;">Desconto à Vista:</td><td style="padding: 2px;">- ${fMoeda(p.descontoPix)}</td></tr>` : ''}
                            ${p.frete > 0 ? `<tr><td style="padding: 2px;">Frete:</td><td style="padding: 2px;">+ ${fMoeda(p.frete)}</td></tr>` : ''}
                            <tr style="font-size: 16px; font-weight: bold; color: #000;">
                                <td style="padding-top: 10px; border-top: 1px solid #eee;">TOTAL:</td>
                                <td style="padding-top: 10px; border-top: 1px solid #eee;">${fMoeda(p.total)}</td>
                            </tr>
                        ` : `
                            <tr style="font-size: 16px; font-weight: bold; color: #caa85c;">
                                <td colspan="2">CHECKLIST CONCLUÍDO</td>
                            </tr>
                        `}
                    </table>
                </div>
            </div>
            
            <div style="margin-top: 30px; text-align: center; font-size: 9px; color: #999; text-transform: uppercase; letter-spacing: 1px;">
                Obrigado pela preferência! • ${emp.nome}
            </div>
        </div></div>`;

        document.getElementById('print-area').innerHTML = html;
        
        // Pequeno atraso para garantir que as fotos carreguem antes de abrir o PDF
        setTimeout(() => { window.print(); }, 800);
    });
}
