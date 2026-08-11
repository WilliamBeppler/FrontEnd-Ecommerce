const trilho = document.getElementById('trilho');
    const imagensOriginais = document.querySelectorAll('.carrossel-trilho img');
    const totalImagens = imagensOriginais.length;

    let posicaoAtual = 0;
    
    const larguraTela = window.innerWidth;
    const itensPorTela = larguraTela < 768 ? 1 : 3;
    const totalPaginas = Math.ceil(totalImagens / itensPorTela);

    for (let i = 0; i < itensPorTela; i++) {
        if (imagensOriginais[i]) {
            const clone = imagensOriginais[i].cloneNode(true);
            trilho.appendChild(clone);
        }
    }

    function moverCarrossel() {
        trilho.style.transition = 'transform 0.5s ease-in-out';
        
        posicaoAtual++;

        trilho.style.transform = `translateX(-${posicaoAtual * 100}%)`;

        if (posicaoAtual === totalPaginas) {
            
            setTimeout(() => {
                trilho.style.transition = 'none';
                posicaoAtual = 0;
                trilho.style.transform = `translateX(0)`;
                
            }, 500);
        }
    }
    setInterval(moverCarrossel, 3000);

const menuHamburguer = document.querySelector('.menu-hamburguer');
const navBar = document.querySelector('.container_nav-bar');

menuHamburguer.addEventListener('click', () => {
 navBar.classList.toggle('ativo');
 menuHamburguer.classList.toggle('ativo');
});

document.addEventListener('DOMContentLoaded', () => {
    const iconePesquisa = document.getElementById("icone-pesquisa");
    const caixaPesquisa = document.getElementById("caixa-pesquisa");
    const btnFecharPesquisa = document.getElementById("btn-fechar-pesquisa");
    const inputPesquisa = document.getElementById("input-pesquisa");
    

    if (iconePesquisa && caixaPesquisa) {

        iconePesquisa.addEventListener('click', () => {
            caixaPesquisa.classList.add('ativa');
            inputPesquisa.focus();
        });

        if (btnFecharPesquisa) {
            btnFecharPesquisa.addEventListener('click', () => {
                caixaPesquisa.classList.remove('ativa');
                inputPesquisa.value = '';

                const todosProdutos = document.querySelectorAll('.cartao-produto');
                todosProdutos.forEach(produto => {
                    produto.style.display = '';
                })
            })
        }
    }

    const produtosNaTela = document.querySelectorAll('.cartao-produto');

    if (produtosNaTela.length > 0) {
        
        inputPesquisa.addEventListener('input', () => {
            const termoPesquisado = inputPesquisa.value.toLowerCase();

            produtosNaTela.forEach((produto) => {
                const nomeDoProduto = produto.querySelector('h3').textContent.toLowerCase();
                if (nomeDoProduto.includes(termoPesquisado)) {
                    produto.style.display = '';
                } else {
                    produto.style.display = 'none';
                }
            });
        });

        const parametrosUrl = new URLSearchParams(window.location.search);
        const termoQueChegou = parametrosUrl.get('busca');

        if (termoQueChegou) {
            caixaPesquisa.classList.add('ativa');
            inputPesquisa.value = termoQueChegou;
            inputPesquisa.dispatchEvent(new Event('input'));
        }
    }
    else {
        inputPesquisa.addEventListener('keypress', (evento) => {
            if (evento.key === 'Enter') {
                const termo = inputPesquisa.value;

                if (termo.trim() !== '') {
                    window.location.href = `loja.html?busca=${termo}`;
                }
            }
        });
    }
});
    
async function carregarEstoque() {
    try {
        const resposta = await fetch('http://localhost:8080/api/produtos');
        const produtosDoBanco = await resposta.json();

        const vitrine = document.querySelector('.container_loja');
        vitrine.innerHTML = '';

        produtosDoBanco.forEach(produto => {
            const precoFormatado = produto.preco.toFixed(2).replace('.', ',');
            const precoAntigo = (produto.preco * 1.30).toFixed(2).replace('.', ',');

            vitrine.innerHTML += `
                <div class="cartao-produto">
                    <img src="${produto.caminho_imagem}" alt="${produto.nome}">
                    <h3>${produto.nome}</h3>
                    <div class="preco">${precoFormatado}<span>R$ ${precoAntigo}</span></div>
                    <button class="btn" onclick="adicionarAoCarrinho('${produto.nome}', ${produto.preco}, '${produto.caminho_imagem}')">Adicionar ao Carrinho</button>
                 </div>
            `;
        });
    } catch (erro) {
        console.error("❌ O Front-End não conseguiu falar com o Back-End:", erro);
    }
}

carregarEstoque();
