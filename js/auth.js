const API_USUARIOS = 'http://localhost:8080/api/usuarios';

// --- LÓGICA DE CADASTRO ---
async function cadastrarUsuario(event) {
    event.preventDefault(); // Impede a página de recarregar

    const idsCamposCadastro = ['nome', 'email', 'data_nascimento', 'cpf', 'telefone', 'senha'];
    let formularioValido = true;

    idsCamposCadastro.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            const msgErro = input.parentElement.querySelector('.erro-msg');

            if (!input.value.trim()) {
                input.classList.add('input-erro');
                if (msgErro) msgErro.classList.add('mostrar-erro');
                formularioValido = false;
            } else {
                input.classList.remove('input-erro');
                if (msgErro) msgErro.classList.remove('mostrar-erro');
            }
        }
    });

    if (!formularioValido) return;

    // Cria o pacote de dados EXATAMENTE com os nomes esperados pelo Java
    const novoUsuario = {
        nome: document.getElementById('nome').value,
        nascimento: document.getElementById('data_nascimento').value,
        telefone: document.getElementById('telefone').value,
        cpf: document.getElementById('cpf').value,
        email: document.getElementById('email').value,
        senha: document.getElementById('senha').value
    };

    try {
        const resposta = await fetch(`${API_USUARIOS}/registrar`, {
            method: 'POST',
            credentials: 'include', // deixa o navegador guardar o cookie do token
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoUsuario)
        });

        if (resposta.ok) {
            // Confere a sessão pelo MESMO caminho que o login usa
            if (!await confirmarSessao()) return;

            alert("✅ Cadastro realizado com sucesso!");
            window.location.href = destinoAposLogin();
        } else {
            const erro = await resposta.text();
            alert("❌ Erro no cadastro: " + erro);
        }
    } catch (erro) {
        console.error("Erro no cadastro:", erro);
        alert("Erro de conexão com o banco de dados.");
    }
}

// --- LÓGICA DE LOGIN ---
async function fazerLogin(event) {
    event.preventDefault(); // Impede a página de recarregar

    const idsCamposLogin = ['email-login', 'senha-login'];
    let formularioValido = true;

    idsCamposLogin.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            const msgErro = input.parentElement.querySelector('.erro-msg');

            if (!input.value.trim()) {
                input.classList.add('input-erro');
                if (msgErro) msgErro.classList.add('mostrar-erro');
                formularioValido = false;
            } else {
                input.classList.remove('input-erro');
                if (msgErro) msgErro.classList.remove('mostrar-erro');
            }
        }
    });

    if (!formularioValido) return;

    const dadosLogin = {
        email: document.getElementById('email-login').value,
        senha: document.getElementById('senha-login').value
    };

    try {
      
        const resposta = await fetch(`${API_USUARIOS}/login`, {
            method: 'POST',
            credentials: 'include', // deixa o navegador guardar o cookie do token
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosLogin)
        });

        if (resposta.ok) {
            const usuario = await confirmarSessao();
            if (!usuario) return;

            alert("✅ Login aprovado! Bem-vindo(a), " + usuario.nome + "!");
            window.location.href = destinoAposLogin();
        } else {
            const erro = await resposta.text();
            alert("❌ Erro no login: " + erro);
        }
    } catch (erro) {
        console.error("Erro no login:", erro);
        alert("Erro de conexão com o servidor.");
    }
}

// --- SESSÃO: O SERVIDOR É A ÚNICA FONTE DA VERDADE ---
// O token vive num cookie HttpOnly: este JavaScript não consegue lê-lo, de propósito.

/**
 * Única fonte da verdade sobre "estou logado?" em todo o site.
 * Devolve { id, nome, email, role } ou null (sem login, token vencido ou API fora do ar).
 */
async function estaLogado() {
    try {
        const resposta = await fetch(`${API_USUARIOS}/me`, { credentials: 'include' });
        if (!resposta.ok) return null; // 401 = sem cookie, ou token inválido/vencido
        return await resposta.json();
    } catch (erro) {
        console.error('Não foi possível consultar a sessão no servidor:', erro);
        return null;
    }
}

/**
 * Depois do login/cadastro, confirma que o navegador realmente guardou o cookie.
 * Sem isso, um cookie recusado pelo navegador pareceria "login aprovado" e
 * a pessoa cairia deslogada na página seguinte, sem explicação.
 */
async function confirmarSessao() {
    const usuario = await estaLogado();
    if (!usuario) {
        console.error(
            'Login aceito pelo servidor, mas o cookie da sessão não voltou no /me. ' +
            'Em desenvolvimento, abra o site por http://localhost:5500 (e não 127.0.0.1): ' +
            'o cookie SameSite=Strict só vai para a API (localhost:8080) se o site também for localhost.'
        );
        alert('Não foi possível iniciar a sessão neste navegador. Tente novamente.');
    }
    return usuario;
}

// Chaves da época em que a sessão ficava no localStorage. Nada disso é usado mais;
// apagamos para não deixar tokens antigos esquecidos no navegador.
function limparSessao() {
    ['idUsuarioLogado', 'nome', 'emailUsuario', 'token', 'role', 'usuarioLogado']
        .forEach(chave => localStorage.removeItem(chave));
}

// As páginas dentro de /pages precisam de "../" para chegar no index.html
function caminhoRaiz() {
    return window.location.pathname.includes('/pages/') ? '../' : './';
}

function irParaLogin() {
    window.location.href = caminhoRaiz() + 'pages/login.html';
}

async function fazerLogout() {
    try {
        // Só o servidor consegue apagar um cookie HttpOnly
        await fetch(`${API_USUARIOS}/logout`, { method: 'POST', credentials: 'include' });
    } catch (erro) {
        console.error('Não foi possível avisar o servidor do logout:', erro);
    }
    limparSessao();
    window.location.href = caminhoRaiz() + 'index.html';
}

/**
 * Para onde ir depois de logar/cadastrar.
 * - Pelo carrinho (modal): segue para o checkout, como antes.
 * - Pela página de login (menu): a página define data-pos-login no <body>.
 */
function destinoAposLogin() {
    return document.body.dataset.posLogin || 'checkout.html';
}

// Troca o "Login" do menu por "Sair" quando o usuário já está logado
async function atualizarMenuLogin() {
    const linksLogin = document.querySelectorAll('.link-login');
    if (linksLogin.length === 0 || !await estaLogado()) return;

    linksLogin.forEach(link => {
        link.textContent = 'Sair';
        link.href = '#';
        link.addEventListener('click', (event) => {
            event.preventDefault();
            fazerLogout();
        });
    });
}

atualizarMenuLogin();

// --- ALTERNAR ENTRE "ENTRAR" E "CRIAR CONTA" ---
// Mostra só uma das caixas por vez. modo = 'login' ou 'cadastro'
function mostrarAbaAuth(modo) {
    document.querySelectorAll('.auth-container').forEach(container => {
        container.classList.toggle('modo-cadastro', modo === 'cadastro');
    });
}

document.querySelectorAll('[data-auth-ir]').forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        mostrarAbaAuth(link.dataset.authIr);
    });
});

limparSessao();

// ---CONECTANDO FORMULÁRIOS---

const formLogin = document.getElementById('form-login');
if (formLogin) {
    formLogin.addEventListener('submit', fazerLogin);
}

const formCadastro = document.getElementById('form-cadastro');
if (formCadastro) {
    formCadastro.addEventListener('submit', cadastrarUsuario);
}

const todosInputs = document.querySelectorAll('.auth-box input');

todosInputs.forEach(input => {
    input.addEventListener('blur', () => {
        const msgErro = input.parentElement.querySelector('.erro-msg');
        if (!input.value.trim()) {
            input.classList.add('input-erro');
            if (msgErro) msgErro.classList.add('mostrar-erro');
        }
    });

    input.addEventListener('input', () => {
        const msgErro = input.parentElement.querySelector('.erro-msg');
        if (input.value.trim()) {
            input.classList.remove('input-erro');
            if (msgErro) msgErro.classList.remove('mostrar-erro');
        }
    });
});