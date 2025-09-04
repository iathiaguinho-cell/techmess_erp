/**
 * Configuração do Firebase
 * Substitua com suas próprias credenciais do Firebase
 */
const firebaseConfig = {
    apiKey: "AIzaSyARb-0QE9QcYD2OjkCsOj0pmKTgkJQRlSg",
    authDomain: "vipcell-gestor.firebaseapp.com",
    projectId: "vipcell-gestor",
    storageBucket: "vipcell-gestor.appspot.com",
    messagingSenderId: "259960306679",
    appId: "1:259960306679:web:ad7a41cd1842862f7f8cf2"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const database = firebase.database();
const storage = firebase.storage();

// Referências aos elementos do DOM
const publicView = document.getElementById('public-view');
const managementPanel = document.getElementById('management-panel');
const authButton = document.getElementById('auth-button');

const navHome = document.getElementById('nav-home');
const navShop = document.getElementById('nav-shop');
const navCart = document.getElementById('nav-cart');
const navDashboard = document.getElementById('nav-dashboard');

const productList = document.getElementById('product-list');
const cartModal = document.getElementById('cart-modal');
const closeCartModal = document.getElementById('close-cart-modal');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const checkoutButton = document.getElementById('checkout-button');

const checkoutModal = document.getElementById('checkout-modal');
const closeCheckoutModal = document.getElementById('close-checkout-modal');
const customerNameInput = document.getElementById('customer-name');
const customerWhatsappInput = document.getElementById('customer-whatsapp');
const submitCheckoutButton = document.getElementById('submit-checkout');

// ERP Tabs
const tabDashboard = document.getElementById('tab-dashboard');
const tabSales = document.getElementById('tab-sales');
const tabPurchases = document.getElementById('tab-purchases');
const tabStock = document.getElementById('tab-stock');
const tabFinance = document.getElementById('tab-finance');
const tabSuppliers = document.getElementById('tab-suppliers');

const dashboardContent = document.getElementById('dashboard-content');
const salesContent = document.getElementById('sales-content');
const purchasesContent = document.getElementById('purchases-content');
const stockContent = document.getElementById('stock-content');
const financeContent = document.getElementById('finance-content');
const suppliersContent = document.getElementById('suppliers-content');

const addProductButton = document.getElementById('add-product-button');
const productFormModal = document.getElementById('product-form-modal');
const closeProductFormModal = document.getElementById('close-product-form-modal');
const saveProductButton = document.getElementById('save-product-button');
const productFormTitle = document.getElementById('product-form-title');
const productIdInput = document.getElementById('product-id');
const productNameInput = document.getElementById('product-name');
const productPriceInput = document.getElementById('product-price');
const productQuantityInput = document.getElementById('product-quantity');
const productDescriptionInput = document.getElementById('product-description');
const productAlertLevelInput = document.getElementById('product-alert-level');
const productImageUploadInput = document.getElementById('product-image-upload');
const productManagementList = document.getElementById('product-management-list');

const addSupplierButton = document.getElementById('add-supplier-button');
const supplierFormModal = document.getElementById('supplier-form-modal');
const closeSupplierFormModal = document.getElementById('close-supplier-form-modal');
const saveSupplierButton = document.getElementById('save-supplier-button');
const supplierFormTitle = document.getElementById('supplier-form-title');
const supplierIdInput = document.getElementById('supplier-id');
const supplierNameInput = document.getElementById('supplier-name');
const supplierContactInput = document.getElementById('supplier-contact');
const supplierList = document.getElementById('supplier-list');

const newPurchaseButton = document.getElementById('new-purchase-button');
const purchaseList = document.getElementById('purchase-list');
const pendingOrders = document.getElementById('pending-orders');
const monthlyRevenue = document.getElementById('monthly-revenue');
const dailySales = document.getElementById('daily-sales');
const lowStockAlerts = document.getElementById('low-stock-alerts');
const financialTransactions = document.getElementById('financial-transactions');
const cashBalance = document.getElementById('cash-balance');

// Variáveis globais
let cart = {};
let products = {};
let suppliers = {};

// Funções de UI
function showPublicView() {
    publicView.classList.remove('hidden');
    managementPanel.classList.add('hidden');
}

function showManagementPanel() {
    publicView.classList.add('hidden');
    managementPanel.classList.remove('hidden');
    // Por padrão, mostra o dashboard ao entrar no painel de gestão
    showTab(dashboardContent);
}

function showTab(tabContentElement) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    tabContentElement.classList.remove('hidden');

    document.querySelectorAll('nav button').forEach(button => {
        button.classList.remove('border-cyan-400');
        button.classList.add('border-transparent');
    });
    // Adiciona a borda inferior ao botão da aba ativa
    if (tabContentElement === dashboardContent) tabDashboard.classList.add('border-cyan-400');
    if (tabContentElement === salesContent) tabSales.classList.add('border-cyan-400');
    if (tabContentElement === purchasesContent) tabPurchases.classList.add('border-cyan-400');
    if (tabContentElement === stockContent) tabStock.classList.add('border-cyan-400');
    if (tabContentElement === financeContent) tabFinance.classList.add('border-cyan-400');
    if (tabContentElement === suppliersContent) tabSuppliers.classList.add('border-cyan-400');
}

// Autenticação
auth.onAuthStateChanged(user => {
    if (user) {
        authButton.textContent = 'Logout';
        navDashboard.classList.remove('hidden');
        showManagementPanel(); // Redireciona para o painel de gestão se logado
    } else {
        authButton.textContent = 'Login';
        navDashboard.classList.add('hidden');
        showPublicView(); // Redireciona para a vitrine pública se deslogado
    }
});

authButton.addEventListener('click', () => {
    if (auth.currentUser) {
        auth.signOut();
    } else {
        // Modal de login simples
        const email = prompt('Digite seu e-mail:');
        const password = prompt('Digite sua senha:');
        
        if (email && password) {
            auth.signInWithEmailAndPassword(email, password)
                .then(() => {
                    alert('Login realizado com sucesso!');
                })
                .catch(error => {
                    console.error('Erro de login:', error);
                    alert('Erro de login: ' + error.message);
                });
        }
    }
});

// Navegação
navHome.addEventListener('click', showPublicView);
navShop.addEventListener('click', showPublicView);
navDashboard.addEventListener('click', showManagementPanel);

// ERP Tab Listeners
tabDashboard.addEventListener('click', () => showTab(dashboardContent));
tabSales.addEventListener('click', () => showTab(salesContent));
tabPurchases.addEventListener('click', () => showTab(purchasesContent));
tabStock.addEventListener('click', () => showTab(stockContent));
tabFinance.addEventListener('click', () => showTab(financeContent));
tabSuppliers.addEventListener('click', () => showTab(suppliersContent));

// --- Funções da Vitrine Pública (E-commerce) ---

// Carregar e exibir produtos
function loadProducts() {
    database.ref('estoque').on('value', (snapshot) => {
        products = snapshot.val() || {};
        productList.innerHTML = '';
        for (const id in products) {
            const product = products[id];
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <img src="${product.imagem || 'https://via.placeholder.com/150'}" alt="${product.nome}">
                <h3>${product.nome}</h3>
                <p>${product.descricao}</p>
                <p class="price">R$ ${product.precoVenda.toFixed(2)}</p>
                ${product.quantidade > 0 ? `<button class="add-to-cart-button bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded" data-id="${id}">Adicionar ao Carrinho</button>` : `<p class="out-of-stock">Esgotado</p>`}
            `;
            productList.appendChild(productCard);
        }
        attachAddToCartListeners();
    });
}

function attachAddToCartListeners() {
    document.querySelectorAll('.add-to-cart-button').forEach(button => {
        button.onclick = (event) => {
            const productId = event.target.dataset.id;
            addToCart(productId);
        };
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
    if (cart[productId]) {
        cart[productId].quantity--;
        if (cart[productId].quantity <= 0) {
            delete cart[productId];
        }
    }
    updateCartDisplay();
}

function updateCartDisplay() {
    cartItems.innerHTML = '';
    let total = 0;
    for (const id in cart) {
        const item = cart[id];
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div class="item-info">
                <h4>${item.nome}</h4>
                <p>${item.quantity} x R$ ${item.precoVenda.toFixed(2)}</p>
            </div>
            <div class="item-actions">
                <button data-id="${id}" class="remove-from-cart-button">Remover</button>
            </div>
        `;
        cartItems.appendChild(itemElement);
        total += item.quantity * item.precoVenda;
    }
    cartTotal.textContent = `R$ ${total.toFixed(2)}`;

    document.querySelectorAll('.remove-from-cart-button').forEach(button => {
        button.onclick = (event) => {
            const productId = event.target.dataset.id;
            removeFromCart(productId);
        };
    });
}

navCart.addEventListener('click', () => {
    updateCartDisplay();
    cartModal.classList.remove('hidden');
});

closeCartModal.addEventListener('click', () => {
    cartModal.classList.add('hidden');
});

checkoutButton.addEventListener('click', () => {
    cartModal.classList.add('hidden');
    checkoutModal.classList.remove('hidden');
});

closeCheckoutModal.addEventListener('click', () => {
    checkoutModal.classList.add('hidden');
});

submitCheckoutButton.addEventListener('click', () => {
    const customerName = customerNameInput.value;
    const customerWhatsapp = customerWhatsappInput.value;

    if (!customerName || !customerWhatsapp || Object.keys(cart).length === 0) {
        alert('Por favor, preencha todos os campos e adicione itens ao carrinho.');
        return;
    }

    const order = {
        cliente: customerName,
        whatsapp: customerWhatsapp,
        itens: cart,
        total: parseFloat(cartTotal.textContent.replace('R$ ', '')),
        status: 'pendente',
        data: new Date().toISOString()
    };

    database.ref('pedidos').push(order)
        .then(() => {
            alert('Pedido realizado com sucesso!');
            cart = {}; // Limpa o carrinho
            updateCartDisplay();
            checkoutModal.classList.add('hidden');
            customerNameInput.value = '';
            customerWhatsappInput.value = '';
        })
        .catch(error => {
            console.error('Erro ao fazer pedido:', error);
            alert('Erro ao realizar pedido. Tente novamente.');
        });
});

// --- Funções do Painel de Gestão (ERP) ---

// Módulo Estoque
addProductButton.addEventListener('click', () => {
    productFormTitle.textContent = 'Adicionar Produto';
    productIdInput.value = '';
    productNameInput.value = '';
    productPriceInput.value = '';
    productQuantityInput.value = '';
    productDescriptionInput.value = '';
    productAlertLevelInput.value = '';
    productImageUploadInput.value = ''; // Limpa o input de arquivo
    productFormModal.classList.remove('hidden');
});

closeProductFormModal.addEventListener('click', () => {
    productFormModal.classList.add('hidden');
});

saveProductButton.addEventListener('click', async () => {
    const id = productIdInput.value;
    const nome = productNameInput.value;
    const precoVenda = parseFloat(productPriceInput.value);
    const quantidade = parseInt(productQuantityInput.value);
    const descricao = productDescriptionInput.value;
    const nivelAlertaEstoque = parseInt(productAlertLevelInput.value);
    const imagemFile = productImageUploadInput.files[0];

    if (!nome || isNaN(precoVenda) || isNaN(quantidade) || !descricao || isNaN(nivelAlertaEstoque)) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }

    let imageUrl = '';
    if (imagemFile) {
        try {
            // Upload para o Cloudinary
            const formData = new FormData();
            formData.append('file', imagemFile);
            formData.append('upload_preset', 'poh3ej4m'); // Seu upload preset do Cloudinary

            const response = await fetch('https://api.cloudinary.com/v1_1/dmuvm1o6m/image/upload', { // Seu cloud name do Cloudinary
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            imageUrl = data.secure_url;
        } catch (error) {
            console.error('Erro ao fazer upload da imagem:', error);
            alert('Erro ao fazer upload da imagem. Tente novamente.');
            return;
        }
    } else if (id && products[id] && products[id].imagem) {
        imageUrl = products[id].imagem; // Mantém a imagem existente se não houver nova
    }

    const productData = {
        nome,
        nome_lowercase: nome.toLowerCase(), // Para indexação e busca
        precoVenda,
        quantidade,
        descricao,
        nivelAlertaEstoque,
        imagem: imageUrl
    };

    if (id) {
        // Editar produto existente
        database.ref('estoque/' + id).set(productData)
            .then(() => {
                alert('Produto atualizado com sucesso!');
                productFormModal.classList.add('hidden');
            })
            .catch(error => {
                console.error('Erro ao atualizar produto:', error);
                alert('Erro ao atualizar produto. Tente novamente.');
            });
    } else {
        // Adicionar novo produto
        database.ref('estoque').push(productData)
            .then(() => {
                alert('Produto adicionado com sucesso!');
                productFormModal.classList.add('hidden');
            })
            .catch(error => {
                console.error('Erro ao adicionar produto:', error);
                alert('Erro ao adicionar produto. Tente novamente.');
            });
    }
});

function loadStockManagement() {
    database.ref('estoque').on('value', (snapshot) => {
        products = snapshot.val() || {};
        productManagementList.innerHTML = '';
        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Imagem</th>
                    <th>Nome</th>
                    <th>Preço Venda</th>
                    <th>Quantidade</th>
                    <th>Alerta</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        const tbody = table.querySelector('tbody');

        for (const id in products) {
            const product = products[id];
            const row = tbody.insertRow();
            row.innerHTML = `
                <td><img src="${product.imagem || 'https://via.placeholder.com/50'}" alt="${product.nome}" class="w-12 h-12 object-cover rounded"></td>
                <td>${product.nome}</td>
                <td>R$ ${product.precoVenda.toFixed(2)}</td>
                <td>${product.quantidade}</td>
                <td>${product.nivelAlertaEstoque}</td>
                <td>
                    <button class="edit-product-button bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded" data-id="${id}">Editar</button>
                    <button class="delete-product-button bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded ml-2" data-id="${id}">Excluir</button>
                </td>
            `;
        }
        productManagementList.appendChild(table);
        attachProductManagementListeners();
        updateLowStockAlerts();
    });
}

function attachProductManagementListeners() {
    document.querySelectorAll('.edit-product-button').forEach(button => {
        button.onclick = (event) => {
            const productId = event.target.dataset.id;
            const product = products[productId];
            if (product) {
                productFormTitle.textContent = 'Editar Produto';
                productIdInput.value = productId;
                productNameInput.value = product.nome;
                productPriceInput.value = product.precoVenda;
                productQuantityInput.value = product.quantidade;
                productDescriptionInput.value = product.descricao;
                productAlertLevelInput.value = product.nivelAlertaEstoque;
                // Não preenche o input de arquivo por segurança
                productFormModal.classList.remove('hidden');
            }
        };
    });

    document.querySelectorAll('.delete-product-button').forEach(button => {
        button.onclick = (event) => {
            const productId = event.target.dataset.id;
            if (confirm('Tem certeza que deseja excluir este produto?')) {
                database.ref('estoque/' + productId).remove()
                    .then(() => alert('Produto excluído com sucesso!'))
                    .catch(error => console.error('Erro ao excluir produto:', error));
            }
        };
    });
}

// Módulo Fornecedores
addSupplierButton.addEventListener('click', () => {
    supplierFormTitle.textContent = 'Adicionar Fornecedor';
    supplierIdInput.value = '';
    supplierNameInput.value = '';
    supplierContactInput.value = '';
    supplierFormModal.classList.remove('hidden');
});

closeSupplierFormModal.addEventListener('click', () => {
    supplierFormModal.classList.add('hidden');
});

saveSupplierButton.addEventListener('click', () => {
    const id = supplierIdInput.value;
    const nome = supplierNameInput.value;
    const contato = supplierContactInput.value;

    if (!nome || !contato) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    const supplierData = {
        nome,
        contato
    };

    if (id) {
        // Editar fornecedor existente
        database.ref('fornecedores/' + id).set(supplierData)
            .then(() => {
                alert('Fornecedor atualizado com sucesso!');
                supplierFormModal.classList.add('hidden');
            })
            .catch(error => {
                console.error('Erro ao atualizar fornecedor:', error);
                alert('Erro ao atualizar fornecedor. Tente novamente.');
            });
    } else {
        // Adicionar novo fornecedor
        database.ref('fornecedores').push(supplierData)
            .then(() => {
                alert('Fornecedor adicionado com sucesso!');
                supplierFormModal.classList.add('hidden');
            })
            .catch(error => {
                console.error('Erro ao adicionar fornecedor:', error);
                alert('Erro ao adicionar fornecedor. Tente novamente.');
            });
    }
});

function loadSupplierManagement() {
    database.ref('fornecedores').on('value', (snapshot) => {
        suppliers = snapshot.val() || {};
        supplierList.innerHTML = '';
        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Contato</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        const tbody = table.querySelector('tbody');

        for (const id in suppliers) {
            const supplier = suppliers[id];
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${supplier.nome}</td>
                <td>${supplier.contato}</td>
                <td>
                    <button class="edit-supplier-button bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded" data-id="${id}">Editar</button>
                    <button class="delete-supplier-button bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded ml-2" data-id="${id}">Excluir</button>
                </td>
            `;
        }
        supplierList.appendChild(table);
        attachSupplierManagementListeners();
    });
}

function attachSupplierManagementListeners() {
    document.querySelectorAll('.edit-supplier-button').forEach(button => {
        button.onclick = (event) => {
            const supplierId = event.target.dataset.id;
            const supplier = suppliers[supplierId];
            if (supplier) {
                supplierFormTitle.textContent = 'Editar Fornecedor';
                supplierIdInput.value = supplierId;
                supplierNameInput.value = supplier.nome;
                supplierContactInput.value = supplier.contato;
                supplierFormModal.classList.remove('hidden');
            }
        };
    });

    document.querySelectorAll('.delete-supplier-button').forEach(button => {
        button.onclick = (event) => {
            const supplierId = event.target.dataset.id;
            if (confirm('Tem certeza que deseja excluir este fornecedor?')) {
                database.ref('fornecedores/' + supplierId).remove()
                    .then(() => alert('Fornecedor excluído com sucesso!'))
                    .catch(error => console.error('Erro ao excluir fornecedor:', error));
            }
        };
    });
}

// Módulo Compras
newPurchaseButton.addEventListener('click', () => {
    // Modal simples para nova compra
    const supplierKeys = Object.keys(suppliers);
    if (supplierKeys.length === 0) {
        alert('Nenhum fornecedor cadastrado. Cadastre um fornecedor primeiro.');
        return;
    }
    
    let supplierOptions = '';
    for (const id in suppliers) {
        supplierOptions += `${id}: ${suppliers[id].nome}\n`;
    }
    
    const supplierId = prompt(`Selecione um fornecedor (digite o ID):\n${supplierOptions}`);
    if (!supplierId || !suppliers[supplierId]) {
        alert('Fornecedor inválido.');
        return;
    }
    
    const productKeys = Object.keys(products);
    if (productKeys.length === 0) {
        alert('Nenhum produto cadastrado. Cadastre produtos primeiro.');
        return;
    }
    
    let productOptions = '';
    for (const id in products) {
        productOptions += `${id}: ${products[id].nome} - R$ ${products[id].precoVenda.toFixed(2)}\n`;
    }
    
    const productId = prompt(`Selecione um produto (digite o ID):\n${productOptions}`);
    if (!productId || !products[productId]) {
        alert('Produto inválido.');
        return;
    }
    
    const quantity = parseInt(prompt('Digite a quantidade:'));
    if (isNaN(quantity) || quantity <= 0) {
        alert('Quantidade inválida.');
        return;
    }
    
    const unitPrice = parseFloat(prompt('Digite o preço unitário de compra:'));
    if (isNaN(unitPrice) || unitPrice <= 0) {
        alert('Preço inválido.');
        return;
    }
    
    const total = quantity * unitPrice;
    
    const purchaseData = {
        fornecedorId: supplierId,
        fornecedorNome: suppliers[supplierId].nome,
        itens: {
            [productId]: {
                nome: products[productId].nome,
                quantity: quantity,
                unitPrice: unitPrice
            }
        },
        total: total,
        status: 'Aguardando Recebimento',
        data: new Date().toISOString()
    };
    
    database.ref('compras').push(purchaseData)
        .then(() => {
            alert('Compra registrada com sucesso!');
        })
        .catch(error => {
            console.error('Erro ao registrar compra:', error);
            alert('Erro ao registrar compra. Tente novamente.');
        });
});

function loadPurchases() {
    database.ref('compras').on('value', (snapshot) => {
        const purchases = snapshot.val() || {};
        purchaseList.innerHTML = '';
        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Fornecedor</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        const tbody = table.querySelector('tbody');

        for (const id in purchases) {
            const purchase = purchases[id];
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${new Date(purchase.data).toLocaleDateString()}</td>
                <td>${purchase.fornecedorNome || 'N/A'}</td>
                <td>R$ ${purchase.total.toFixed(2)}</td>
                <td>${purchase.status}</td>
                <td>
                    ${purchase.status === 'Aguardando Recebimento' ? `<button class="confirm-receipt-button bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded" data-id="${id}">Confirmar Recebimento</button>` : ''}
                </td>
            `;
        }
        purchaseList.appendChild(table);
        attachPurchaseListeners();
    });
}

function attachPurchaseListeners() {
    document.querySelectorAll('.confirm-receipt-button').forEach(button => {
        button.onclick = async (event) => {
            const purchaseId = event.target.dataset.id;
            const purchaseRef = database.ref('compras/' + purchaseId);
            const purchaseSnapshot = await purchaseRef.once('value');
            const purchase = purchaseSnapshot.val();

            if (purchase && confirm('Confirmar recebimento desta compra?')) {
                // Atualizar estoque
                for (const itemId in purchase.itens) {
                    const item = purchase.itens[itemId];
                    const productRef = database.ref('estoque/' + itemId);
                    const productSnapshot = await productRef.once('value');
                    const product = productSnapshot.val();
                    if (product) {
                        productRef.update({ quantidade: product.quantidade + item.quantity });
                    }
                }

                // Lançar conta a pagar
                database.ref('fluxoDeCaixa').push({
                    tipo: 'Pagar',
                    descricao: `Compra #${purchaseId} - ${purchase.fornecedorNome}`,
                    valor: purchase.total,
                    data: new Date().toISOString(),
                    status: 'Pendente'
                });

                // Atualizar status da compra
                purchaseRef.update({ status: 'Recebido' })
                    .then(() => alert('Recebimento confirmado e estoque atualizado!'))
                    .catch(error => console.error('Erro ao confirmar recebimento:', error));
            }
        };
    });
}

// Módulo Vendas
function loadSales() {
    database.ref('pedidos').orderByChild('status').equalTo('pendente').on('value', (snapshot) => {
        const orders = snapshot.val() || {};
        pendingOrders.innerHTML = '';
        if (Object.keys(orders).length === 0) {
            pendingOrders.innerHTML = '<p>Nenhum pedido pendente.</p>';
            return;
        }

        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Cliente</th>
                    <th>WhatsApp</th>
                    <th>Itens</th>
                    <th>Total</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        const tbody = table.querySelector('tbody');

        for (const id in orders) {
            const order = orders[id];
            const itemsList = Object.values(order.itens).map(item => `${item.nome} (${item.quantity})`).join(', ');
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${new Date(order.data).toLocaleDateString()}</td>
                <td>${order.cliente}</td>
                <td>${order.whatsapp}</td>
                <td>${itemsList}</td>
                <td>R$ ${order.total.toFixed(2)}</td>
                <td>
                    <button class="confirm-sale-button bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded" data-id="${id}">Confirmar Venda</button>
                    <button class="cancel-order-button bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded ml-2" data-id="${id}">Cancelar Pedido</button>
                </td>
            `;
        }
        pendingOrders.appendChild(table);
        attachSalesListeners();
    });
}

function attachSalesListeners() {
    document.querySelectorAll('.confirm-sale-button').forEach(button => {
        button.onclick = async (event) => {
            const orderId = event.target.dataset.id;
            const orderRef = database.ref('pedidos/' + orderId);
            const orderSnapshot = await orderRef.once('value');
            const order = orderSnapshot.val();

            if (order && confirm('Confirmar esta venda?')) {
                // Dar baixa no estoque
                for (const itemId in order.itens) {
                    const item = order.itens[itemId];
                    const productRef = database.ref('estoque/' + itemId);
                    const productSnapshot = await productRef.once('value');
                    const product = productSnapshot.val();
                    if (product && product.quantidade >= item.quantity) {
                        productRef.update({ quantidade: product.quantidade - item.quantity });
                    } else {
                        alert(`Estoque insuficiente para ${item.nome}. Venda não confirmada.`);
                        return; // Aborta a operação se o estoque for insuficiente
                    }
                }

                // Criar registro em vendas
                database.ref('vendas').push({
                    cliente: order.cliente,
                    whatsapp: order.whatsapp,
                    itens: order.itens,
                    total: order.total,
                    data: new Date().toISOString()
                });

                // Lançar conta a receber
                database.ref('fluxoDeCaixa').push({
                    tipo: 'Receber',
                    descricao: `Venda #${orderId} - ${order.cliente}`,
                    valor: order.total,
                    data: new Date().toISOString(),
                    status: 'Pendente'
                });

                // Remover pedido original
                orderRef.remove()
                    .then(() => alert('Venda confirmada e estoque atualizado!'))
                    .catch(error => console.error('Erro ao confirmar venda:', error));
            }
        };
    });

    document.querySelectorAll('.cancel-order-button').forEach(button => {
        button.onclick = (event) => {
            const orderId = event.target.dataset.id;
            if (confirm('Tem certeza que deseja cancelar este pedido?')) {
                database.ref('pedidos/' + orderId).remove()
                    .then(() => alert('Pedido cancelado!'))
                    .catch(error => console.error('Erro ao cancelar pedido:', error));
            }
        };
    });
}

// Módulo Financeiro
function loadFinance() {
    database.ref('fluxoDeCaixa').on('value', (snapshot) => {
        const transactions = snapshot.val() || {};
        financialTransactions.innerHTML = '';
        let balance = 0;

        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Descrição</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        const tbody = table.querySelector('tbody');

        for (const id in transactions) {
            const transaction = transactions[id];
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${new Date(transaction.data).toLocaleDateString()}</td>
                <td>${transaction.tipo}</td>
                <td>${transaction.descricao}</td>
                <td>R$ ${transaction.valor.toFixed(2)}</td>
                <td>${transaction.status}</td>
                <td>
                    ${transaction.status === 'Pendente' ? `<button class="confirm-finance-button bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded" data-id="${id}" data-type="${transaction.tipo}">Confirmar</button>` : ''}
                </td>
            `;
            if (transaction.status === 'Recebido' || transaction.status === 'Paga') {
                balance += (transaction.tipo === 'Receber' ? transaction.valor : -transaction.valor);
            }
        }
        financialTransactions.appendChild(table);
        cashBalance.textContent = `R$ ${balance.toFixed(2)}`;
        attachFinanceListeners();
    });
}

function attachFinanceListeners() {
    document.querySelectorAll('.confirm-finance-button').forEach(button => {
        button.onclick = (event) => {
            const transactionId = event.target.dataset.id;
            const transactionType = event.target.dataset.type;
            const newStatus = transactionType === 'Receber' ? 'Recebido' : 'Paga';
            if (confirm(`Confirmar esta ${transactionType === 'Receber' ? 'receita' : 'despesa'} como ${newStatus}?`)) {
                database.ref('fluxoDeCaixa/' + transactionId).update({ status: newStatus })
                    .then(() => alert('Transação atualizada!'))
                    .catch(error => console.error('Erro ao atualizar transação:', error));
            }
        };
    });
}

// Módulo Dashboard
function updateLowStockAlerts() {
    lowStockAlerts.innerHTML = '';
    for (const id in products) {
        const product = products[id];
        if (product.quantidade <= product.nivelAlertaEstoque) {
            const li = document.createElement('li');
            li.textContent = `${product.nome}: ${product.quantidade} em estoque (Alerta: ${product.nivelAlertaEstoque})`;
            li.classList.add('text-red-400');
            lowStockAlerts.appendChild(li);
        }
    }
    if (lowStockAlerts.innerHTML === '') {
        lowStockAlerts.innerHTML = '<li>Nenhum alerta de estoque baixo.</li>';
    }
}

function calculateDailySalesAndMonthlyRevenue() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    let currentDailySales = 0;
    let currentMonthlyRevenue = 0;

    database.ref('vendas').on('value', (snapshot) => {
        const sales = snapshot.val() || {};
        for (const id in sales) {
            const sale = sales[id];
            const saleDate = new Date(sale.data);

            if (saleDate >= startOfDay) {
                currentDailySales += sale.total;
            }
            if (saleDate >= startOfMonth) {
                currentMonthlyRevenue += sale.total;
            }
        }
        dailySales.textContent = `R$ ${currentDailySales.toFixed(2)}`;
        monthlyRevenue.textContent = `R$ ${currentMonthlyRevenue.toFixed(2)}`;
    });
}

// Garante que a view correta é mostrada na carga inicial
document.addEventListener('DOMContentLoaded', () => {
    // Garantir que todos os modais estejam fechados na inicialização
    cartModal.classList.add('hidden');
    checkoutModal.classList.add('hidden');
    productFormModal.classList.add('hidden');
    supplierFormModal.classList.add('hidden');
    
    // Mostrar a view pública por padrão
    showPublicView();
    
    loadProducts();
    loadStockManagement();
    loadSupplierManagement();
    loadPurchases();
    loadSales();
    loadFinance();
    calculateDailySalesAndMonthlyRevenue();
});

auth.onAuthStateChanged(user => {
    if (user) {
        authButton.textContent = 'Logout';
        navDashboard.classList.remove('hidden');
        showManagementPanel(); // Redireciona para o painel de gestão se logado
    } else {
        authButton.textContent = 'Login';
        navDashboard.classList.add('hidden');
        showPublicView(); // Redireciona para a vitrine pública se deslogado
    }
});


