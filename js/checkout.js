//CARREGAR RESUMO DO PEDIDO
document.addEventListener('DOMContentLoaded', () => {
    carregarResumoPedido();
});

function carregarResumoPedido() {
    // CORREÇÃO 1: Trocamos 'carrinho' por 'meuCarrinho'
    const carrinho = JSON.parse(localStorage.getItem('meuCarrinho')) || [];
    const divListaItens = document.getElementById('lista-resumo-itens');
    const h3ValorTotal = document.getElementById('valor-total-checkout');
    const btnFinalizar = document.getElementById('btn-finalizar-compra');

    if (carrinho.length === 0) {
        divListaItens.innerHTML = '<p style="color: #dc3545; font-weight: bold;">Seu carrinho está vazio.</p>';
        h3ValorTotal.innerText = 'R$ 0,00';
        if(btnFinalizar) {
            btnFinalizar.disabled = true;
            btnFinalizar.style.backgroundColor = '#ccc';
            btnFinalizar.style.cursor = 'not-allowed';
        }
        return; 
    }

    let htmlItens = '';
    let valorTotalPedido = 0;

    carrinho.forEach(item => {
        // CORREÇÃO 2: Se o item.quantidade não existir no JSON, assumimos que é 1
        const quantidadeAtual = item.quantidade ? item.quantidade : 1;
        
        const subtotal = item.preco * quantidadeAtual;
        valorTotalPedido += subtotal; 

        htmlItens += `
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px dashed #ccc; padding-bottom: 10px;">
                <span style="color: #555;"><strong>${quantidadeAtual}x</strong> ${item.nome}</span>
                <span style="font-weight: bold;">R$ ${subtotal.toFixed(2).replace('.', ',')}</span>
            </div>
        `;
    });

    divListaItens.innerHTML = htmlItens;
    h3ValorTotal.innerText = `R$ ${valorTotalPedido.toFixed(2).replace('.', ',')}`;
}


//EXIBIR/ESCONDER DADOS DO CARTÃO
const radiosPagamento = document.querySelectorAll('input[name="pagamento"]');
const divDadosCartao = document.getElementById('dados-cartao');

radiosPagamento.forEach(radio => {
    radio.addEventListener('change', (event) => {
        if (event.target.value === 'CARTAO_CREDITO') {
            divDadosCartao.style.display = 'block';
        } else {
            divDadosCartao.style.display = 'none';
        }
    });
});