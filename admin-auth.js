// Этот файл можно назвать как угодно, например "admin-auth.js"
// Пароль ТОЛЬКО здесь!

const ADMIN_PASSWORD = 'Felix2013Livrix';

// Функция для входа
window.checkPassword = function() {
    let password = document.getElementById('adminPassword').value;
    
    if(password === ADMIN_PASSWORD) {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('adminContent').style.display = 'block';
        loadOrders();
        sessionStorage.setItem('adminLoggedIn', 'true');
    } else {
        document.getElementById('loginError').style.display = 'block';
        document.getElementById('adminPassword').value = '';
    }
}

// Остальной код админки
let orders = [];
let recentPurchases = JSON.parse(localStorage.getItem('recentPurchases') || '[]');

window.loadOrders = function() {
    orders = JSON.parse(localStorage.getItem('orders') || '[]');
    renderOrders();
    updateStats();
}

function updateStats() {
    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('paidOrders').textContent = orders.filter(o => o.status === 'paid').length;
    document.getElementById('waitingOrders').textContent = orders.filter(o => o.status === 'waiting').length;
}

window.payOrder = function(id) {
    orders = orders.map(order => {
        if(order.id === id) {
            order.status = 'paid';
            recentPurchases.push({
                nick: order.nick,
                amount: order.amount,
                time: new Date().toLocaleTimeString()
            });
            if(recentPurchases.length > 10) recentPurchases = recentPurchases.slice(-10);
            localStorage.setItem('recentPurchases', JSON.stringify(recentPurchases));
        }
        return order;
    });
    localStorage.setItem('orders', JSON.stringify(orders));
    loadOrders();
}

window.cancelOrder = function(id) {
    if(confirm('Отменить заказ?')) {
        orders = orders.map(order => {
            if(order.id === id) order.status = 'cancelled';
            return order;
        });
        localStorage.setItem('orders', JSON.stringify(orders));
        loadOrders();
    }
}

window.deleteOrder = function(id) {
    if(confirm('Удалить заказ навсегда?')) {
        orders = orders.filter(order => order.id !== id);
        localStorage.setItem('orders', JSON.stringify(orders));
        
        let paidOrders = orders.filter(o => o.status === 'paid');
        recentPurchases = paidOrders.slice(-10).map(o => ({
            nick: o.nick,
            amount: o.amount,
            time: o.time
        }));
        localStorage.setItem('recentPurchases', JSON.stringify(recentPurchases));
        
        loadOrders();
    }
}

function renderOrders() {
    let tbody = document.getElementById('ordersBody');
    
    if(orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; opacity: 0.5; padding: 40px;">Нет заказов</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.reverse().map(order => {
        let statusClass = 'status-waiting';
        let statusText = 'Ожидает';
        
        if(order.status === 'paid') {
            statusClass = 'status-paid';
            statusText = 'Оплачено';
        } else if(order.status === 'cancelled') {
            statusClass = 'status-cancelled';
            statusText = 'Отменен';
        }
        
        return `
            <tr>
                <td><strong style="color: #66ccff;">${order.nick}</strong></td>
                <td>${order.amount} Robux</td>
                <td style="font-family: monospace; color: #66ccff;">${order.code}</td>
                <td style="opacity: 0.7;">${order.time}</td>
                <td><span class="status ${statusClass}">${statusText}</span></td>
                <td>
                    ${order.status === 'waiting' ? 
                        `<button class="action-btn pay-btn" onclick="payOrder(${order.id})">✓ Оплатить</button>
                         <button class="action-btn cancel-btn" onclick="cancelOrder(${order.id})">✗ Отменить</button>` : 
                        `<button class="action-btn cancel-btn" onclick="deleteOrder(${order.id})">🗑 Удалить</button>`
                    }
                </td>
            </tr>
        `;
    }).join('');
}

// Проверка сессии
window.onload = function() {
    if(sessionStorage.getItem('adminLoggedIn') === 'true') {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('adminContent').style.display = 'block';
        loadOrders();
    }
}

document.getElementById('adminPassword').addEventListener('keypress', function(e) {
    if(e.key === 'Enter') checkPassword();
});
