// firebase-init.js
// Inicializa o Firebase uma única vez e expõe _auth e _db globalmente.
// Deve ser incluído APÓS firebase-config.js e os scripts compat do Firebase.

(function () {
  // Evita inicializar mais de uma vez
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  // Auth disponível globalmente
  window._auth = firebase.auth();

  // Firestore disponível globalmente (se o SDK estiver carregado)
  if (typeof firebase.firestore === "function") {
    window._db = firebase.firestore();
  } else {
    console.warn("Firestore SDK não encontrado. Inclua firebase-firestore-compat.js.");
    window._db = null;
  }
})();
