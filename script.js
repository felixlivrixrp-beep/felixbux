const WEBHOOK_URL = 'https://discord.com/api/webhooks/1471128466593288417/LGKIJtZe_dVEFMDeG6VPNWp-JxuCtYFJRKMmxaeqILqc2lz1qde8BwWWlGvPjZ4ciDh9';

let orders = JSON.parse(localStorage.getItem('orders') || '[]');
let recentPurchases = JSON.parse(localStorage.getItem('recentPurchases') || '[]');

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

function showNotification(message) {
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
}

function copyCode() {
    const code = document.getElementById('codeDisplay').textContent;
    navigator.clipboard.writeText(code);
    showNotification('Код скопирован!');
}

function showRecentPurchases() {
    const list = document.getElementById('recentPurchases');
    if(!list) return;
    
    if(recentPurchases.length === 0) {
        list.innerHTML = '<div style="text-align: center; opacity: 0.5; padding: 20px;">Пока нет покупок</div>';
        return;
    }
    
    list.innerHTML = recentPurchases.slice(-5).reverse().map(p => {
        const nick = p.nick;
        const hidden = nick.length > 4 ? nick[0] + '...' + nick.slice(-2) : nick[0] + '...' + nick.slice(-1);
        
        return `
            <div class="purchase-item">
                <div class="purchase-info">
                    <span class="purchase-nick">${hidden}</span>
                    <span class="purchase-amount">${p.amount} Robux</span>
                </div>
                <div>
                    <span class="purchase-time">${p.time}</span>
                    <span class="purchase-status">✓</span>
                </div>
            </div>
        `;
    }).join('');
}

async function sendToDiscord(data) {
    try {
        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: `**Новый заказ!**\n👤 **Ник:** ${data.username}\n💰 **Робуксы:** ${data.amount}\n🔑 **Код:** ${data.code}`
            })
        });
    } catch (e) {}
}

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('orderForm');
    if(!form) return;
    
    const submitBtn = document.getElementById('submitBtn');
    const result = document.getElementById('result');
    const codeDisplay = document.getElementById('codeDisplay');
    const messageCode = document.getElementById('messageCode');
    const username = document.getElementById('username');
    const amount = document.getElementById('amount');
    
    showRecentPurchases();
    
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            amount.value = this.dataset.amount;
        });
    });
    
    username.addEventListener('input', function() {
        this.value = this.value.replace(/[^a-zA-Z0-9_]/g, '');
    });
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const user = username.value.trim();
        const robux = amount.value.trim();
        
        if(!user || !robux) {
            showNotification('Заполните все поля!');
            return;
        }
        
        if(robux < 10 || robux > 10000) {
            showNotification('Количество робуксов от 10 до 10000');
            return;
        }
        
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        const code = generateCode();
        
        const order = {
            id: Date.now(),
            nick: user,
            amount: robux,
            code: code,
            time: new Date().toLocaleString(),
            status: 'waiting'
        };
        
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));
        
        await sendToDiscord({ username: user, amount: robux, code: code });
        
        codeDisplay.textContent = code;
        messageCode.textContent = code;
        result.classList.remove('hidden');
        
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        
        username.value = '';
        amount.value = '';
        result.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
});

setInterval(() => {
    recentPurchases = JSON.parse(localStorage.getItem('recentPurchases') || '[]');
    showRecentPurchases();
}, 3000);
