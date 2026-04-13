import './style.css';

// 🔥 GARANTE QUE TUDO SÓ RODA DEPOIS DO DOM
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 MAIN INICIADO");

  try {
    // 🔥 Verifica se o app existe
    const app = document.getElementById('app');

    if (!app) {
      console.error("❌ ERRO CRÍTICO: div #app não encontrada");
      return;
    }

    console.log("✅ #app encontrada");

    // 🔥 IMPORTA app.js DEPOIS DO DOM
    await import('./app.js');

    console.log("✅ app.js carregado com sucesso");

  } catch (error) {
    console.error("❌ ERRO ao carregar app.js:", error);
  }
});


// 🚫 DESATIVADO EM DESENVOLVIMENTO (EVITA BUG DE CACHE)
// 👉 ATIVE APENAS EM PRODUÇÃO FINAL
/*
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('SW registrado:', registration);
      })
      .catch(error => {
        console.log('Erro no SW:', error);
      });
  });
}
*/
