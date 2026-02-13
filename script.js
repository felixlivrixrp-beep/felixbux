// Webhook URL (твой Discord webhook)
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1471128466593288417/LGKIJtZe_dVEFMDeG6VPNWp-JxuCtYFJRKMmxaeqILqc2lz1qde8BwWWlGvPjZ4ciDh9';

// Функция генерации кода
function generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    code += chars[Math.floor(Math.random() * 26)];
    for (let i = 0; i < 5; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

// Функция отправки данных в Discord
async function sendToWebhook(data) {
    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: `**Новая заявка на FelixBux!**\n**Ник:** ${data.username}\n**Робуксы:** ${data.amount}\n**Код:** ${data.code}\n**Время:** ${new Date().toLocaleString('ru-RU')}`
            })
        });
        
        if (!response.ok) {
            throw new Error('Ошибка отправки');
        }
        
        console.log('Данные успешно отправлены в Discord');
    } catch (error) {
        console.error('Ошибка при отправке в Discord:', error);
        showNotification('Ошибка отправки данных, но код сгенерирован!', 'error');
    }
}

// Функция показа уведомления
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Функция копирования кода
window.copyCode = function() {
    const codeElement = document.getElementById('codeDisplay');
    const code = codeElement.textContent;
    
    navigator.clipboard.writeText(code).then(() => {
        showNotification('Код скопирован!');
    }).catch(() => {
        showNotification('Ошибка копирования', 'error');
    });
};

// Навигация между страницами
function showPage(pageId) {
    // Скрываем все страницы
    document.getElementById('home-page').classList.add('hidden');
    document.getElementById('how-it-works-page').classList.add('hidden');
    document.getElementById('reviews-page').classList.add('hidden');
    
    // Показываем нужную страницу
    document.getElementById(pageId).classList.remove('hidden');
    
    // Обновляем активный класс в навигации
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageId.replace('-page', '')) {
            link.classList.add('active');
        }
    });
}

// Основной код при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('purchaseForm');
    const submitBtn = document.getElementById('submitBtn');
    const resultCard = document.getElementById('resultCard');
    const codeDisplay = document.getElementById('codeDisplay');
    const messageCode = document.getElementById('messageCode');
    const usernameInput = document.getElementById('username');
    const robuxAmount = document.getElementById('robuxAmount');
    
    // Навигация
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            showPage(page + '-page');
        });
    });
    
    // Пресеты для количества робуксов
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const amount = this.dataset.amount;
            robuxAmount.value = amount;
            
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 100);
        });
    });
    
    // Валидация ввода ника
    usernameInput.addEventListener('input', function(e) {
        this.value = this.value.replace(/[^a-zA-Z0-9_]/g, '');
    });
    
    // Обработка отправки формы
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const amount = robuxAmount.value.trim();
        
        if (!username || !amount) {
            showNotification('Заполни все поля!', 'error');
            return;
        }
        
        if (amount < 10 || amount > 10000) {
            showNotification('Количество робуксов от 10 до 10000', 'error');
            return;
        }
        
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        const code = generateCode();
        
        const orderData = {
            username: username,
            amount: amount,
            code: code,
            timestamp: new Date().toISOString()
        };
        
        await sendToWebhook(orderData);
        
        codeDisplay.textContent = code;
        messageCode.textContent = code;
        
        resultCard.classList.remove('hidden');
        resultCard.style.display = 'block';
        
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Сохраняем в localStorage
        const orders = JSON.parse(localStorage.getItem('felixbux_orders') || '[]');
        orders.push(orderData);
        localStorage.setItem('felixbux_orders', JSON.stringify(orders.slice(-10)));
    });
    
    // Скрываем результат при загрузке
    resultCard.style.display = 'none';
    
    // Эффекты при наведении
    const codeBox = document.querySelector('.code-box');
    if (codeBox) {
        codeBox.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
        });
        
        codeBox.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    }
    
    // Валидация количества
    robuxAmount.addEventListener('input', function() {
        let value = parseInt(this.value);
        if (value < 10) this.value = 10;
        if (value > 10000) this.value = 10000;
    });
});

// Параллакс для фона
document.addEventListener('mousemove', function(e) {
    const spheres = document.querySelectorAll('.gradient-sphere');
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    
    spheres.forEach((sphere, index) => {
        const speed = (index + 1) * 20;
        const x = (mouseX - 0.5) * speed;
        const y = (mouseY - 0.5) * speed;
        sphere.style.transform = `translate(${x}px, ${y}px)`;
    });
});
