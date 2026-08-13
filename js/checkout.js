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

// OUVINTE DO BOTÃO DE FINALIZAR COMPRA
const btnFinalizar = document.getElementById('btn-finalizar-compra');

if (btnFinalizar) {
    btnFinalizar.addEventListener('click', (event) => {
        event.preventDefault(); // Impede o recarregamento automático da página
        finalizarPedido();
    });
}

function finalizarPedido() {
    // 1. Resgata o carrinho do localStorage
    const carrinho = JSON.parse(localStorage.getItem('meuCarrinho')) || [];

    if (carrinho.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }

    // 2. Captura a forma de pagamento selecionada
    const radioPagamento = document.querySelector('input[name="pagamento"]:checked');
    if (!radioPagamento) {
        alert('Por favor, selecione uma forma de pagamento.');
        return;
    }

    const usuarioLogadoId = localStorage.getItem('idUsuarioLogado');
    
    // Se a variável estiver vazia (null), o usuário não fez login!
    if(!usuarioLogadoId) {
        alert('Você precisa fazer login para finalizar a sua compra!');
        const modalLogin = document.querySelector('.modal-auth'); 
        if (modalLogin) {
            modalLogin.style.display = 'flex';
        }
        
        return; // Para a execução do pedido aqui e não envia para o Java
    }

    // 3. Monta o Objeto (JSON) com a mesma estrutura que o Spring Boot espera
    const pedidoPayload = {
        usuario: {
            id: parseInt(usuarioLogadoId) 
        },
        clienteNome: document.getElementById('nome')?.value || 'Cliente Não Informado',
        cpf: document.getElementById('cpf')?.value || '',
        
        endereco: {
            cep: document.getElementById('cep')?.value || '',
            rua: document.getElementById('rua')?.value || '',
            numero: document.getElementById('numero')?.value || '',
            bairro: document.getElementById('bairro')?.value || '',
            cidade: document.getElementById('cidade')?.value || '',
            estado: document.getElementById('estado')?.value || 'SC',
            usuario: {
                id: parseInt(usuarioLogadoId) 
            }
        },

        metodoPagamento: radioPagamento.value,
        
        // Mapeia os itens do carrinho para a estrutura DTO do Back-End
        itens: carrinho.map(item => ({
            produto: {
                id: item.id
            },
            quantidade: item.quantidade || 1,
            precoUnitario: item.preco
        }))
    };

    console.log("PACOTE QUE ESTÁ INDO PARA O JAVA:", pedidoPayload);

    // 4. Dispara a requisição HTTP POST para a API Java
    fetch('http://localhost:8080/api/pedidos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(pedidoPayload)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Falha ao processar o pedido no servidor.');
        }
        return response.json();
    })
    .then(pedidoSalvo => {
        // 5. Sucesso!
        alert(`Pedido #${pedidoSalvo.id || ''} realizado com sucesso! Obrigado pela compra.`);
        
        // Limpa o carrinho no navegador após finalizar
        localStorage.removeItem('meuCarrinho');
        
        // Redireciona para a página principal ou de confirmação
        window.location.href = 'loja.html';
    })
    .catch(erro => {
        console.error('Erro na requisição:', erro);
        alert('Ocorreu um erro ao enviar seu pedido. Certifique-se de que a aplicação Back-End está rodando.');
    });
}