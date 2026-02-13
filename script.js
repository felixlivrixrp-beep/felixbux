// Webhook
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1471128466593288417/LGKIJtZe_dVEFMDeG6VPNWp-JxuCtYFJRKMmxaeqILqc2lz1qde8BwWWlGvPjZ4ciDh9';

// Генерация кода
function generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    code += chars[Math.floor(Math.random() * 26)];
    for(let i = 0; i < 5; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

// Отправка в Discord
async function sendToWebhook(data) {
    try {
        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                content: `**Новая заявка!**\n**Ник:** ${data.username}\n**Робуксы:** ${data.amount}\n**Код:** ${data.code}`
            })
        });
    } catch(e) {
        console.log('Ошибка но код есть');
    }
}

// Уведомление
function showNotification(msg) {
    const notif = document.createElement('div');
    notif.textContent = msg;
    notif.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#0066cc;color:white;padding:10px 20px;border-radius:30px;z-index:9999';
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 2000);
}

// Копирование
window.copyCode = function() {
    const code = document.getElementById('codeDisplay').textContent;
    navigator.clipboard.writeText(code);
    showNotification('Скопировано!');
};

// Запуск
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('purchaseForm');
    const resultCard = document.getElementById('resultCard');
    const codeDisplay = document.getElementById('codeDisplay');
    const messageCode = document.getElementById('messageCode');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const amount = document.getElementById('robuxAmount').value.trim();
        
        if(!username || !amount) {
            showNotification('Заполни все поля!');
            return;
        }
        
        const code = generateCode();
        
        await sendToWebhook({username, amount, code});
        
        codeDisplay.textContent = code;
        messageCode.textContent = code;
        resultCard.classList.remove('hidden');
    });
    
    // Пресеты
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.getElementById('robuxAmount').value = this.dataset.amount;
        });
    });
});
