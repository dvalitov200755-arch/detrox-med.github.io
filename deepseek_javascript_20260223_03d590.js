// Состояние приложения
let currentPage = 'home';
let currentProductPage = 1;
const productsPerPage = 10;
let cart = [];
let currentModalProduct = null;

// Генерация тестовых товаров
const products = [];
const categories = ['Электроника', 'Одежда', 'Мебель', 'Книги', 'Игрушки'];
const brands = ['Sony', 'Samsung', 'Apple', 'Xiaomi', 'LG', 'Bosch'];

for (let i = 1; i <= 50; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const brand = brands[Math.floor(Math.random() * brands.length)];
    
    products.push({
        id: i,
        name: `${brand} ${category} ${i}`,
        price: Math.floor(Math.random() * 9000) + 1000,
        specs: [
            `Категория: ${category}`,
            `Бренд: ${brand}`,
            `Вес: ${Math.floor(Math.random() * 10) + 1} кг`,
            `Цвет: ${['Красный', 'Синий', 'Зеленый', 'Черный', 'Белый'][Math.floor(Math.random() * 5)]}`,
            `Гарантия: ${Math.floor(Math.random() * 3) + 1} ${['год', 'года', 'лет'][Math.floor(Math.random() * 3)]}`,
            `Страна: ${['Китай', 'Россия', 'Германия', 'Япония', 'США'][Math.floor(Math.random() * 5)]}`
        ],
        description: `Профессиональный ${category.toLowerCase()} от бренда ${brand}. Отличное качество, надежность и доступная цена. Подходит для повседневного использования.`
    });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    displayProducts();
    setupEventListeners();
});

// Настройка обработчиков событий
function setupEventListeners() {
    // Навигация
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchPage(link.dataset.page);
        });
    });

    // Форма заказа
    document.getElementById('order-form').addEventListener('submit', submitOrder);

    // Закрытие модального окна по клику вне его
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('product-modal');
        if (event.target === modal) {
            closeModal();
        }
    });
}

// Загрузка корзины из localStorage
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    updateCartCount();
}

// Сохранение корзины в localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Обновление счетчика корзины
function updateCartCount() {
    document.getElementById('cart-count').textContent = cart.length;
}

// Переключение страниц
function switchPage(pageId) {
    // Обновление активной страницы
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active-page');
    });
    document.getElementById(pageId).classList.add('active-page');
    
    // Обновление активной ссылки в навигации
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageId) {
            link.classList.add('active');
        }
    });
    
    currentPage = pageId;
    
    // Загрузка соответствующего контента
    if (pageId === 'catalog') {
        displayProducts();
    } else if (pageId === 'cart') {
        displayCart();
    }
}

// Отображение товаров на странице каталога
function displayProducts() {
    const grid = document.getElementById('products-grid');
    const start = (currentProductPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    const pageProducts = products.slice(start, end);
    
    grid.innerHTML = '';
    pageProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.onclick = () => openModal(product);
        card.innerHTML = `
            <div class="product-image">📦</div>
            <div class="product-name">${product.name}</div>
            <div class="product-price">${product.price.toLocaleString()} ₽</div>
        `;
        grid.appendChild(card);
    });
    
    displayPagination();
}

// Отображение пагинации
function displayPagination() {
    const totalPages = Math.ceil(products.length / productsPerPage);
    const pagination = document.getElementById('pagination');
    
    pagination.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.className = i === currentProductPage ? 'active' : '';
        button.onclick = () => {
            currentProductPage = i;
            displayProducts();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        pagination.appendChild(button);
    }
}

// Открытие модального окна с товаром
function openModal(product) {
    currentModalProduct = product;
    document.getElementById('modal-name').textContent = product.name;
    document.getElementById('modal-price').textContent = `${product.price.toLocaleString()} ₽`;
    
    const specsList = document.getElementById('modal-specs');
    specsList.innerHTML = '';
    product.specs.forEach(spec => {
        const li = document.createElement('li');
        li.textContent = spec;
        specsList.appendChild(li);
    });
    
    document.getElementById('modal-description').textContent = product.description;
    document.getElementById('product-modal').classList.add('active');
    document.body.style.overflow = 'hidden'; // Запрещаем прокрутку фона
}

// Закрытие модального окна
function closeModal() {
    document.getElementById('product-modal').classList.remove('active');
    document.body.style.overflow = ''; // Возвращаем прокрутку
    currentModalProduct = null;
}

// Добавление товара в корзину из модального окна
function addToCartFromModal() {
    if (currentModalProduct) {
        cart.push(currentModalProduct);
        saveCart();
        closeModal();
        showNotification('Товар добавлен в корзину!');
    }
}

// Отображение корзины
function displayCart() {
    const cartItems = document.getElementById('cart-items');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Корзина пуста</p>';
        return;
    }
    
    cartItems.innerHTML = '';
    cart.forEach((item, index) => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <div class="cart-item-price">${item.price.toLocaleString()} ₽</div>
            </div>
            <button class="remove-from-cart" onclick="removeFromCart(${index})">Удалить</button>
        `;
        cartItems.appendChild(cartItem);
    });
}

// Удаление товара из корзины
function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    displayCart();
    showNotification('Товар удален из корзины');
}

// Отправка заявки
function submitOrder(event) {
    event.preventDefault();
    
    if (cart.length === 0) {
        showNotification('Корзина пуста!', 'error');
        return;
    }
    
    const company = document.getElementById('company').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    
    // Здесь можно добавить отправку данных на сервер
    console.log('Заявка отправлена:', {
        company,
        email,
        phone,
        items: cart
    });
    
    showNotification('Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.');
    
    // Очистка корзины
    cart = [];
    saveCart();
    document.getElementById('order-form').reset();
    displayCart();
    
    // Переход на главную через 2 секунды
    setTimeout(() => switchPage('home'), 2000);
}

// Показ уведомления
function showNotification(message, type = 'success') {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Добавляем стили для уведомления
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#ff4757'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 2000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Удаляем через 3 секунды
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Добавляем стили для анимаций в CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
    
    .empty-cart {
        text-align: center;
        color: #999;
        font-size: 18px;
        padding: 50px;
    }
`;
document.head.appendChild(style);

// Делаем функции глобально доступными
window.switchPage = switchPage;
window.closeModal = closeModal;
window.addToCartFromModal = addToCartFromModal;
window.removeFromCart = removeFromCart;