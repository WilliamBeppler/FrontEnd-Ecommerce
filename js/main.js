// --- CARROSSEL DA HOME ---
// O trilho rola de verdade (scroll-snap), então o arrastar com o dedo no celular
// funciona nativamente. As setas, as bolinhas e o autoplay só mandam ele rolar.
function iniciarCarrossel() {
    const carrossel = document.getElementById('carrossel');
    const trilho = document.getElementById('trilho');
    if (!carrossel || !trilho) return; // página sem carrossel

    const fotos = trilho.querySelectorAll('img');
    const btnAnterior = document.getElementById('carrossel-anterior');
    const btnProximo = document.getElementById('carrossel-proximo');
    const areaPontos = document.getElementById('carrossel-pontos');

    let indiceAtual = 0;
    let autoplay = null;

    // Quantas fotos cabem na tela (3 no PC, 2 no tablet, 1 no celular)
    function fotosPorTela() {
        const passo = fotos[1] ? fotos[1].offsetLeft - fotos[0].offsetLeft : trilho.clientWidth;
        return Math.max(1, Math.round(trilho.clientWidth / passo));
    }

    function totalPosicoes() {
        return fotos.length - fotosPorTela() + 1;
    }

    function irPara(indice) {
        const total = totalPosicoes();
        indiceAtual = (indice + total) % total; // dá a volta nas duas pontas
        trilho.scrollTo({ left: fotos[indiceAtual].offsetLeft, behavior: 'smooth' });
        marcarPontoAtivo();
    }

    function criarPontos() {
        areaPontos.replaceChildren();
        for (let i = 0; i < totalPosicoes(); i++) {
            const ponto = document.createElement('button');
            ponto.className = 'carrossel-ponto';
            ponto.setAttribute('aria-label', `Ir para a foto ${i + 1}`);
            ponto.addEventListener('click', () => { irPara(i); reiniciarAutoplay(); });
            areaPontos.appendChild(ponto);
        }
        marcarPontoAtivo();
    }

    function marcarPontoAtivo() {
        areaPontos.querySelectorAll('.carrossel-ponto').forEach((ponto, i) => {
            ponto.classList.toggle('ativo', i === indiceAtual);
        });
    }

    function iniciarAutoplay() {
        pararAutoplay();
        autoplay = setInterval(() => irPara(indiceAtual + 1), 4000);
    }

    function pararAutoplay() {
        clearInterval(autoplay);
    }

    function reiniciarAutoplay() {
        iniciarAutoplay();
    }

    btnAnterior.addEventListener('click', () => { irPara(indiceAtual - 1); reiniciarAutoplay(); });
    btnProximo.addEventListener('click', () => { irPara(indiceAtual + 1); reiniciarAutoplay(); });

    // Quando o usuário arrasta, descobre em qual foto o trilho parou
    let esperaScroll;
    trilho.addEventListener('scroll', () => {
        clearTimeout(esperaScroll);
        esperaScroll = setTimeout(() => {
            const passo = fotos[1] ? fotos[1].offsetLeft - fotos[0].offsetLeft : 1;
            indiceAtual = Math.min(Math.round(trilho.scrollLeft / passo), totalPosicoes() - 1);
            marcarPontoAtivo();
        }, 80);
    });

    // Pausa enquanto o mouse está em cima ou o dedo está tocando
    carrossel.addEventListener('mouseenter', pararAutoplay);
    carrossel.addEventListener('mouseleave', iniciarAutoplay);
    trilho.addEventListener('touchstart', pararAutoplay, { passive: true });
    trilho.addEventListener('touchend', iniciarAutoplay);

    // Ao girar o celular / redimensionar, recalcula as bolinhas
    let esperaResize;
    window.addEventListener('resize', () => {
        clearTimeout(esperaResize);
        esperaResize = setTimeout(() => { criarPontos(); irPara(Math.min(indiceAtual, totalPosicoes() - 1)); }, 150);
    });

    criarPontos();
    iniciarAutoplay();
}

iniciarCarrossel();

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
    // Só a página Produtos tem vitrine; nas outras não há o que desenhar nem por que chamar a API
    const vitrine = document.querySelector('.container_loja');
    if (!vitrine) return;

    // Rede e tela em blocos separados: um erro de desenho não pode
    // aparecer como "não conseguiu falar com o Back-End" (Parte 29 do guia)
    let produtosDoBanco;
    try {
        const resposta = await fetch('http://localhost:8080/api/produtos', { credentials: 'include' });
        if (!resposta.ok) throw new Error(`a API respondeu ${resposta.status}`);
        produtosDoBanco = await resposta.json();
    } catch (erro) {
        console.error("❌ O Front-End não conseguiu falar com o Back-End:", erro);
        return;
    }

    vitrine.replaceChildren(...produtosDoBanco.map(criarCartaoProduto));
}

// Monta o cartão com createElement + textContent: o nome do produto (digitado no
// painel de admin) é sempre tratado como TEXTO, nunca como HTML. Nada de innerHTML.
function criarCartaoProduto(produto) {
    const precoFormatado = produto.preco.toFixed(2).replace('.', ',');
    const precoAntigo = (produto.preco * 1.30).toFixed(2).replace('.', ',');

    const cartao = document.createElement('div');
    cartao.className = 'cartao-produto';

    const imagem = document.createElement('img');
    imagem.src = produto.caminho_imagem;
    imagem.alt = produto.nome;

    const titulo = document.createElement('h3');
    titulo.textContent = produto.nome;

    const preco = document.createElement('div');
    preco.className = 'preco';
    const riscado = document.createElement('span');
    riscado.textContent = `R$ ${precoAntigo}`;
    preco.append(precoFormatado, riscado);

    // addEventListener em vez de onclick="...('nome')": um nome com aspas quebrava (ou injetava) o código
    const botao = document.createElement('button');
    botao.className = 'btn';
    botao.textContent = 'Adicionar ao Carrinho';
    botao.addEventListener('click', () => {
        adicionarAoCarrinho(produto.id, produto.nome, produto.preco, produto.caminho_imagem);
    });

    cartao.append(imagem, titulo, preco, botao);
    return cartao;
}

carregarEstoque();
