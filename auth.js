// auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Adiciona um listener para o botão de login
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

// Função para lidar com o envio do formulário de login
async function handleLogin(e) {
    e.preventDefault();
    
    const emailInput = document.getElementById('user');
    const passwordInput = document.getElementById('pass');

    const email = emailInput.value;
    const password = passwordInput.value;
    
    // Simples validação visual para feedback
    emailInput.style.border = "1px solid #ccc";
    passwordInput.style.border = "1px solid #ccc";
    
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Verifique o tipo de usuário no Firestore
        const userDocRef = doc(db, "usuarios", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const tipoUsuario = userData.role;

            if (tipoUsuario === 'admin') {
                window.location.href = "dashboard_admin.html";
            } else if (tipoUsuario === 'professor') {
                window.location.href = "dashboard_professor.html";
            } else {
                alert("Tipo de usuário não reconhecido.");
            }
        } else {
            alert("Dados de usuário não encontrados.");
        }
    } catch (error) {
        const errorCode = error.code;
        console.error("Erro de autenticação:", errorCode);
        if (errorCode === 'auth/invalid-email' || errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
            alert("Credenciais inválidas. Verifique seu email e senha.");
        } else {
            alert("Ocorreu um erro. Tente novamente mais tarde.");
        }
    }
}
