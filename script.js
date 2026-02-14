// НАСТРОЙКИ - ВСТАВЬ СВОИ ДАННЫЕ!
const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1471128466593288417/LGKIJtZe_dVEFMDeG6VPNWp-JxuCtYFJRKMmxaeqILqc2lz1qde8BwWWlGvPjZ4ciDh9';
const BIN_ID = '69906dbbd0ea881f40b9f95d';
const API_KEY = '$2a$10$JJhtXuIXTlix2FRrGUr.Ae5mE7zKF7aOkFDvY5IB2tKKFlRGyRAXK';

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
function showNotification(msg) {
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.textContent = msg;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
}

// Копирование кода
function copyCode() {
    const code = document.getElementById('code').textContent;
    navigator.clipboard.writeText(code);
    showNotification('✅ Код скопирован!');
}

// Загрузка заказов с JSONBin
async function loadOrders() {
    try {
        const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: { 'X-Master-Key': API_KEY }
        });
        const data = await res.json();
        return data.record.orders || [];
    } catch (e) {
        console.log('Ошибка загрузки', e);
        return [];
    }
}

// Сохранение заказов в JSONBin
async function saveOrders(orders) {
    try {
        await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY
            },
            body: JSON.stringify({ orders: orders })
        });
    } catch (e) {
        console.log('Ошибка сохранения', e);
    }
}

// Отправка в Discord
async function sendToDiscord(order) {
    try {
        await fetch(DISCORD_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: `**Новый заказ!**\n👤 Ник: ${order.nick}\n💰 Робуксы: ${order.amount}\n🔑 Код: ${order.code}\n🆔 ID: ${order.id}`
            })
        });
    } catch (e) {}
}

// Показать недавние покупки
async function showRecentPurchases() {
    const list = document.getElementById('recentList');
    if (!list) return;
    
    const orders = await loadOrders();
    const paid = orders.filter(o => o.status === 'paid').slice(-5).reverse();
    
    if (paid.length === 0) {
        list.innerHTML = '<div style="text-align:center; opacity:0.5; padding:20px;">Пока нет покупок</div>';
        return;
    }
    
    list.innerHTML = paid.map(o => {
        const hidden = o.nick.length > 4 
            ? o.nick[0] + '...' + o.nick.slice(-2) 
            : o.nick[0] + '...' + o.nick.slice(-1);
        return `
            <div class="purchase-item">
                <span class="purchase-nick">${hidden}</span>
                <span class="purchase-amount">${o.amount} Robux</span>
                <span class="purchase-status">✓</span>
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
        showNotification('❌ От 20 до 5000 Robux');
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
    
    // Загружаем заказы
    let orders = await loadOrders();
    
    // Добавляем новый
    orders.push(order);
    
    // Сохраняем
    await saveOrders(orders);
    
    // Отправляем в Discord
    await sendToDiscord(order);
    
    // Показываем код
    document.getElementById('code').textContent = code;
    document.getElementById('result').classList.add('show');
    
    // Очищаем поля
    document.getElementById('username').value = '';
    document.getElementById('amount').value = '';
    
    showNotification('✅ Код сгенерирован!');
}

// Пресеты
document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.getElementById('amount').value = this.dataset.amount;
    });
});

// Загрузка при старте
showRecentPurchases();

// Обновление каждые 5 секунд
setInterval(showRecentPurchases, 5000);
