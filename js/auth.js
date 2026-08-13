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

            alert("✅ Cadastro realizado com sucesso!");
            localStorage.setItem('usuarioLogado', 'true');
            localStorage.setItem('emailUsuario', novoUsuario.email);

            localStorage.setItem('idUsuarioLogado', usuarioCriado.id);
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

            alert("✅ Login aprovado! Bem-vindo(a), " + usuarioResponse.nome + "!"); 
            localStorage.setItem('usuarioLogado', 'true');
            localStorage.setItem('emailUsuario', dadosLogin.email);

            localStorage.setItem('idUsuarioLogado', usuarioResponse.id);
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