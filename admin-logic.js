// Configuração de conexão (Não altere nada aqui)
const firebaseConfig = {
    apiKey: "AIzaSyDPBZSxW8XjtQmDMUknzAyIlFda51MvMJY",
    databaseURL: "https://catalogo-abella-joias-default-rtdb.firebaseio.com"
};
if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const db = firebase.database();

// Função para mudar de aba (Empresa, Produtos, Pedidos)
function showTab(tabId) {
    document.querySelectorAll('section').forEach(s => s.style.display = 'none');
    document.getElementById(tabId).style.display = 'block';
}

// SALVAR NOVO PRODUTO
function salvarProduto() {
    const nome = document.getElementById('nome').value;
    const preco = document.getElementById('preco').value;
    const sku = document.getElementById('sku').value;

    if(!nome || !preco || !sku) return alert("Preencha tudo!");

    db.ref('products').push({
        nome: nome,
        preco: preco,
        sku: sku.toUpperCase()
    }).then(() => {
        alert("Produto salvo com sucesso!");
        document.getElementById('form-produto').reset();
    });
}

// MOSTRAR PRODUTOS NA TELA
db.ref('products').on('value', snapshot => {
    const lista = document.getElementById('lista-produtos');
    lista.innerHTML = '';
    snapshot.forEach(item => {
        const p = item.val();
        lista.innerHTML += `
            <div style="border:1px solid #ccc; padding:10px; margin-bottom:5px;">
                <strong>${p.nome}</strong> - SKU: ${p.sku} - R$ ${p.preco}
                <button onclick="removerItem('products/${item.key}')" style="color:red">Excluir</button>
            </div>
        `;
    });
});

function removerItem(caminho) {
    if(confirm("Deseja mesmo excluir?")) db.ref(caminho).remove();
}
