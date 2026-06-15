// auth.js
// Gerencia o login com e-mail/senha e redireciona conforme o role do usuário.
// Depende de: firebase-init.js (window._auth e window._db)

(function () {
  const form = document.getElementById("login-form");
  const btnLogin = document.getElementById("btn-login");
  const msgErro = document.getElementById("msg-erro");

  // Mapeamento de role -> página de destino
  const DESTINO = {
    admin: "dashboard_admin.html",
    professor: "dashboard_professor.html",
  };

  // Se já estiver logado, redireciona direto
  window._auth.onAuthStateChanged(async (user) => {
    if (user) {
      await redirecionarPorRole(user.uid);
    }
  });

  // Submit do formulário de login
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    esconderErro();

    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;

    if (!email || !senha) {
      mostrarErro("Preencha e-mail e senha.");
      return;
    }

    btnLogin.disabled = true;
    btnLogin.textContent = "Entrando...";

    try {
      const credencial = await window._auth.signInWithEmailAndPassword(email, senha);
      await redirecionarPorRole(credencial.user.uid);
    } catch (err) {
      btnLogin.disabled = false;
      btnLogin.textContent = "Entrar";
      mostrarErro(traduzirErro(err.code));
    }
  });

  // Busca o role no Firestore e redireciona
  async function redirecionarPorRole(uid) {
    try {
      const doc = await window._db.collection("users").doc(uid).get();

      if (!doc.exists) {
        mostrarErro("Usuário não encontrado no sistema. Contate o administrador.");
        await window._auth.signOut();
        return;
      }

      const perfil = doc.data();

      if (!perfil.ativo) {
        mostrarErro("Sua conta está desativada. Contate o administrador.");
        await window._auth.signOut();
        return;
      }

      const destino = DESTINO[perfil.role];

      if (!destino) {
        mostrarErro("Perfil sem permissão definida. Contate o administrador.");
        await window._auth.signOut();
        return;
      }

      window.location.href = destino;

    } catch (err) {
      console.error("Erro ao buscar perfil:", err);
      mostrarErro("Erro ao carregar perfil. Tente novamente.");
    }
  }

  // Traduz códigos de erro do Firebase para PT-BR
  function traduzirErro(code) {
    const erros = {
      "auth/user-not-found": "E-mail não cadastrado.",
      "auth/wrong-password": "Senha incorreta.",
      "auth/invalid-email": "E-mail inválido.",
      "auth/too-many-requests": "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
      "auth/user-disabled": "Esta conta foi desativada.",
      "auth/invalid-credential": "E-mail ou senha incorretos.",
      "auth/network-request-failed": "Sem conexão com a internet.",
    };
    return erros[code] || "Erro ao fazer login. Tente novamente.";
  }

  function mostrarErro(msg) {
    if (msgErro) {
      msgErro.textContent = msg;
      msgErro.style.display = "block";
    }
  }

  function esconderErro() {
    if (msgErro) {
      msgErro.textContent = "";
      msgErro.style.display = "none";
    }
  }
})();
