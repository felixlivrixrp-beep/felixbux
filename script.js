// JSONBin настройки
const BIN_ID = '69906dbbd0ea881f40b9f95d';       // Например: 67b0f2e3ad19ca34f8def456
const API_KEY = '$2a$10$JJhtXuIXTlix2FRrGUr.Ae5mE7zKF7aOkFDvY5IB2tKKFlRGyRAXK';     // Например: $2b$10$xyz123abc...

// Загружаем заказы с JSONBin
async function loadOrders() {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: {
                'X-Master-Key': API_KEY
            }
        });
        const data = await response.json();
        return data.record.orders || [];
    } catch (e) {
        console.log('Ошибка загрузки', e);
        return [];
    }
}

// Сохраняем заказы в JSONBin
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

// Генерация кода
function generateCode() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let code = letters[Math.floor(Math.random() * 26)];
    for(let i = 0; i < 5; i++) {
        code += i % 2 === 0 
            ? numbers[Math.floor(Math.random() * 10)] 
            : letters[Math.floor(Math.random() * 26)];
    }
    return code;
}

// Показать недавние покупки
async function showRecentPurchases() {
    const list = document.getElementById('recentPurchases');
    if (!list) return;
    
    const orders = await loadOrders();
    const paidOrders = orders.filter(o => o.status === 'paid');
    
    if (paidOrders.length === 0) {
        list.innerHTML = '<div style="text-align:center;opacity:0.5;">Пока нет покупок</div>';
        return;
    }
    
    list.innerHTML = paidOrders.slice(-5).reverse().map(o => {
        const hidden = o.nick.length > 4 
            ? o.nick[0] + '...' + o.nick.slice(-2) 
            : o.nick[0] + '...' + o.nick.slice(-1);
        return `
            <div style="display:flex;justify-content:space-between;padding:10px;background:rgba(255,255,255,0.05);border-radius:10px;margin-bottom:5px;">
                <span style="color:#66ccff;">${hidden}</span>
                <span>${o.amount} Robux</span>
                <span style="color:#00ff00;">✓</span>
            </div>
        `;
    }).join('');
}

// Обработка формы
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('orderForm');
    if (!form) return;
    
    const result = document.getElementById('result');
    const codeDisplay = document.getElementById('codeDisplay');
    const username = document.getElementById('username');
    const amount = document.getElementById('amount');
    
    // Показать покупки при загрузке
    showRecentPurchases();
    
    // Пресеты
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            amount.value = this.dataset.amount;
        });
    });
    
    // Отправка формы
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
        
        // Загружаем текущие заказы
        let orders = await loadOrders();
        
        // Добавляем новый
        orders.push(order);
        
        // Сохраняем в общее хранилище
        await saveOrders(orders);
        
        // Показываем код
        codeDisplay.textContent = code;
        result.style.display = 'block';
        
        // Очищаем поля
        username.value = '';
        amount.value = '';
        
        // Обновляем список покупок
        showRecentPurchases();
    });
});

// Копирование кода
function copyCode() {
    const code = document.getElementById('codeDisplay').textContent;
    navigator.clipboard.writeText(code);
    alert('Код скопирован!');
}

// Обновление каждые 5 секунд
setInterval(showRecentPurchases, 5000);
