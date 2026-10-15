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
        const vazio = document.createElement('p');
        vazio.style.cssText = 'color: #dc3545; font-weight: bold;';
        vazio.textContent = 'Seu carrinho está vazio.';
        divListaItens.replaceChildren(vazio);
        h3ValorTotal.innerText = 'R$ 0,00';
        if (btnFinalizar) {
            btnFinalizar.disabled = true;
            btnFinalizar.style.backgroundColor = '#ccc';
            btnFinalizar.style.cursor = 'not-allowed';
        }
        return;
    }

    let valorTotalPedido = 0;

    // createElement + textContent: o nome do produto nunca é interpretado como HTML
    const linhas = carrinho.map(item => {
        const quantidadeAtual = item.quantidade ? item.quantidade : 1;

        const subtotal = item.preco * quantidadeAtual;
        valorTotalPedido += subtotal;

        const linha = document.createElement('div');
        linha.style.cssText = 'display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px dashed #ccc; padding-bottom: 10px;';

        const descricao = document.createElement('span');
        descricao.style.color = '#555';
        const qtd = document.createElement('strong');
        qtd.textContent = `${quantidadeAtual}x`;
        descricao.append(qtd, ` ${item.nome}`);

        const valor = document.createElement('span');
        valor.style.fontWeight = 'bold';
        valor.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;

        linha.append(descricao, valor);
        return linha;
    });

    divListaItens.replaceChildren(...linhas);
    h3ValorTotal.innerText = `R$ ${valorTotalPedido.toFixed(2).replace('.', ',')}`;
}

// Já que o usuário está logado, adianta o que a gente sabe dele (vem do /me, não do localStorage)
async function preencherDadosDoUsuario() {
    const usuario = await estaLogado();
    if (!usuario) return;

    const campoNome = document.getElementById('nome');
    if (campoNome && !campoNome.value) {
        campoNome.value = usuario.nome || '';
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

async function finalizarPedido() {
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

    // Mesma verificação usada no carrinho: pergunta ao servidor (/me)
    if (!await estaLogado()) {
        alert('Você precisa fazer login para finalizar a sua compra!');

        const modalLogin = document.getElementById('modal-auth');
        if (modalLogin) {
            modalLogin.style.display = 'flex';
        } else {
            irParaLogin();
        }
        return;
    }

    // Formato do PedidoRequest do Java: só o que o cliente pode escolher.
    // Dono, preço, total e status NÃO vão no pacote: o servidor decide (dono vem do cookie).
    const pedidoPayload = {
        endereco: {
            cep: document.getElementById('cep')?.value || '',
            rua: document.getElementById('rua')?.value || '',
            numero: document.getElementById('numero')?.value || '',
            bairro: document.getElementById('bairro')?.value || '',
            cidade: document.getElementById('cidade')?.value || '',
            estado: document.getElementById('estado')?.value || 'SC'
        },

        metodoPagamento: radioPagamento.value,

        itens: carrinho.map(item => ({
            produtoId: item.id,
            quantidade: item.quantidade || 1
        }))
    };

    console.log("PACOTE QUE ESTÁ INDO PARA O JAVA:", pedidoPayload);

    fetch('http://localhost:8080/api/pedidos', {
        method: 'POST',
        credentials: 'include', // o navegador anexa o cookie HttpOnly com o token
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedidoPayload)
    })
        .then(response => {
            // 401 = sem sessão válida (cookie ausente, token vencido): volta para o login
            if (response.status === 401) {
                throw new Error('SESSAO_EXPIRADA');
            }
            // 403 = logado, mas sem permissão para esta ação: não desloga ninguém
            if (response.status === 403) {
                throw new Error('SEM_PERMISSAO');
            }
            // 400 = o servidor recusou o pedido e explicou por quê (ex.: produto desativado)
            if (response.status === 400) {
                return response.text().then(mensagem => {
                    const erro = new Error('PEDIDO_RECUSADO');
                    erro.mensagemServidor = mensagem;
                    throw erro;
                });
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
                limparSessao();
                irParaLogin(); // o carrinho continua salvo no navegador
                return;
            }

            if (erro.message === 'SEM_PERMISSAO') {
                alert('Sua conta não tem permissão para esta ação.');
                return;
            }

            if (erro.message === 'PEDIDO_RECUSADO') {
                alert(erro.mensagemServidor); // alert mostra texto puro; não interpreta HTML
                return;
            }

            alert('Ocorreu um erro ao enviar seu pedido. Certifique-se de que a aplicação Back-End está rodando.');
        });
}