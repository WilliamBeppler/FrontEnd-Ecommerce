function adicionarAoCarrinho(id, nome, preco, imagem) {
    const carrinho = JSON.parse(localStorage.getItem('meuCarrinho')) || [];

    // Se o produto já está no carrinho, soma a quantidade em vez de duplicar a linha
    const existente = carrinho.find(item => item.id === id);

    if (existente) {
        existente.quantidade = (existente.quantidade || 1) + 1;
    } else {
        carrinho.push({
            id: id,
            nome: nome,
            preco: preco,
            imagem: imagem,
            quantidade: 1
        });
    }

    localStorage.setItem('meuCarrinho', JSON.stringify(carrinho));

    dispararPopUp();
    atualizarContador();
}


function atualizarContador() {
    const carrinho = JSON.parse(localStorage.getItem('meuCarrinho')) || [];

    // Conta unidades, não linhas
    const numero = carrinho.reduce((soma, item) => soma + (item.quantidade || 1), 0);

    const elementoContador = document.getElementById('contagem-carrinho');

    if (elementoContador) {
        elementoContador.innerText = numero;
        elementoContador.style.display = numero > 0 ? 'flex' : 'none';
    }
}

document.addEventListener('DOMContentLoaded', atualizarContador);

function carregarPaginaCarrinho() {
    const listaElemento = document.getElementById('lista-carrinho');
    const totalElemento = document.getElementById('preco-total');

    if (!listaElemento || !totalElemento) return;

    const carrinho = JSON.parse(localStorage.getItem('meuCarrinho')) || [];

    let total = 0;

    const btnContinuar = document.getElementById('btn-continuar');

    if (carrinho.length === 0) {
        const vazio = document.createElement('p');
        vazio.className = 'carrinho-vazio';
        vazio.textContent = 'Seu carrinho está vazio.';
        listaElemento.replaceChildren(vazio);
        totalElemento.innerText = '0,00';
        if (btnContinuar) btnContinuar.style.display = 'none';
        return;
    }

    if (btnContinuar) btnContinuar.style.display = '';

    const itens = carrinho.map(produto => {
        const quantidade = produto.quantidade || 1;
        const precoUnitario = parseFloat(produto.preco);
        const subtotal = precoUnitario * quantidade;
        total += subtotal;
        return criarItemCarrinho(produto, quantidade, precoUnitario, subtotal);
    });

    listaElemento.replaceChildren(...itens);
    totalElemento.innerText = total.toFixed(2).replace('.', ',');
}

// Ícone fixo da lixeira. É o ÚNICO HTML montado por string no carrinho,
// e é uma constante: nenhum dado de produto passa por aqui.
const ICONE_LIXEIRA = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>';

// Cada item é montado com createElement + textContent: o nome do produto
// (que veio do banco e foi digitado no painel) nunca é interpretado como HTML.
function criarItemCarrinho(produto, quantidade, precoUnitario, subtotal) {
    const item = document.createElement('div');
    item.className = 'item-carrinho';

    const imagem = document.createElement('img');
    imagem.className = 'item-carrinho-img';
    imagem.src = produto.imagem;
    imagem.alt = produto.nome;

    const info = document.createElement('div');
    info.className = 'item-carrinho-info';
    const nome = document.createElement('h4');
    nome.textContent = produto.nome;
    const unitario = document.createElement('p');
    unitario.className = 'item-carrinho-unitario';
    unitario.textContent = `R$ ${precoUnitario.toFixed(2).replace('.', ',')} cada`;
    const valor = document.createElement('p');
    valor.className = 'item-carrinho-subtotal';
    valor.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    info.append(nome, unitario, valor);

    const controle = document.createElement('div');
    controle.className = 'quantidade-controle';
    const menos = criarBotaoQuantidade('−', 'Diminuir quantidade', quantidade <= 1, () => alterarQuantidade(produto.id, -1));
    const numero = document.createElement('span');
    numero.className = 'qtd-numero';
    numero.textContent = quantidade;
    const mais = criarBotaoQuantidade('+', 'Aumentar quantidade', quantidade >= QUANTIDADE_MAXIMA, () => alterarQuantidade(produto.id, 1));
    controle.append(menos, numero, mais);

    const remover = document.createElement('button');
    remover.className = 'btn-remover';
    remover.insertAdjacentHTML('afterbegin', ICONE_LIXEIRA);
    remover.append(' Remover');
    remover.addEventListener('click', () => removerItem(produto.id));

    const acoes = document.createElement('div');
    acoes.className = 'item-carrinho-acoes';
    acoes.append(controle, remover);

    item.append(imagem, info, acoes);
    return item;
}

function criarBotaoQuantidade(simbolo, descricao, desabilitado, aoClicar) {
    const botao = document.createElement('button');
    botao.className = 'btn-qtd';
    botao.textContent = simbolo;
    botao.setAttribute('aria-label', descricao);
    botao.disabled = desabilitado;
    botao.addEventListener('click', aoClicar);
    return botao;
}

const QUANTIDADE_MAXIMA = 99;

// Soma (+1) ou subtrai (-1) a quantidade de um item direto no carrinho
function alterarQuantidade(id, variacao) {
    const carrinho = JSON.parse(localStorage.getItem('meuCarrinho')) || [];
    const item = carrinho.find(produto => produto.id === id);
    if (!item) return;

    const novaQuantidade = (item.quantidade || 1) + variacao;
    if (novaQuantidade < 1 || novaQuantidade > QUANTIDADE_MAXIMA) return;

    item.quantidade = novaQuantidade;
    localStorage.setItem('meuCarrinho', JSON.stringify(carrinho));

    carregarPaginaCarrinho();
    atualizarContador();
}

function removerItem(id) {
    let carrinho = JSON.parse(localStorage.getItem('meuCarrinho')) || [];
    carrinho = carrinho.filter(item => item.id !== id);
    localStorage.setItem('meuCarrinho', JSON.stringify(carrinho));

    carregarPaginaCarrinho();
    atualizarContador();
}

function limparCarrinho() {
    alert("Compra finalizada com sucesso! (Simulação)");
    localStorage.removeItem('meuCarrinho');
    window.location.href = '../index.html';
}

carregarPaginaCarrinho();

function dispararPopUp() {
    const balao = document.getElementById('notificacao-sucesso');

    if (balao) {
        balao.classList.add('mostrar');
        setTimeout(() => {
            balao.classList.remove('mostrar');
        }, 3000);
    }
}

// Captura os elementos do Modal
const modalAuth = document.getElementById('modal-auth');
const btnFecharModal = document.getElementById('btn-fechar-modal');

async function avancarParaCheckout() {
    // Pergunta ao servidor: a sessão vive num cookie que o JS não enxerga
    if (await estaLogado()) {
        window.location.href = 'checkout.html';
    } else if (modalAuth) {
        mostrarAbaAuth('login'); // sempre abre na tela de "Entrar"
        modalAuth.style.display = 'flex';
    } else {
        window.location.href = 'login.html';
    }
}

// CORREÇÃO: sem o if, esta linha quebrava em qualquer página sem o modal
if (btnFecharModal) {
    btnFecharModal.addEventListener('click', () => {
        modalAuth.style.display = 'none';
    });
}

if (modalAuth) {
    window.addEventListener('click', (event) => {
        if (event.target === modalAuth) {
            modalAuth.style.display = 'none';
        }
    });
}