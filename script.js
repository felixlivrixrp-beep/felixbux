const WEBHOOK_URL = 'https://discord.com/api/webhooks/1471128466593288417/LGKIJtZe_dVEFMDeG6VPNWp-JxuCtYFJRKMmxaeqILqc2lz1qde8BwWWlGvPjZ4ciDh9';

// Генерация кода
function generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    code += chars[Math.floor(Math.random() * 26)];
    for (let i = 0; i < 5; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

// Отправка в Discord
async function sendToWebhook(data) {
    try {
        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: `**Новая заявка!**\n**Ник:** ${data.username}\n**Робуксы:** ${data.amount}\n**Код:** ${data.code}`
            })
        });
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

// Уведомление
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Копирование кода
window.copyCode = function() {
    const code = document.getElementById('codeDisplay').textContent;
    navigator.clipboard.writeText(code);
    showNotification('Код скопирован!');
};

// Навигация между страницами
function showPage(pageId) {
    // Скрываем все страницы
    document.getElementById('home-page').classList.add('hidden');
    document.getElementById('how-it-works-page').classList.add('hidden');
    document.getElementById('reviews-page').classList.add('hidden');
    
    // Показываем нужную
    document.getElementById(pageId).classList.remove('hidden');
    
    // Обновляем активную ссылку
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageId.replace('-page', '')) {
            link.classList.add('active');
        }
    });
}

// Запуск при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Навигация
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            showPage(page + '-page');
        });
    });
    
    // Форма
    const form = document.getElementById('purchaseForm');
    const resultCard = document.getElementById('resultCard');
    const codeDisplay = document.getElementById('codeDisplay');
    const messageCode = document.getElementById('messageCode');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const amount = document.getElementById('robuxAmount').value.trim();
        
        if (!username || !amount) {
            showNotification('Заполни все поля!');
            return;
        }
        
        const code = generateCode();
        
        await sendToWebhook({ username, amount, code });
        
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
