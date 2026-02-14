// Конфигурация
const CONFIG = {
    // Время окончания техработ (можно изменить)
    endTime: new Date().getTime() + (2 * 60 * 60 * 1000), // +2 часа
    
    // Сообщения для уведомлений
    messages: [
        "🔄 Обновляем базу данных...",
        "⚙️ Настраиваем сервера...",
        "🔧 Исправляем ошибки...",
        "📦 Загружаем обновления...",
        "✨ Добавляем новые функции..."
    ]
};

// Переменные
let counter = 0;
let messageIndex = 0;

// Обновление счетчика
function updateCounter() {
    counter++;
    document.getElementById('counter').textContent = counter;
}

// Обновление таймера
function updateTimer() {
    const now = new Date().getTime();
    const distance = CONFIG.endTime - now;
    
    if (distance < 0) {
        document.getElementById('timer').textContent = '00:00:00';
        return;
    }
    
    const hours = Math.floor(distance / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    document.getElementById('timer').textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Показ уведомления
function showNotification(message) {
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.textContent = message;
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.remove();
    }, 3000);
}

// Случайное уведомление
function randomNotification() {
    const randomIndex = Math.floor(Math.random() * CONFIG.messages.length);
    showNotification(CONFIG.messages[randomIndex]);
}

// Проверка статуса
function checkStatus() {
    showNotification('🔍 Проверяем статус серверов...');
    
    // Имитация проверки
    setTimeout(() => {
        const random = Math.random();
        if (random < 0.7) {
            showNotification('⏳ Работы ещё ведутся');
        } else {
            showNotification('✅ Почти готово!');
        }
    }, 1500);
}

// Обновление каждую секунду
setInterval(() => {
    updateCounter();
    updateTimer();
}, 1000);

// Уведомление каждые 30 секунд
setInterval(randomNotification, 30000);

// При загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Показываем приветственное уведомление
    setTimeout(() => {
        showNotification('👋 Привет! Мы обновляем сайт');
    }, 1000);
    
    // Запускаем таймер
    updateTimer();
    
    // Сохраняем в историю
    sessionStorage.setItem('techWork', 'true');
});

// Если пользователь пытается уйти
window.addEventListener('beforeunload', function(e) {
    e.preventDefault();
    e.returnValue = '';
});

// Блокировка F5 (обновление через нашу кнопку)
document.addEventListener('keydown', function(e) {
    if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        e.preventDefault();
        checkStatus();
    }
});
