//CARREGAR RESUMO DO PEDIDO
document.addEventListener('DOMContentLoaded', () => {
    carregarResumoPedido();
    preencherDadosDoUsuario();
});

function carregarResumoPedido() {
    const carrinho = JSON.parse(localStorage.getItem('meuCarrinho')) || [];
    const divListaItens = document.getElementById('lista-resumo-itens');
    const h3ValorTotal = document.getElementById('valor-total-checkout');
    const btnFinalizar = document.getElementById('btn-finalizar-compra');

    if (!divListaItens || !h3ValorTotal) return;

    if (carrinho.length === 0) {
        divListaItens.innerHTML = '<p style="color: #dc3545; font-weight: bold;">Seu carrinho está vazio.</p>';
        h3ValorTotal.innerText = 'R$ 0,00';
        if (btnFinalizar) {
            btnFinalizar.disabled = true;
            btnFinalizar.style.backgroundColor = '#ccc';
            btnFinalizar.style.cursor = 'not-allowed';
        }
        return;
    }

    let htmlItens = '';
    let valorTotalPedido = 0;

    carrinho.forEach(item => {
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

// Já que o usuário está logado, adianta o que a gente sabe dele
function preencherDadosDoUsuario() {
    if (!estaLogado()) return;

    const campoNome = document.getElementById('nome');
    if (campoNome && !campoNome.value) {
        campoNome.value = localStorage.getItem('nome') || '';
    }
}

//EXIBIR/ESCONDER DADOS DO CARTÃO
const radiosPagamento = document.querySelectorAll('input[name="pagamento"]');
const divDadosCartao = document.getElementById('dados-cartao');

radiosPagamento.forEach(radio => {
    radio.addEventListener('change', (event) => {
        if (divDadosCartao) {
            divDadosCartao.style.display =
                event.target.value === 'CARTAO_CREDITO' ? 'block' : 'none';
        }
    });
});

// OUVINTE DO BOTÃO DE FINALIZAR COMPRA
const btnFinalizar = document.getElementById('btn-finalizar-compra');

if (btnFinalizar) {
    btnFinalizar.addEventListener('click', (event) => {
        event.preventDefault();
        finalizarPedido();
    });
}

function finalizarPedido() {
    const carrinho = JSON.parse(localStorage.getItem('meuCarrinho')) || [];

    if (carrinho.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }

    const radioPagamento = document.querySelector('input[name="pagamento"]:checked');
    if (!radioPagamento) {
        alert('Por favor, selecione uma forma de pagamento.');
        return;
    }

    // Mesma verificação usada no carrinho e gravada pelo auth.js
    if (!estaLogado()) {
        alert('Você precisa fazer login para finalizar a sua compra!');

        // CORREÇÃO: o modal é #modal-auth (id), e o código antigo procurava
        // por .modal-auth (classe) — nunca achava nada, então o usuário só
        // via o alerta e ficava travado sem caminho pro login.
        const modalLogin = document.getElementById('modal-auth');
        if (modalLogin) {
            modalLogin.style.display = 'flex';
        } else {
            window.location.href = 'login.html';
        }
        return;
    }

    const usuarioLogadoId = parseInt(localStorage.getItem('idUsuarioLogado'), 10);

    const pedidoPayload = {
        usuario: { id: usuarioLogadoId },
        clienteNome: document.getElementById('nome')?.value || 'Cliente Não Informado',
        cpf: document.getElementById('cpf')?.value || '',

        endereco: {
            cep: document.getElementById('cep')?.value || '',
            rua: document.getElementById('rua')?.value || '',
            numero: document.getElementById('numero')?.value || '',
            bairro: document.getElementById('bairro')?.value || '',
            cidade: document.getElementById('cidade')?.value || '',
            estado: document.getElementById('estado')?.value || 'SC',
            usuario: { id: usuarioLogadoId }
        },

        metodoPagamento: radioPagamento.value,

        itens: carrinho.map(item => ({
            produto: { id: item.id },
            quantidade: item.quantidade || 1,
            precoUnitario: item.preco
        }))
    };

    console.log("PACOTE QUE ESTÁ INDO PARA O JAVA:", pedidoPayload);

    // Monta os headers incluindo o token, se o back-end estiver protegido
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = 'Bearer ' + token;

    fetch('http://localhost:8080/api/pedidos', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(pedidoPayload)
    })
        .then(response => {
            // Distingue "não autorizado" de "deu ruim no servidor"
            if (response.status === 401 || response.status === 403) {
                throw new Error('SESSAO_EXPIRADA');
            }
            if (!response.ok) {
                throw new Error('Falha ao processar o pedido no servidor.');
            }
            return response.json();
        })
        .then(pedidoSalvo => {
            alert(`Pedido #${pedidoSalvo.id || ''} realizado com sucesso! Obrigado pela compra.`);
            localStorage.removeItem('meuCarrinho');
            window.location.href = 'loja.html';
        })
        .catch(erro => {
            console.error('Erro na requisição:', erro);

            if (erro.message === 'SESSAO_EXPIRADA') {
                alert('Sua sessão expirou. Faça login novamente.');
                fazerLogout();
                return;
            }

            alert('Ocorreu um erro ao enviar seu pedido. Certifique-se de que a aplicação Back-End está rodando.');
        });
}