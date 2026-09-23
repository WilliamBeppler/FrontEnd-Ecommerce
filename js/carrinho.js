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

    listaElemento.innerHTML = '';
    let total = 0;

    if (carrinho.length === 0) {
        listaElemento.innerHTML = '<p>Seu carrinho está vazio.</p>';
        totalElemento.innerText = '0,00';
        return;
    }

    carrinho.forEach(produto => {
        const quantidade = produto.quantidade || 1;
        const subtotal = parseFloat(produto.preco) * quantidade;
        total += subtotal;

        listaElemento.innerHTML += `
            <div style="display: flex; align-items: center; border-bottom: 1px solid #ccc; padding: 10px; gap: 15px;">
                <img src="${produto.imagem}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 5px;">
                    <div style="flex: 1;">
                        <h4>${produto.nome}</h4>
                        <p>${quantidade}x R$ ${subtotal.toFixed(2).replace('.', ',')}</p>
                    </div>
                     <button onclick="removerItem(${produto.id})" class="btn-remover">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                      Remover</button>
                    </div>
        `;
    });

    totalElemento.innerText = total.toFixed(2).replace('.', ',');
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

function avancarParaCheckout() {
    
    if (estaLogado()) {
        window.location.href = 'checkout.html';
    } else if (modalAuth) {
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