/**
 * Techmess ERP - app.js
 * Senior Software Developer: Parceiro de Programacao
 * Description: Core logic for the Techmess ERP & E-commerce SPA.
 * Handles Firebase integration, UI manipulation, and business logic for all modules.
 */

// --- CONFIGURAÇÃO E INICIALIZAÇÃO ---
const firebaseConfig = {
    apiKey: "AIzaSyARb-0QE9QcYD2OjkCsOj0pmKTgkJQRlSg",
    authDomain: "vipcell-gestor.firebaseapp.com",
    databaseURL: "https://vipcell-gestor-default-rtdb.firebaseio.com",
    projectId: "vipcell-gestor",
    storageBucket: "vipcell-gestor.firebasestorage.app",
    messagingSenderId: "259960306679",
    appId: "1:259960306679:web:ad7a41cd1842862f7f8cf2"
};


const CLOUDINARY_CLOUD_NAME = 'dmuvm1o6m';
const CLOUDINARY_UPLOAD_PRESET = 'poh3ej4m';
const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// --- VARIÁVEIS GLOBAIS DE ESTADO ---
let cart = {};
let products = {};
let suppliers = {};
let customers = {};
let currentPurchaseItems = {};
let salesReportData = [];
let isErpInitialized = false;

// --- SELETORES DE ELEMENTOS DO DOM (CACHE) ---
const getElem = (id) => document.getElementById(id);
const querySel = (selector) => document.querySelector(selector);
const querySelAll = (selector) => document.querySelectorAll(selector);

const ui = {
    publicView: getElem('public-view'),
    managementPanel: getElem('management-panel'),
    authButton: getElem('auth-button'),
    nav: {
        home: getElem('nav-home'),
        shop: getElem('nav-shop'),
        cart: getElem('nav-cart'),
        dashboard: getElem('nav-dashboard'),
        cartItemCount: getElem('cart-item-count')
    },
    shop: {
        productList: getElem('product-list')
    },
    cart: {
        modal: getElem('cart-modal'),
        closeButton: getElem('close-cart-modal'),
        items: getElem('cart-items'),
        total: getElem('cart-total'),
        checkoutButton: getElem('checkout-button')
    },
    checkout: {
        modal: getElem('checkout-modal'),
        closeButton: getElem('close-checkout-modal'),
        nameInput: getElem('customer-name'),
        whatsappInput: getElem('customer-whatsapp'),
        submitButton: getElem('submit-checkout')
    },
    erp: {
        tabs: querySelAll('.tab-button'),
        contents: querySelAll('.tab-content'),
        dashboard: {
            content: getElem('dashboard-content'),
            monthlyRevenue: getElem('monthly-revenue'),
            dailySales: getElem('daily-sales'),
            lowStockAlerts: getElem('low-stock-alerts'),
            pendingOrdersCount: getElem('pending-orders-count'),
            totalCustomersCount: getElem('total-customers-count'),
            topSellingProducts: getElem('top-selling-products')
        },
        sales: {
            content: getElem('sales-content'),
            pendingOrders: getElem('pending-orders'),
            historyList: getElem('sales-history-list')
        },
        customers: {
            content: getElem('customers-content'),
            addButton: getElem('add-customer-button'),
            list: getElem('customer-list'),
            modal: getElem('customer-form-modal'),
            closeModalButton: getElem('close-customer-form-modal'),
            saveButton: getElem('save-customer-button'),
            title: getElem('customer-form-title'),
            idInput: getElem('customer-id'),
            nameInput: getElem('new-customer-name'),
            whatsappInput: getElem('new-customer-whatsapp'),
            emailInput: getElem('new-customer-email'),
            notesInput: getElem('new-customer-notes')
        },
        purchases: {
            content: getElem('purchases-content'),
            newButton: getElem('new-purchase-button'),
            list: getElem('purchase-list'),
            modal: getElem('purchase-form-modal'),
            closeModalButton: getElem('close-purchase-form-modal'),
            saveButton: getElem('save-purchase-button'),
            supplierSelect: getElem('purchase-supplier'),
            productSelect: getElem('purchase-product'),
            quantityInput: getElem('purchase-quantity'),
            priceInput: getElem('purchase-unit-price'),
            addItemButton: getElem('add-item-to-purchase-button'),
            itemsList: getElem('purchase-items-list'),
            total: getElem('purchase-total'),
            invoiceInput: getElem('purchase-invoice-number'),
            dateInput: getElem('purchase-date'),
            paymentMethodSelect: getElem('purchase-payment-method')
        },
        stock: {
            content: getElem('stock-content'),
            addButton: getElem('add-product-button'),
            list: getElem('product-management-list'),
            modal: getElem('product-form-modal'),
            closeModalButton: getElem('close-product-form-modal'),
            saveButton: getElem('save-product-button'),
            title: getElem('product-form-title'),
            idInput: getElem('product-id'),
            nameInput: getElem('product-name'),
            priceInput: getElem('product-price'),
            quantityInput: getElem('product-quantity'),
            descriptionInput: getElem('product-description'),
            alertLevelInput: getElem('product-alert-level'),
            imageUploadInput: getElem('product-image-upload')
        },
        finance: {
            content: getElem('finance-content'),
            transactions: getElem('financial-transactions'),
            cashBalance: getElem('cash-balance'),
            reportStartDate: getElem('report-start-date'),
            reportEndDate: getElem('report-end-date'),
            generateReportBtn: getElem('generate-report-button'),
            exportCsvBtn: getElem('export-csv-button'),
            reportResults: getElem('report-results')
        },
        suppliers: {
            content: getElem('suppliers-content'),
            addButton: getElem('add-supplier-button'),
            list: getElem('supplier-list'),
            modal: getElem('supplier-form-modal'),
            closeModalButton: getElem('close-supplier-form-modal'),
            saveButton: getElem('save-supplier-button'),
            title: getElem('supplier-form-title'),
            idInput: getElem('supplier-id'),
            nameInput: getElem('supplier-name'),
            contactInput: getElem('supplier-contact')
        }
    }
};

// --- FUNÇÕES DE UI ---

function switchView(viewToShow) {
    ui.publicView.classList.toggle('hidden', viewToShow !== 'public');
    ui.managementPanel.classList.toggle('hidden', viewToShow !== 'management');
    if (viewToShow === 'management') {
        switchTab('dashboard');
    }
}

function switchTab(tabId) {
    ui.erp.contents.forEach(content => content.classList.add('hidden'));
    getElem(`${tabId}-content`).classList.remove('hidden');

    ui.erp.tabs.forEach(button => {
        button.classList.remove('border-cyan-400', 'text-white');
        button.classList.add('border-transparent', 'text-gray-300');
    });
    const activeButton = querySel(`button[data-tab="${tabId}"]`);
    if (activeButton) {
        activeButton.classList.remove('border-transparent', 'text-gray-300');
        activeButton.classList.add('border-cyan-400', 'text-white');
    }
}

function toggleModal(modalElement, show) {
    modalElement.classList.toggle('hidden', !show);
}

// --- AUTENTICAÇÃO E INICIALIZAÇÃO DO PAINEL ---

function initializeErpPanel() {
    if (isErpInitialized) return;
    console.log("Inicializando dados do Painel de Gestão...");
    
    // Inicia os listeners de dados
    loadStockManagement();
    loadSupplierManagement();
    loadCustomerManagement();
    loadPurchases();
    loadSales();
    loadSalesHistory();
    loadFinance();
    
    // Listener para o Dashboard
    database.ref('vendas').on('value', () => updateDashboard());
    database.ref('pedidos').on('value', () => updateDashboard());
    database.ref('clientes').on('value', () => updateDashboard());
    database.ref('estoque').on('value', () => updateDashboard());

    isErpInitialized = true;
}

auth.onAuthStateChanged(user => {
    const isLoggedIn = !!user;
    ui.authButton.textContent = isLoggedIn ? 'Logout' : 'Login';
    ui.nav.dashboard.parentElement.classList.toggle('hidden', !isLoggedIn);
    
    if (isLoggedIn) {
        switchView('management');
        initializeErpPanel();
    } else {
        switchView('public');
        isErpInitialized = false;
    }
});

function handleAuthClick() {
    if (auth.currentUser) {
        auth.signOut();
    } else {
        const email = prompt('Digite o seu e-mail:');
        const password = prompt('Digite a sua senha:');
        if (email && password) {
            auth.signInWithEmailAndPassword(email, password)
                .catch(error => alert('Erro de login: ' + error.message));
        }
    }
}

// --- MÓDULO: DASHBOARD ---

async function updateDashboard() {
    console.log("Atualizando Dashboard...");
    
    // 1. Clientes Cadastrados
    const customersSnapshot = await database.ref('clientes').once('value');
    const allCustomers = customersSnapshot.val() || {};
    ui.erp.dashboard.totalCustomersCount.textContent = Object.keys(allCustomers).length;

    // 2. Pedidos Pendentes
    const pendingOrdersSnapshot = await database.ref('pedidos').orderByChild('status').equalTo('pendente').once('value');
    const pendingOrders = pendingOrdersSnapshot.val() || {};
    ui.erp.dashboard.pendingOrdersCount.textContent = Object.keys(pendingOrders).length;

    const salesSnapshot = await database.ref('vendas').once('value');
    const allSales = salesSnapshot.val() || {};
    
    let monthlyRevenue = 0;
    let dailySales = 0;
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
    
    const productSalesCount = {};

    Object.values(allSales).forEach(sale => {
        const saleDate = sale.data.slice(0, 10);
        // 3. Faturamento
        if (saleDate >= firstDayOfMonth) {
            monthlyRevenue += sale.total;
        }
        if (saleDate === todayStr) {
            dailySales += sale.total;
        }
        // 4. Contagem para Produtos Mais Vendidos
        Object.values(sale.itens).forEach(item => {
            const productId = Object.keys(products).find(key => products[key].nome === item.nome);
            if(productId) {
                 productSalesCount[productId] = (productSalesCount[productId] || 0) + item.quantity;
            }
        });
    });

    ui.erp.dashboard.monthlyRevenue.textContent = `R$ ${monthlyRevenue.toFixed(2).replace('.', ',')}`;
    ui.erp.dashboard.dailySales.textContent = `R$ ${dailySales.toFixed(2).replace('.', ',')}`;

    // 5. Produtos Mais Vendidos
    const sortedProducts = Object.entries(productSalesCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);
        
    ui.erp.dashboard.topSellingProducts.innerHTML = sortedProducts.length > 0 ? sortedProducts.map(([id, count]) => {
        const product = products[id];
        return product ? `
            <li class="flex items-center justify-between text-sm">
                <span>${product.nome}</span>
                <span class="font-bold text-cyan-400">${count} vendidos</span>
            </li>` : '';
    }).join('') : '<li>Nenhuma venda registrada ainda.</li>';
    
    // 6. Alertas de Estoque Baixo
    const lowStockItems = Object.entries(products).filter(([, p]) => p.quantidade <= p.nivelAlertaEstoque);
    ui.erp.dashboard.lowStockAlerts.innerHTML = lowStockItems.length > 0 ? lowStockItems.map(([, p]) =>
        `<li class="text-yellow-400">${p.nome} (Apenas ${p.quantidade} em estoque)</li>`
    ).join('') : '<li class="text-gray-400">Nenhum alerta de estoque.</li>';
}


// --- MÓDULO: VITRINE PÚBLICA (E-COMMERCE) ---
function loadPublicProducts() {
    database.ref('estoque').on('value', snapshot => {
        const productData = snapshot.val() || {};
        products = productData; // Atualiza o estado global de produtos
        const productEntries = Object.entries(productData);
        ui.shop.productList.innerHTML = productEntries.length === 0 
            ? '<p class="col-span-full text-center">Nenhum produto disponível no momento.</p>'
            : productEntries.map(([id, p]) => `
                <div class="product-card">
                    <img src="${p.imagem || 'https://placehold.co/300x200/1f2937/9ca3af?text=Produto'}" alt="${p.nome}">
                    <h3>${p.nome}</h3>
                    <p>${p.descricao || 'Sem descrição.'}</p>
                    <p class="price">R$ ${(p.precoVenda || 0).toFixed(2).replace('.', ',')}</p>
                    ${(p.quantidade || 0) > 0
                        ? `<button class="add-to-cart-button w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded" data-id="${id}">Adicionar ao Carrinho</button>`
                        : `<p class="out-of-stock">Esgotado</p>`
                    }
                </div>
            `).join('');
    });
}

function addToCart(productId) {
    if (cart[productId]) {
        cart[productId].quantity++;
    } else {
        cart[productId] = { ...products[productId], quantity: 1 };
    }
    updateCartDisplay();
}

function removeFromCart(productId) {
    if (cart[productId] && cart[productId].quantity > 1) {
        cart[productId].quantity--;
    } else {
        delete cart[productId];
    }
    updateCartDisplay();
}

function updateCartDisplay() {
    let total = 0;
    let totalItems = 0;
    const cartEntries = Object.entries(cart);

    ui.cart.items.innerHTML = cartEntries.length === 0
        ? '<p>O seu carrinho está vazio.</p>'
        : cartEntries.map(([id, item]) => {
            total += item.quantity * item.precoVenda;
            totalItems += item.quantity;
            return `
                <div class="cart-item">
                    <div class="item-info">
                        <h4>${item.nome}</h4>
                        <p>${item.quantity} x R$ ${item.precoVenda.toFixed(2).replace('.', ',')}</p>
                    </div>
                    <div class="item-actions">
                        <button data-id="${id}" class="remove-from-cart-button bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded">Remover</button>
                    </div>
                </div>
            `;
        }).join('');
        
    ui.cart.total.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    ui.cart.checkoutButton.disabled = cartEntries.length === 0;

    if (totalItems > 0) {
        ui.nav.cartItemCount.textContent = totalItems;
        ui.nav.cartItemCount.classList.remove('hidden');
    } else {
        ui.nav.cartItemCount.classList.add('hidden');
    }
}


// --- MÓDULO: CLIENTES (CRM) ---

function openNewCustomerModal() {
    ui.erp.customers.title.textContent = 'Adicionar Novo Cliente';
    ui.erp.customers.idInput.value = '';
    ui.erp.customers.nameInput.value = '';
    ui.erp.customers.whatsappInput.value = '';
    ui.erp.customers.emailInput.value = '';
    ui.erp.customers.notesInput.value = '';
    toggleModal(ui.erp.customers.modal, true);
}

function openEditCustomerModal(customerId) {
    const customer = customers[customerId];
    if (customer) {
        ui.erp.customers.title.textContent = 'Editar Cliente';
        ui.erp.customers.idInput.value = customerId;
        ui.erp.customers.nameInput.value = customer.nome;
        ui.erp.customers.whatsappInput.value = customer.whatsapp;
        ui.erp.customers.emailInput.value = customer.email || '';
        ui.erp.customers.notesInput.value = customer.observacoes || '';
        toggleModal(ui.erp.customers.modal, true);
    }
}

function saveCustomer() {
    const id = ui.erp.customers.idInput.value;
    const name = ui.erp.customers.nameInput.value.trim();
    const whatsapp = ui.erp.customers.whatsappInput.value.trim();
    const email = ui.erp.customers.emailInput.value.trim();
    const notes = ui.erp.customers.notesInput.value.trim();

    if (!name || !whatsapp) {
        alert('Nome e WhatsApp são obrigatórios.');
        return;
    }

    const customerData = {
        nome: name,
        nome_lowercase: name.toLowerCase(),
        whatsapp: whatsapp,
        email: email,
        observacoes: notes,
        dataCadastro: new Date().toISOString()
    };
    
    const dbRef = id ? database.ref('clientes/' + id) : database.ref('clientes').push();
    dbRef.set(customerData).then(() => {
        alert(`Cliente ${id ? 'atualizado' : 'salvo'} com sucesso!`);
        toggleModal(ui.erp.customers.modal, false);
    }).catch(error => alert(`Erro ao salvar cliente: ${error.message}`));
}

function deleteCustomer(customerId) {
    if (confirm('Tem a certeza de que deseja excluir este cliente? Esta ação não pode ser desfeita.')) {
        database.ref('clientes/' + customerId).remove()
            .then(() => alert('Cliente excluído com sucesso!'))
            .catch(error => alert('Erro ao excluir cliente: ' + error.message));
    }
}

function loadCustomerManagement() {
    database.ref('clientes').on('value', snapshot => {
        customers = snapshot.val() || {};
        const tableBody = Object.entries(customers).map(([id, c]) => `
            <tr>
                <td>${c.nome}</td>
                <td>${c.whatsapp}</td>
                <td>${c.email || 'N/A'}</td>
                <td>
                    <button class="edit-customer-button bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded" data-id="${id}">Editar</button>
                    <button class="delete-customer-button bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded ml-2" data-id="${id}">Excluir</button>
                </td>
            </tr>
        `).join('');

        ui.erp.customers.list.innerHTML = `
            <table class="w-full text-sm">
                <thead><tr><th>Nome</th><th>WhatsApp</th><th>E-mail</th><th>Ações</th></tr></thead>
                <tbody>${tableBody || '<tr><td colspan="4" class="text-center">Nenhum cliente cadastrado.</td></tr>'}</tbody>
            </table>
        `;
    });
}

async function submitCheckout() {
    const name = ui.checkout.nameInput.value.trim();
    const whatsapp = ui.checkout.whatsappInput.value.trim();

    if (!name || !whatsapp || Object.keys(cart).length === 0) {
        alert('Por favor, preencha todos os campos e adicione itens ao carrinho.');
        return;
    }

    let customerId = null;
    const customerQuery = await database.ref('clientes').orderByChild('whatsapp').equalTo(whatsapp).once('value');
    if (customerQuery.exists()) {
        customerId = Object.keys(customerQuery.val())[0];
    } else {
        const newCustomerData = {
            nome: name,
            nome_lowercase: name.toLowerCase(),
            whatsapp: whatsapp,
            dataCadastro: new Date().toISOString()
        };
        const newCustomerRef = await database.ref('clientes').push(newCustomerData);
        customerId = newCustomerRef.key;
    }

    const order = {
        clienteId: customerId,
        cliente: name,
        whatsapp: whatsapp,
        itens: cart,
        total: Object.values(cart).reduce((sum, item) => sum + item.quantity * item.precoVenda, 0),
        status: 'pendente',
        data: new Date().toISOString()
    };

    database.ref('pedidos').push(order).then(() => {
        alert('Pedido realizado com sucesso!');
        cart = {};
        updateCartDisplay();
        toggleModal(ui.checkout.modal, false);
        ui.checkout.nameInput.value = '';
        ui.checkout.whatsappInput.value = '';
    }).catch(error => {
        console.error("Erro no checkout:", error);
        alert('Erro ao realizar pedido: ' + error.message);
    });
}


// --- MÓDULO: ESTOQUE (ERP) ---
async function saveProduct() {
    const id = ui.erp.stock.idInput.value;
    const name = ui.erp.stock.nameInput.value;
    const price = parseFloat(ui.erp.stock.priceInput.value);
    const quantity = parseInt(ui.erp.stock.quantityInput.value);
    const description = ui.erp.stock.descriptionInput.value;
    const alertLevel = parseInt(ui.erp.stock.alertLevelInput.value);
    const imageFile = ui.erp.stock.imageUploadInput.files[0];

    if (!name || isNaN(price) || isNaN(quantity)) {
        alert('Por favor, preencha nome, preço e quantidade corretamente.');
        return;
    }

    let imageUrl = (id && products[id] && products[id].imagem) || '';
    if (imageFile) {
        try {
            const formData = new FormData();
            formData.append('file', imageFile);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
            const response = await fetch(CLOUDINARY_API_URL, { method: 'POST', body: formData });
            const data = await response.json();
            if (data.secure_url) {
                imageUrl = data.secure_url;
            } else {
                throw new Error(data.error.message || 'Erro desconhecido no upload.');
            }
        } catch (error) {
            console.error("Cloudinary upload error:", error);
            alert('Erro ao fazer upload da imagem. Tente novamente.');
            return;
        }
    }

    const productData = {
        nome: name,
        nome_lowercase: name.toLowerCase(),
        precoVenda: price,
        quantidade: quantity,
        descricao: description,
        nivelAlertaEstoque: alertLevel || 0,
        imagem: imageUrl
    };

    const dbRef = id ? database.ref('estoque/' + id) : database.ref('estoque').push();
    dbRef.set(productData).then(() => {
        alert(`Produto ${id ? 'atualizado' : 'adicionado'} com sucesso!`);
        toggleModal(ui.erp.stock.modal, false);
    }).catch(error => alert(`Erro ao salvar produto: ${error.message}`));
}

function loadStockManagement() {
    database.ref('estoque').on('value', snapshot => {
        products = snapshot.val() || {};
        const tableBody = Object.entries(products).map(([id, p]) => `
            <tr>
                <td><img src="${p.imagem || 'https://placehold.co/50x50/374151/9ca3af?text=Img'}" alt="${p.nome}" class="w-12 h-12 object-cover rounded"></td>
                <td>${p.nome}</td>
                <td>R$ ${(p.precoVenda || 0).toFixed(2).replace('.', ',')}</td>
                <td>${p.quantidade || 0}</td>
                <td>${p.nivelAlertaEstoque || 0}</td>
                <td>
                    <button class="edit-product-button bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded" data-id="${id}">Editar</button>
                    <button class="delete-product-button bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded ml-2" data-id="${id}">Excluir</button>
                </td>
            </tr>
        `).join('');

        ui.erp.stock.list.innerHTML = `
            <table class="w-full text-sm">
                <thead><tr><th>Imagem</th><th>Nome</th><th>Preço</th><th>Qtd.</th><th>Alerta</th><th>Ações</th></tr></thead>
                <tbody>${tableBody || '<tr><td colspan="6" class="text-center">Nenhum produto cadastrado.</td></tr>'}</tbody>
            </table>
        `;
    });
}
// --- [PLACEHOLDER PARA OUTROS MÓDULOS COMO COMPRAS, VENDAS, FINANCEIRO...] ---
// O restante do seu código (loadSales, loadPurchases, etc.) deve permanecer aqui.
// Esta seção foi omitida para focar nas mudanças do Dashboard, mas ela deve estar no seu arquivo final.

// --- INICIALIZAÇÃO E EVENT LISTENERS ---

function addEventListeners() {
    // Auth
    ui.authButton.addEventListener('click', handleAuthClick);

    // Navegação principal
    ui.nav.home.addEventListener('click', (e) => { e.preventDefault(); switchView('public'); });
    ui.nav.shop.addEventListener('click', (e) => { e.preventDefault(); switchView('public'); });
    ui.nav.dashboard.addEventListener('click', (e) => { e.preventDefault(); switchView('management'); });
    
    // Navegação do painel ERP
    ui.erp.tabs.forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
    });

    // Carrinho e Checkout
    ui.nav.cart.addEventListener('click', (e) => { e.preventDefault(); toggleModal(ui.cart.modal, true); });
    ui.cart.closeButton.addEventListener('click', () => toggleModal(ui.cart.modal, false));
    ui.cart.checkoutButton.addEventListener('click', () => {
        toggleModal(ui.cart.modal, false);
        toggleModal(ui.checkout.modal, true);
    });
    ui.checkout.closeButton.addEventListener('click', () => toggleModal(ui.checkout.modal, false));
    ui.checkout.submitButton.addEventListener('click', submitCheckout);

    // Gestão de Clientes
    ui.erp.customers.addButton.addEventListener('click', openNewCustomerModal);
    ui.erp.customers.closeModalButton.addEventListener('click', () => toggleModal(ui.erp.customers.modal, false));
    ui.erp.customers.saveButton.addEventListener('click', saveCustomer);
    
    // Gestão de Estoque
    ui.erp.stock.addButton.addEventListener('click', () => {
        /* Lógica para abrir modal de novo produto */
    });

    // Event Delegation para botões dinâmicos
    document.body.addEventListener('click', (e) => {
        const target = e.target;
        const productId = target.dataset.id;

        if (target.matches('.add-to-cart-button')) {
            addToCart(productId);
        } else if (target.matches('.remove-from-cart-button')) {
            removeFromCart(productId);
        } else if (target.matches('.edit-customer-button')) {
            openEditCustomerModal(productId);
        } else if (target.matches('.delete-customer-button')) {
            deleteCustomer(productId);
        }
        // Adicionar outros 'else if' para editar/excluir produtos, fornecedores, etc.
    });
}


// --- Ponto de Entrada ---
document.addEventListener('DOMContentLoaded', () => {
    loadPublicProducts();
    addEventListeners();
});
