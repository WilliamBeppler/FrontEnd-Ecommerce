function adicionarAoCarrinho(nome, preco, imagem) {
    const carrinho = JSON.parse(localStorage.getItem('meuCarrinho')) || [];

    const novoProduto = {
        nome: nome,
        preco: preco,
        imagem: imagem,
        id: Date.now()
    };

    dispararPopUp();
    carrinho.push(novoProduto);

    localStorage.setItem('meuCarrinho', JSON.stringify(carrinho));

    atualizarContador();
    
}


function atualizarContador() {
    const carrinho = JSON.parse(localStorage.getItem('meuCarrinho')) || [];
    const numero = carrinho.length;

    const elementoContador = document.getElementById('contagem-carrinho');

    if(elementoContador) {
        elementoContador.innerText = numero;
        elementoContador.style.display = numero > 0 ? 'flex' : 'none';
    }
}

document.addEventListener('DOMContentLoaded', atualizarContador);

function carregarPaginaCarrinho() {
    const carrinho = JSON.parse(localStorage.getItem('meuCarrinho')) || [];
    const listaElemento = document.getElementById('lista-carrinho');
    const totalElemento = document.getElementById('preco-total');

    listaElemento.innerHTML = '';
    let total = 0;

    if(carrinho.length === 0) {
        listaElemento.innerHTML = '<p>Seu carrinho está vazio.</p>';
        totalElemento.innerText = '0,00';
        return;
    }

    carrinho.forEach(produto => {
        total += parseFloat(produto.preco);
        
        listaElemento.innerHTML += `
            <div style="display: flex; align-items: center; border-bottom: 1px solid #ccc; padding: 10px; gap: 15px;">
                <img src="${produto.imagem}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 5px;">
                    <div style="flex: 1;">
                        <h4>${produto.nome}</h4>
                        <p>R$ ${parseFloat(produto.preco).toFixed(2).replace('.', ',')}</p>
                    </div>
                     <button onclick="removerItem(${produto.id})" class="btn-remover">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                      Remover</button>
                    </div>
        `;
    });

    totalElemento.innerText = total.toFixed(2).replace('.', ',');
}

function removerItem (id) {
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
    
    // Verificação de segurança: só roda se o balão existir na página
    if (balao) {
        // 1. Adiciona a classe 'mostrar' (o CSS faz o balão subir)
        balao.classList.add('mostrar');
        
        // 2. O setTimeout funciona como um cronômetro
        // Ele espera 3000 milissegundos (3 segundos) e então remove a classe
        setTimeout(() => {
            balao.classList.remove('mostrar');
        }, 3000);
    }
}

// Captura os elementos do Modal
const modalAuth = document.getElementById('modal-auth');
const btnFecharModal = document.getElementById('btn-fechar-modal');

// Nova versão da função de avançar
function avancarParaCheckout() {
    const usuarioLogado = localStorage.getItem('usuarioLogado');

    if (usuarioLogado === 'true') {
        window.location.href = 'checkout.html';
    } else {
        // Em vez de mudar de página, mostramos o Pop-up na tela!
        modalAuth.style.display = 'flex'; 
    }
}

// Lógica de UX: Fechar o modal ao clicar no 'X'
btnFecharModal.addEventListener('click', () => {
    modalAuth.style.display = 'none';
});

// Lógica de UX: Fechar o modal ao clicar fora da caixa branca
window.addEventListener('click', (event) => {
    if (event.target === modalAuth) {
        modalAuth.style.display = 'none';
    }
});