// Webhook Discord
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1471128466593288417/LGKIJtZe_dVEFMDeG6VPNWp-JxuCtYFJRKMmxaeqILqc2lz1qde8BwWWlGvPjZ4ciDh9';

// Загружаем данные
let orders = JSON.parse(localStorage.getItem('orders') || '[]');
let recentPurchases = JSON.parse(localStorage.getItem('recentPurchases') || '[]');

// Генерация кода
function generateCode() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let code = letters[Math.floor(Math.random() * 26)];
    
    for(let i = 0; i < 5; i++) {
        if(i % 2 === 0) {
            code += numbers[Math.floor(Math.random() * 10)];
        } else {
            code += letters[Math.floor(Math.random() * 26)];
        }
    }
    
    return code;
}

// Показать уведомление
function showNotification(message, type = 'success') {
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.textContent = message;
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.remove();
    }, 3000);
}

// Копирование кода
function copyCode() {
    const code = document.getElementById('codeDisplay').textContent;
    navigator.clipboard.writeText(code);
    showNotification('Код скопирован в буфер обмена!');
}

// Показать недавние покупки
function showRecentPurchases() {
    const list = document.getElementById('recentPurchases');
    if(!list) return;
    
    if(recentPurchases.length === 0) {
        list.innerHTML = '<div style="text-align: center; opacity: 0.5; padding: 20px;">Пока нет покупок</div>';
        return;
    }
    
    list.innerHTML = recentPurchases.slice(-5).reverse().map(purchase => {
        // Скрываем ник (первая буква + ... + последняя)
        const nick = purchase.nick;
        const hiddenNick = nick.length > 4 ? 
            nick[0] + '...' + nick.slice(-2) : 
            nick[0] + '...' + nick.slice(-1);
        
        return `
            <div class="purchase-item">
                <div class="purchase-info">
                    <span class="purchase-nick">${hiddenNick}</span>
                    <span class="purchase-amount">${purchase.amount} Robux</span>
                </div>
                <div>
                    <span class="purchase-time">${purchase.time}</span>
                    <span class="purchase-status">✓</span>
                </div>
            </div>
        `;
    }).join('');
}

// Отправка в Discord
async function sendToDiscord(data) {
    try {
        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: `**Новый заказ!**\n👤 **Ник:** ${data.username}\n💰 **Робуксы:** ${data.amount}\n🔑 **Код:** ${data.code}`
            })
        });
    } catch (error) {
        console.log('Discord webhook error:', error);
    }
}

// Загрузка страницы
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('orderForm');
    const submitBtn = document.getElementById('submitBtn');
    const result = document.getElementById('result');
    const codeDisplay = document.getElementById('codeDisplay');
    const messageCode = document.getElementById('messageCode');
    const username = document.getElementById('username');
    const amount = document.getElementById('amount');
    
    // Показываем недавние покупки
    showRecentPurchases();
    
    // Пресеты
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            amount.value = this.dataset.amount;
            
            // Анимация
            this.style.transform = 'scale(0.9)';
            setTimeout(() => {
                this.style.transform = '';
            }, 100);
        });
    });
    
    // Валидация ника (только буквы и цифры)
    username.addEventListener('input', function() {
        this.value = this.value.replace(/[^a-zA-Z0-9_]/g, '');
    });
    
    // Отправка формы
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const user = username.value.trim();
        const robux = amount.value.trim();
        
        if(!user || !robux) {
            showNotification('Заполните все поля!', 'error');
            return;
        }
        
        if(robux < 10 || robux > 10000) {
            showNotification('Количество робуксов от 10 до 10000', 'error');
            return;
        }
        
        // Показываем загрузку
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        // Генерируем код
        const code = generateCode();
        
        // Создаем заказ
        const order = {
            id: Date.now(),
            nick: user,
            amount: robux,
            code: code,
            time: new Date().toLocaleString(),
            status: 'waiting'
        };
        
        // Сохраняем
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // Отправляем в Discord
        await sendToDiscord({
            username: user,
            amount: robux,
            code: code
        });
        
        // Показываем результат
        codeDisplay.textContent = code;
        messageCode.textContent = code;
        result.classList.remove('hidden');
        
        // Убираем загрузку
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        
        // Очищаем поля
        username.value = '';
        amount.value = '';
        
        // Скролл к результату
        result.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
});

// Обновление недавних покупок каждые 3 секунды
setInterval(() => {
    recentPurchases = JSON.parse(localStorage.getItem('recentPurchases') || '[]');
    showRecentPurchases();
}, 3000);
