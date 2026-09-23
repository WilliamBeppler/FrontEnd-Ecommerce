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
        const resposta = await fetch('http://localhost:8080/api/usuarios/registrar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoUsuario)
        });

        if (resposta.ok) {
            const usuarioCriado = await resposta.json();

            // Salva a sessão pelo MESMO caminho que o login usa
            if (!salvarSessao(usuarioCriado, novoUsuario.email)) return;

            alert("✅ Cadastro realizado com sucesso!");
            window.location.href = 'checkout.html';
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
      
        const resposta = await fetch('http://localhost:8080/api/usuarios/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosLogin)
        });

        if (resposta.ok) {
            const usuarioResponse = await resposta.json();

            // CORREÇÃO PRINCIPAL: salva TODAS as chaves da sessão, incluindo o id.
            // Antes só token/nome/role eram salvos, e o checkout lê 'idUsuarioLogado'.
            if (!salvarSessao(usuarioResponse, dadosLogin.email)) return;

            alert("✅ Login aprovado! Bem-vindo(a), " + usuarioResponse.nome + "!");
            window.location.href = 'checkout.html';
        } else {
            const erro = await resposta.text();
            alert("❌ Erro no login: " + erro);
        }
    } catch (erro) {
        console.error("Erro no login:", erro);
        alert("Erro de conexão com o servidor.");
    }
}

// --- SESSÃO: UM ÚNICO LUGAR QUE GRAVA, UM ÚNICO LUGAR QUE LÊ ---

function salvarSessao(usuario, emailDigitado) {
    if (!usuario || usuario.id === undefined || usuario.id === null) {
        console.error(
            "A resposta do back-end não trouxe o campo 'id'. Resposta recebida:",
            usuario
        );
        alert(
            "Erro interno: o servidor não retornou o identificador do usuário. " +
            "Verifique o DTO de resposta no back-end."
        );
        return false;
    }

    localStorage.setItem('idUsuarioLogado', usuario.id);
    localStorage.setItem('nome', usuario.nome || '');
    localStorage.setItem('emailUsuario', usuario.email || emailDigitado || '');

    if (usuario.token) localStorage.setItem('token', usuario.token);
    if (usuario.role) localStorage.setItem('role', usuario.role);

    return true;
}

/**
 * Única fonte da verdade sobre "estou logado?" em todo o site.
 */
function estaLogado() {
    const id = localStorage.getItem('idUsuarioLogado');
    const token = localStorage.getItem('token');

    if (!id || id === 'undefined' || id === 'null') return false;
    if (!token) return false;
    if (tokenExpirado(token)) {
        console.warn('Token expirado, limpando a sessão.');
        limparSessao();
        return false;
    }
    return true;
}

/** Lê o campo 'exp' de dentro do JWT sem precisar chamar o servidor. */
function tokenExpirado(token) {
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        if (!payload.exp) return false;
        return payload.exp * 1000 <= Date.now();
    } catch (e) {
        return true; // token malformado conta como inválido
    }
}

function limparSessao() {
    ['idUsuarioLogado', 'nome', 'emailUsuario', 'token', 'role', 'usuarioLogado']
        .forEach(chave => localStorage.removeItem(chave));
}

function fazerLogout() {
    limparSessao();
    window.location.href = 'index.html';
}

localStorage.removeItem('usuarioLogado');

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