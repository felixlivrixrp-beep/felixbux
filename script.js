// Telegram Bot токен и chat ID (твой)
const TELEGRAM_TOKEN = 'ТОКЕН_БОТА';
const TELEGRAM_CHAT_ID = 'ТВОЙ_ID';

// Загружаем недавние покупки
let recentPurchases = JSON.parse(localStorage.getItem('recentPurchases') || '[]');

function generateCode() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let code = letters[Math.floor(Math.random() * 26)];
    for(let i = 0; i < 5; i++) {
        code += i % 2 === 0 ? numbers[Math.floor(Math.random() * 10)] : letters[Math.floor(Math.random() * 26)];
    }
    return code;
}

function copyCode() {
    const code = document.getElementById('codeDisplay').textContent;
    navigator.clipboard.writeText(code);
    alert('Код скопирован!');
}

function showRecentPurchases() {
    const list = document.getElementById('recentPurchases');
    if (!list) return;
    
    if (recentPurchases.length === 0) {
        list.innerHTML = '<div style="text-align:center;opacity:0.5;">Пока нет покупок</div>';
        return;
    }
    
    list.innerHTML = recentPurchases.slice(-5).reverse().map(p => {
        const hidden = p.nick.length > 4 ? p.nick[0] + '...' + p.nick.slice(-2) : p.nick[0] + '...' + p.nick.slice(-1);
        return `
            <div class="purchase-item">
                <span>${hidden}</span>
                <span>${p.amount} Robux</span>
                <span style="color:#00ff00;">✓</span>
            </div>
        `;
    }).join('');
}

// Отправка в Telegram
async function sendToTelegram(order) {
    const text = `
🔔 **Новый заказ!**
👤 Ник: ${order.nick}
💰 Робуксы: ${order.amount}
🔑 Код: ${order.code}
🆔 ID: ${order.id}
    `;
    
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: text,
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '✅ Оплачено', callback_data: `pay_${order.id}` },
                            { text: '❌ Отменить', callback_data: `cancel_${order.id}` }
                        ]
                    ]
                }
            })
        });
    } catch (e) {
        console.log('Ошибка отправки в Telegram', e);
    }
}

// Обработка формы
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('orderForm');
    if (!form) return;
    
    const result = document.getElementById('result');
    const codeDisplay = document.getElementById('codeDisplay');
    const username = document.getElementById('username');
    const amount = document.getElementById('amount');
    
    showRecentPurchases();
    
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            amount.value = this.dataset.amount;
        });
    });
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const user = username.value.trim();
        const robux = amount.value.trim();
        
        if (!user || !robux) {
            alert('Заполни все поля!');
            return;
        }
        
        if (robux < 20 || robux > 5000) {
            alert('От 20 до 5000 Robux');
            return;
        }
        
        const code = generateCode();
        const order = {
            id: Date.now(),
            nick: user,
            amount: robux,
            code: code,
            time: new Date().toLocaleString(),
            status: 'waiting'
        };
        
        // Отправляем в Telegram
        await sendToTelegram(order);
        
        // Показываем код
        codeDisplay.textContent = code;
        result.style.display = 'block';
        
        // Очищаем поля
        username.value = '';
        amount.value = '';
    });
});

// Обновление недавних покупок
setInterval(() => {
    recentPurchases = JSON.parse(localStorage.getItem('recentPurchases') || '[]');
    showRecentPurchases();
}, 3000);
