// 1. Definição da versão do cache
const CACHE_NAME = 'pomodoro-timer-v1';

// 2. Lista de ativos essenciais para o funcionamento offline
// Certifique-se de que todos os arquivos que a página precisa estão aqui.
const urlsToCache = [
  '/', // Cuidado: barra simples é o 'index.html' na raiz
  'index.html',
  // Seus ativos (ícones, favicon, etc.)
  'assets/favico.svg',
  'assets/icon-192x192.png',
  'assets/icon-512x512.png'
  // Nota: Não podemos cachear o CDN do Tailwind (script externo).
  // O app ainda carregará offline, mas sem os estilos Tailwind.
  // Para ser 100% offline, você teria que baixar o Tailwind e servi-lo localmente.
];

// --- FASE DE INSTALAÇÃO ---
// O Service Worker se instala e armazena os ativos no cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto com sucesso. Ativos pré-armazenados.');
        return cache.addAll(urlsToCache);
      })
  );
});

// --- FASE DE ATIVAÇÃO ---
// Limpa caches antigos, garantindo que apenas a versão atual (CACHE_NAME) esteja ativa
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Excluindo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// --- ESTRATÉGIA DE BUSCA (FETCH) ---
// Tenta buscar o ativo no cache antes de ir para a rede
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retorna o que está no cache, se existir
        if (response) {
          return response;
        }

        // Se não houver no cache, busca na rede
        return fetch(event.request).catch(error => {
          // Trata erros de rede (pode retornar uma página offline customizada aqui)
          console.error('Falha na busca:', error);
        });
      })
  );
});