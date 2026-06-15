// auth.js

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);

// Referência para Auth
const auth = firebase.auth();

document.getElementById('login-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const email = document.getElementById('user').value;
  const password = document.getElementById('pass').value;

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Login OK - redireciona exemplo:
      window.location.href = "dashboard_admin.html";
    })
    .catch((error) => {
      alert('Erro no login: ' + error.message);
    });
});
