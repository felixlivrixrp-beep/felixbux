// Webhook Discord
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1471128466593288417/LGKIJtZe_dVEFMDeG6VPNWp-JxuCtYFJRKMmxaeqILqc2lz1qde8BwWWlGvPjZ4ciDh9';

// Глобальное хранилище (Firebase)
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyBrZ7R9KjKjKjKjKjKjKjKjKjKjKjKjKjK",
    authDomain: "felixbux.firebaseapp.com",
    databaseURL: "https://felixbux-default-rtdb.firebaseio.com",
    projectId: "felixbux",
    storageBucket: "felixbux.appspot.com",
    messagingSenderId: "123456789012"
};

// Инициализация Firebase
let database;
try {
    firebase.initializeApp(FIREBASE_CONFIG);
    database = firebase.database();
    console.log('Firebase подключен');
} catch (e) {
    console.log('Firebase ошибка, используем localStorage');
}

// Генерация кода
function generateCode() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let code = letters[Math.floor(Math.random() * 26)];
    for (let i = 0; i < 5; i++) {
        code += i % 2 === 0 
            ? numbers[Math.floor(Math.random() * 10)] 
            : letters[Math.floor(Math.random() * 26)];
    }
    return code;
}

// Уведомление
function showNotification(message) {
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
}

// Копирование кода
function copyCode() {
    const code = document.getElementById('code').textContent;
    navigator.clipboard.writeText(code);
    showNotification('✅ Код скопирован!');
}

// Сохранение заказа
async function saveOrder(order) {
    if (database) {
        // Firebase
        const newOrderRef = database.ref('orders').push();
        await newOrderRef.set(order);
        return newOrderRef.key;
    } else {
        // localStorage
        let orders = JSON.parse(localStorage.getItem('orders') || '[]');
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));
        return order.id;
    }
}

// Загрузка заказов
async function loadOrders() {
    if (database) {
        const snapshot = await database.ref('orders').once('value');
        const data = snapshot.val();
        return data ? Object.values(data) : [];
    } else {
        return JSON.parse(localStorage.getItem('orders') || '[]');
    }
}

// Отправка в Discord
async function sendToDiscord(order) {
    try {
        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: `**🔔 НОВЫЙ ЗАКАЗ**\n👤 Ник: ${order.nick}\n💰 Робуксы: ${order.amount}\n🔑 Код: ${order.code}\n🆔 ID: ${order.id}`
            })
        });
    } catch (e) {
        console.log('Discord error:', e);
    }
}

// Показать недавние покупки
async function showRecentPurchases() {
    const list = document.getElementById('recentList');
    if (!list) return;
    
    const orders = await loadOrders();
    const paidOrders = orders.filter(o => o.status === 'paid').slice(-5).reverse();
    
    if (paidOrders.length === 0) {
        list.innerHTML = '<div style="text-align:center; opacity:0.5; padding:20px;">Пока нет покупок</div>';
        return;
    }
    
    list.innerHTML = paidOrders.map(o => {
        const hiddenNick = o.nick.length > 4 
            ? o.nick[0] + '...' + o.nick.slice(-2) 
            : o.nick[0] + '...' + o.nick.slice(-1);
        
        return `
            <div class="recent-item">
                <span class="recent-nick">${hiddenNick}</span>
                <span class="recent-amount">${o.amount} Robux</span>
                <span class="recent-status">✓</span>
            </div>
        `;
    }).join('');
}

// Создание заказа
async function createOrder() {
    const username = document.getElementById('username').value.trim();
    const amount = document.getElementById('amount').value.trim();
    
    if (!username || !amount) {
        showNotification('❌ Заполни все поля!');
        return;
    }
    
    if (amount < 20 || amount > 5000) {
        showNotification('❌ Количество от 20 до 5000');
        return;
    }
    
    const code = generateCode();
    const order = {
        id: Date.now(),
        nick: username,
        amount: amount,
        code: code,
        time: new Date().toLocaleString(),
        status: 'waiting'
    };
    
    // Сохраняем
    await saveOrder(order);
    
    // Отправляем в Discord
    await sendToDiscord(order);
    
    // Показываем результат
    document.getElementById('code').textContent = code;
    document.getElementById('result').classList.add('show');
    
    // Очищаем поля
    document.getElementById('username').value = '';
    document.getElementById('amount').value = '';
    
    showNotification('✅ Код сгенерирован!');
    
    // Обновляем список
    showRecentPurchases();
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    // Кнопка отправки
    document.getElementById('submitBtn').addEventListener('click', createOrder);
    
    // Кнопка копирования
    document.getElementById('copyBtn').addEventListener('click', copyCode);
    
    // Пресеты
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.getElementById('amount').value = this.dataset.amount;
        });
    });
    
    // Загружаем покупки
    showRecentPurchases();
    
    // Обновляем каждые 3 секунды
    setInterval(showRecentPurchases, 3000);
});
