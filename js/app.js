// ================================
// 🚀 TECHMESS ERP + E-COMMERCE
// Com Detetive de Erros Integrado
// ================================

// === CONFIGURAÇÃO DO FIREBASE ===
const firebaseConfig = {
  apiKey: "AIzaSyARb-0QE9QcYD2OjkCsOj0pmKTgkJQRlSg",
  authDomain: "vipcell-gestor.firebaseapp.com",
  projectId: "vipcell-gestor",
  storageBucket: "vipcell-gestor.appspot.com",
  messagingSenderId: "259960306679",
  appId: "1:259960306679:web:ad7a41cd1842862f7f8cf2",
  databaseURL: "https://vipcell-gestor-default-rtdb.firebaseio.com/"
};

// Inicializar Firebase
try {
  firebase.initializeApp(firebaseConfig);
} catch (e) {
  // Pode já estar inicializado
}

const auth = firebase.auth();
const db = firebase.database();

// === CLOUDINARY ===
const cloudName = 'dmuvm1o6m';
const uploadPreset = 'poh3ej4m';

// === ESTADO GLOBAL ===
let currentUser = null;
let currentScreen = 'home';
let products = [];
let suppliers = [];
let sales = [];
let purchases = [];
let accounts = [];
let cart = [];

// === DOM ===
const app = document.getElementById('app');

// ================================
// 🔍 TECHMESS DETECTIVE v1.0
// Sistema inteligente de diagnóstico e correção de erros
// ================================

class TechmessDetective {
  constructor() {
    this.report = {
      firebaseConfig: false,
      databaseConnection: false,
      authState: false,
      dataLoaded: false,
      cloudinaryReady: false,
      errors: [],
      warnings: []
    };
  }

  async investigate() {
    console.log("🔍 Techmess Detective: Iniciando investigação...");

    // 1. Verificar configuração do Firebase
    this.checkFirebaseConfig();

    // 2. Testar conexão com o banco
    if (this.report.firebaseConfig) {
      await this.testDatabaseAccess();
    }

    // 3. Verificar estado de autenticação
    await this.checkAuthState();

    // 4. Tentar carregar dados
    if (this.report.databaseConnection && this.report.authState) {
      await this.loadDataSafely();
    }

    // 5. Verificar Cloudinary
    this.checkCloudinary();

    // Exibir relatório
    this.presentReport();
  }

  checkFirebaseConfig() {
    const required = ['apiKey', 'authDomain', 'projectId', 'databaseURL'];
    const missing = required.filter(key => !firebaseConfig[key]);

    if (missing.length === 0) {
      this.report.firebaseConfig = true;
    } else {
      this.report.errors.push(`Firebase Config: faltando ${missing.join(', ')}`);
    }
  }

  async testDatabaseAccess() {
    try {
      const testRef = db.ref('.info/connected');
      const snapshot = await Promise.race([
        testRef.once('value'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
      ]);
      if (snapshot.val() === true) {
        this.report.databaseConnection = true;
      } else {
        this.report.errors.push("Não foi possível conectar ao Realtime Database.");
      }
    } catch (err) {
      this.report.errors.push(`Erro de conexão: ${err.message || 'Timeout ou rede falhou'}`);
    }
  }

  async checkAuthState() {
    return new Promise(resolve => {
      const unsubscribe = auth.onAuthStateChanged(user => {
        currentUser = user;
        this.report.authState = true;
        if (!user) {
          this.report.warnings.push("Nenhum usuário logado. Acesse como visitante ou faça login.");
        }
        unsubscribe();
        resolve();
      }, err => {
        this.report.errors.push(`Erro de autenticação: ${err.message}`);
        resolve();
      });
    });
  }

  async loadDataSafely() {
    const paths = ['products', 'sales', 'suppliers', 'purchases', 'accounts'];
    let hasData = false;

    for (const path of paths) {
      try {
        const snapshot = await Promise.race([
          db.ref(path).once('value'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
        ]);
        window[path] = Object.values(snapshot.val() || {});
        if (Object.keys(snapshot.val() || {}).length > 0) {
          hasData = true;
        }
      } catch (err) {
        this.report.errors.push(`Erro ao ler ${path}: ${err.message}`);
      }
    }

    this.report.dataLoaded = hasData;
    if (!hasData) {
      this.report.warnings.push("Nenhum dado encontrado no banco. A aplicação usará modo de demonstração.");
      this.loadDemoData();
    }
  }

  loadDemoData() {
    products = [
      {
        id: 'demo_001',
        name: 'iPhone 15',
        price: 5000,
        quantity: 10,
        alertLevel: 3,
        description: 'Smartphone Apple de última geração',
        imageUrl: 'https://res.cloudinary.com/dmuvm1o6m/image/upload/v1680000000/placeholder.jpg'
      },
      {
        id: 'demo_002',
        name: 'Smart TV 55"',
        price: 3200,
        quantity: 5,
        alertLevel: 2,
        description: 'TV 4K com Wi-Fi',
        imageUrl: 'https://res.cloudinary.com/dmuvm1o6m/image/upload/v1680000000/placeholder.jpg'
      },
      {
        id: 'demo_003',
        name: 'Notebook Gamer',
        price: 8000,
        quantity: 3,
        alertLevel: 2,
        description: 'Intel i7, 16GB RAM, RTX 3060',
        imageUrl: 'https://res.cloudinary.com/dmuvm1o6m/image/upload/v1680000000/placeholder.jpg'
      }
    ];
    sales = [];
    suppliers = [
      { id: 'sup_001', name: 'Distribuidora TechGlobal', email: 'contato@techglobal.com' }
    ];
    purchases = [];
    accounts = [];
  }

  checkCloudinary() {
    if (typeof cloudinary !== 'undefined') {
      this.report.cloudinaryReady = true;
    } else {
      this.report.warnings.push("Cloudinary não carregado. Upload de imagens desativado.");
    }
  }

  presentReport() {
    const app = document.getElementById('app');
    
    if (this.report.errors.length > 0) {
      app.innerHTML = `
        <div class="flex flex-col items-center justify-center min-h-screen bg-dark text-red-300 p-6">
          <h1 class="text-2xl font-bold mb-4 text-red-400">🚨 Erro Detectado</h1>
          <div class="bg-red-900 bg-opacity-30 p-6 rounded-lg max-w-lg w-full">
            <h2 class="font-bold mb-2">Problemas encontrados:</h2>
            <ul class="list-disc list-inside text-sm space-y-1 mb-4">
              ${this.report.errors.map(e => `<li>${e}</li>`).join('')}
            </ul>
            <h3 class="font-semibold mt-4">Soluções:</h3>
            <ol class="list-decimal list-inside text-sm space-y-1">
              <li>Verifique sua conexão com a internet</li>
              <li>No Firebase Console, vá para <strong>Realtime Database > Rules</strong> e use:
<pre class="bg-black p-2 rounded text-xs mt-1">{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}</pre>
              </li>
              <li>Adicione pelo menos um produto no banco de dados</li>
              <li>Use <strong>Firebase Hosting</strong> em vez de GitHub Pages para evitar bloqueios</li>
            </ol>
            <button onclick="location.reload()" class="btn-neon mt-4 w-full">Tentar Novamente</button>
          </div>
        </div>
      `;
      console.error("Techmess Detective Report:", this.report);
      return;
    }

    if (this.report.warnings.length > 0) {
      app.innerHTML = `
        <div class="flex flex-col items-center justify-center min-h-screen bg-dark p-6">
          <h1 class="text-2xl font-bold mb-4 accent-text">⚠️ Modo de Demonstração</h1>
          <div class="bg-yellow-900 bg-opacity-30 p-6 rounded-lg max-w-lg w-full text-yellow-200">
            <p class="mb-3">A aplicação está funcionando com dados de exemplo porque:</p>
            <ul class="list-disc list-inside text-sm space-y-1 mb-4">
              ${this.report.warnings.map(w => `<li>${w}</li>`).join('')}
            </ul>
            <button onclick="window.startApp()" class="btn-neon w-full">Continuar com Demo</button>
          </div>
        </div>
      `;
      window.startApp = () => {
        renderApp();
      };
      return;
    }

    // Tudo OK
    renderApp();
  }
}

// ================================
// 🚀 FUNÇÕES DE RENDERIZAÇÃO
// ================================

function renderApp() {
  if (!currentUser && currentScreen !== 'home') {
    renderLogin();
  } else if (currentScreen === 'home') {
    renderPublicStore();
  } else {
    renderERP();
  }
}

function renderLogin() {
  app.innerHTML = `
    <div class="flex items-center justify-center min-h-screen bg-dark">
      <div class="bg-secondary p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 class="text-2xl font-bold text-center mb-6 accent-text">Techmess Admin</h1>
        <form id="loginForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">E-mail</label>
            <input type="email" id="email" class="input-dark w-full" required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Senha</label>
            <input type="password" id="password" class="input-dark w-full" required />
          </div>
          <button type="submit" class="btn-neon w-full py-3 mt-4">Entrar</button>
        </form>
        <p id="loginError" class="text-red-400 text-sm mt-2 hidden">Erro ao fazer login.</p>
      </div>
    </div>
  `;

  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('loginError');

    try {
      await auth.signInWithEmailAndPassword(email, password);
    } catch (err) {
      errorEl.classList.remove('hidden');
      errorEl.textContent = err.message;
    }
  });
}

// === VITRINE PÚBLICA ===
function renderPublicStore() {
  app.innerHTML = `
    <header class="bg-primary p-4 flex justify-between items-center">
      <h1 class="text-xl font-bold accent-text">Techmess</h1>
      <button id="goToERP" class="btn-neon text-sm">Admin</button>
    </header>
    <main class="p-6 flex-1">
      <h2 class="text-2xl font-bold mb-6">Produtos</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="productGrid"></div>
      ${cart.length > 0 ? `<button onclick="openCheckout()" class="btn-neon mt-6">🛒 Ver Carrinho (${cart.reduce((acc, i) => acc + i.qty, 0)})</button>` : ''}
    </main>
    <footer class="p-4 text-center text-gray-500 text-sm">© 2025 Techmess. Todos os direitos reservados.</footer>
  `;

  document.getElementById('goToERP').onclick = () => {
    currentScreen = 'dashboard';
    renderERP();
  };

  renderProductGrid();
}

function renderProductGrid() {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = products.length === 0
    ? '<p>Nenhum produto disponível.</p>'
    : products.map(p => `
      <div class="bg-secondary p-4 rounded-lg">
        <img src="${p.imageUrl || 'https://res.cloudinary.com/dmuvm1o6m/image/upload/v1680000000/placeholder.jpg'}" 
             alt="${p.name}" class="w-full h-40 object-cover rounded mb-3">
        <h3 class="font-semibold">${p.name}</h3>
        <p class="text-accent font-bold">R$ ${parseFloat(p.price).toFixed(2)}</p>
        <p class="text-xs text-gray-400">${p.description || ''}</p>
        <span class="${p.quantity === 0 ? 'badge-out' : p.quantity <= p.alertLevel ? 'badge-low' : 'badge-in'}">
          ${p.quantity === 0 ? 'Esgotado' : `${p.quantity} em estoque`}
        </span>
        ${p.quantity > 0 ? `<button class="btn-neon mt-2 w-full" onclick="addToCart('${p.id}')">Adicionar ao Carrinho</button>` : ''}
      </div>
    `).join('');
}

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  const item = cart.find(i => i.id === productId);
  if (item) {
    item.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  alert(`${product.name} adicionado ao carrinho!`);
  renderPublicStore();
}

// === CHECKOUT ===
window.openCheckout = function() {
  const modal = document.createElement('div');
  modal.classList.add('modal-overlay');
  modal.innerHTML = `
    <div class="bg-secondary p-6 rounded-lg shadow-lg w-full max-w-md">
      <h3 class="text-xl font-bold mb-4">Finalizar Pedido</h3>
      <form id="checkoutForm">
        <div class="mb-4">
          <label>Nome</label>
          <input type="text" id="customerName" class="input-dark w-full" required>
        </div>
        <div class="mb-4">
          <label>WhatsApp (com DDD)</label>
          <input type="text" id="whatsapp" class="input-dark w-full" placeholder="11999999999" required>
        </div>
        <div class="mb-4">
          <h4>Itens:</h4>
          <ul class="text-sm">
            ${cart.map(i => `<li>${i.qty}x ${i.name} - R$ ${(i.price * i.qty).toFixed(2)}</li>`).join('')}
          </ul>
          <p class="font-bold mt-2">Total: R$ ${cart.reduce((acc, i) => acc + i.price * i.qty, 0).toFixed(2)}</p>
        </div>
        <div class="flex justify-end space-x-2">
          <button type="button" id="cancelCheckout" class="btn-neon">Cancelar</button>
          <button type="submit" class="btn-neon">Enviar no WhatsApp</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('cancelCheckout').onclick = () => document.body.removeChild(modal);
  document.getElementById('checkoutForm').onsubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById('customerName').value;
    const phone = document.getElementById('whatsapp').value;
    const message = encodeURIComponent(
      `*Novo Pedido - Techmess*\nCliente: ${name}\nItens:\n${cart.map(i => `${i.qty}x ${i.name}`).join('\n')}\nTotal: R$ ${cart.reduce((acc, i) => acc + i.price * i.qty, 0).toFixed(2)}`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    
    db.ref('sales').push({
      customerId: name,
      items: cart.map(i => ({ id: i.id, name: i.name, qty: i.qty, price: i.price })),
      total: cart.reduce((acc, i) => acc + i.price * i.qty, 0),
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      customerName: name,
      whatsapp: phone
    });

    cart = [];
    document.body.removeChild(modal);
    renderPublicStore();
  };
};

// === ERP ===
function renderERP() {
  app.innerHTML = `
    <div class="flex h-full">
      <aside class="w-64 bg-primary h-full min-h-screen p-4 hidden md:block">
        <h1 class="text-xl font-bold accent-text mb-8">Techmess ERP</h1>
        <nav class="space-y-2">${generateNav()}</nav>
      </aside>
      <div class="md:hidden bg-primary p-4 flex justify-between items-center">
        <h1 class="text-lg font-bold accent-text">Techmess</h1>
        <button id="menuToggle" class="text-accent">☰</button>
      </div>
      <div id="mobileMenu" class="fixed inset-0 bg-black bg-opacity-75 z-40 hidden">
        <div class="bg-primary w-64 h-full p-4">
          <button id="closeMenu" class="float-right text-accent mb-4">✕</button>
          <nav class="space-y-4 mt-8">${generateNav()}</nav>
        </div>
      </div>
      <main class="flex-1 p-6 bg-dark overflow-y-auto" id="mainContent"></main>
    </div>
  `;

  setupNavEvents();
  navigateTo(currentScreen);
}

function generateNav() {
  return `
    <a href="#" data-screen="dashboard" class="block p-2 rounded hover:text-accent transition">Dashboard</a>
    <a href="#" data-screen="sales" class="block p-2 rounded hover:text-accent transition">Vendas</a>
    <a href="#" data-screen="purchases" class="block p-2 rounded hover:text-accent transition">Compras</a>
    <a href="#" data-screen="inventory" class="block p-2 rounded hover:text-accent transition">Estoque</a>
    <a href="#" data-screen="finance" class="block p-2 rounded hover:text-accent transition">Financeiro</a>
    <a href="#" data-screen="suppliers" class="block p-2 rounded hover:text-accent transition">Fornecedores</a>
    <a href="#" id="logoutBtn" class="block p-2 rounded text-red-400 hover:text-red-200 transition">Sair</a>
  `;
}

function setupNavEvents() {
  document.querySelectorAll('[data-screen]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(e.target.getAttribute('data-screen'));
    });
  });
  document.getElementById('logoutBtn').addEventListener('click', logout);
  document.getElementById('menuToggle').addEventListener('click', () => {
    document.getElementById('mobileMenu').classList.remove('hidden');
  });
  document.getElementById('closeMenu').addEventListener('click', () => {
    document.getElementById('mobileMenu').classList.add('hidden');
  });
}

async function navigateTo(screen) {
  currentScreen = screen;
  const main = document.getElementById('mainContent');
  main.innerHTML = '<div class="flex items-center justify-center h-64"><div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div></div>';
  
  // Recarregar dados se necessário
  if (['dashboard', 'inventory', 'sales'].includes(screen)) {
    await loadDataSafelyForNav();
  }

  setTimeout(() => {
    switch (screen) {
      case 'dashboard': renderDashboard(); break;
      case 'inventory': renderInventory(); break;
      case 'sales': renderSales(); break;
      case 'purchases': renderPurchases(); break;
      case 'finance': renderFinance(); break;
      case 'suppliers': renderSuppliers(); break;
      default: renderDashboard();
    }
  }, 200);
}

async function loadDataSafelyForNav() {
  const paths = ['products', 'sales'];
  for (const path of paths) {
    try {
      const snapshot = await db.ref(path).once('value');
      window[path] = Object.values(snapshot.val() || {});
    } catch (err) {
      console.warn(`Erro ao carregar ${path}:`, err.message);
    }
  }
}

function renderDashboard() {
  const today = new Date().toISOString().split('T')[0];
  const salesToday = sales.filter(s => s.date === today && s.status === 'confirmed');
  const revenue = salesToday.reduce((acc, s) => acc + s.total, 0);
  const avgTicket = salesToday.length ? (revenue / salesToday.length).toFixed(2) : '0.00';
  const lowStock = products.filter(p => p.quantity <= p.alertLevel);

  document.getElementById('mainContent').innerHTML = `
    <h2 class="text-2xl font-bold mb-6">Dashboard</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="kpi-card"><h3>Faturamento Hoje</h3><p>R$ ${revenue.toFixed(2)}</p></div>
      <div class="kpi-card"><h3>Vendas Hoje</h3><p>${salesToday.length}</p></div>
      <div class="kpi-card"><h3>Ticket Médio</h3><p>R$ ${avgTicket}</p></div>
    </div>
    ${lowStock.length > 0 ? `
    <div class="bg-red-900 bg-opacity-50 p-4 rounded border border-red-600">
      <h3 class="font-semibold text-red-300">⚠️ Estoque Baixo</h3>
      <ul>${lowStock.map(p => `<li>${p.name} (${p.quantity})</li>`).join('')}</ul>
    </div>` : '<p>Nenhum alerta de estoque.</p>'}
  `;
}

function renderInventory() {
  const main = document.getElementById('mainContent');
  main.innerHTML = `
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Estoque</h2>
      <button id="btnAddProduct" class="btn-neon">+ Novo Produto</button>
    </div>
    <div class="table-container">
      <table><thead><tr>
        <th>Imagem</th>
        <th>Nome</th>
        <th>Preço</th>
        <th>Quantidade</th>
        <th>Status</th>
        <th>Ações</th>
      </tr></thead>
      <tbody id="productList"></tbody>
      </table>
    </div>
  `;
  renderProductList();
  document.getElementById('btnAddProduct').addEventListener('click', openProductModal);
}

function renderProductList() {
  const tbody = document.getElementById('productList');
  tbody.innerHTML = products.map(p => {
    const status = p.quantity === 0 ? 'Esgotado' : p.quantity <= p.alertLevel ? 'Baixo' : 'Normal';
    const badge = p.quantity === 0 ? 'badge-out' : p.quantity <= p.alertLevel ? 'badge-low' : 'badge-in';
    return `
      <tr>
        <td><img src="${p.imageUrl || 'https://res.cloudinary.com/dmuvm1o6m/image/upload/v1680000000/placeholder.jpg'}" class="w-10 h-10 object-cover rounded" /></td>
        <td>${p.name}</td>
        <td>R$ ${p.price}</td>
        <td>${p.quantity}</td>
        <td><span class="${badge}">${status}</span></td>
        <td>
          <button class="text-accent text-sm mr-2" onclick="openProductModal('${p.id}')">Editar</button>
          <button class="text-red-400 text-sm" onclick="deleteProduct('${p.id}')">Excluir</button>
          <button class="text-blue-400 text-sm ml-2" onclick="viewKardex('${p.id}')">Kardex</button>
        </td>
      </tr>
    `;
  }).join('');
}

function openProductModal(productId = null) {
  const product = productId ? products.find(p => p.id === productId) : null;
  const modal = document.createElement('div');
  modal.classList.add('modal-overlay');
  modal.innerHTML = `
    <div class="bg-secondary p-6 rounded-lg shadow-lg w-full max-w-lg">
      <h3 class="text-xl font-bold mb-4">${product ? 'Editar' : 'Novo'} Produto</h3>
      <form id="productForm">
        <input type="hidden" id="productId" value="${product?.id || ''}">
        <div class="mb-4"><label>Nome</label><input type="text" id="name" class="input-dark w-full" value="${product?.name || ''}" required></div>
        <div class="mb-4"><label>Preço</label><input type="number" step="0.01" id="price" class="input-dark w-full" value="${product?.price || ''}" required></div>
        <div class="mb-4"><label>Quantidade</label><input type="number" id="quantity" class="input-dark w-full" value="${product?.quantity || 0}" required></div>
        <div class="mb-4"><label>Alerta</label><input type="number" id="alertLevel" class="input-dark w-full" value="${product?.alertLevel || 5}" required></div>
        <div class="mb-4"><label>Descrição</label><textarea id="description" class="input-dark w-full" rows="2">${product?.description || ''}</textarea></div>
        <div class="mb-4"><label>Imagem</label><input type="text" id="imageUrl" class="input-dark w-full" value="${product?.imageUrl || ''}"><button type="button" id="uploadImage" class="btn-neon mt-1">Enviar Imagem</button></div>
        <div class="flex justify-end space-x-2">
          <button type="button" id="cancelProduct" class="btn-neon">Cancelar</button>
          <button type="submit" class="btn-neon">Salvar</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('cancelProduct').onclick = () => document.body.removeChild(modal);
  document.getElementById('uploadImage').onclick = () => {
    const widget = cloudinary.createUploadWidget({
      cloudName: cloudName,
      uploadPreset: uploadPreset
    }, (error, result) => {
      if (!error && result && result.event === "success") {
        document.getElementById('imageUrl').value = result.info.secure_url;
      }
    });
    widget.open();
  };

  document.getElementById('productForm').onsubmit = async (e) => {
    e.preventDefault();
    const data = {
      name: document.getElementById('name').value,
      price: parseFloat(document.getElementById('price').value),
      quantity: parseInt(document.getElementById('quantity').value),
      alertLevel: parseInt(document.getElementById('alertLevel').value),
      description: document.getElementById('description').value,
      imageUrl: document.getElementById('imageUrl').value,
      id: document.getElementById('productId').value
    };

    const ref = data.id ? db.ref(`products/${data.id}`) : db.ref('products').push();
    if (!data.id) data.id = ref.key;
    await ref.set(data);
    await loadDataSafelyForNav();
    renderProductList();
    document.body.removeChild(modal);
  };
}

async function deleteProduct(id) {
  if (confirm('Excluir?')) {
    await db.ref(`products/${id}`).remove();
    await loadDataSafelyForNav();
    renderProductList();
  }
}

function viewKardex(productId) {
  const product = products.find(p => p.id === productId);
  const movements = [
    ...sales.filter(s => s.items.some(i => i.id === productId)).map(s => ({ type: 'Saída', qty: s.items.find(i => i.id === productId).qty, date: s.date, ref: `Venda #${s.id}` })),
    ...purchases.filter(p => p.items.some(i => i.id === productId)).map(p => ({ type: 'Entrada', qty: p.items.find(i => i.id === productId).qty, date: p.date, ref: `Compra #${p.id}` }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const modal = document.createElement('div');
  modal.classList.add('modal-overlay');
  modal.innerHTML = `
    <div class="bg-secondary p-6 rounded-lg shadow-lg w-full max-w-lg">
      <h3 class="text-xl font-bold mb-4">Kardex - ${product.name}</h3>
      <div class="table-container"><table><tr><th>Tipo</th><th>Quantidade</th><th>Data</th><th>Referência</th></tr>
      ${movements.map(m => `<tr><td>${m.type}</td><td>${m.qty}</td><td>${m.date}</td><td>${m.ref}</td></tr>`).join('')}
      </table></div>
      <button onclick="this.parentElement.parentElement.remove()" class="btn-neon mt-4">Fechar</button>
    </div>
  `;
  document.body.appendChild(modal);
}

function logout() {
  auth.signOut().then(() => {
    currentUser = null;
    currentScreen = 'home';
    renderApp();
  });
}

// ================================
// 🚀 INICIALIZAÇÃO COM DETETIVE
// ================================

auth.onAuthStateChanged(async (user) => {
  currentUser = user;

  const loading = document.getElementById('loading');
  if (loading) loading.remove();

  const detective = new TechmessDetective();
  await detective.investigate();
});

// ================================
// 🔧 FUNÇÕES GLOBAIS
// ================================

window.addToCart = addToCart;
window.openCheckout = openCheckout;
window.openProductModal = openProductModal;
window.deleteProduct = deleteProduct;
window.viewKardex = viewKardex;
window.logout = logout;