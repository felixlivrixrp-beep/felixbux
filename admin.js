// Firebase конфиг
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyBrZ7R9KjKjKjKjKjKjKjKjKjKjKjKjKjK",
    authDomain: "felixbux.firebaseapp.com",
    databaseURL: "https://felixbux-default-rtdb.firebaseio.com",
    projectId: "felixbux",
    storageBucket: "felixbux.appspot.com",
    messagingSenderId: "123456789012"
};

// Инициализация
let database;
try {
    firebase.initializeApp(FIREBASE_CONFIG);
    database = firebase.database();
} catch (e) {}

let orders = [];

// Загрузка заказов
async function loadOrders() {
    try {
        if (database) {
            const snapshot = await database.ref('orders').once('value');
            const data = snapshot.val();
            orders = data ? Object.values(data) : [];
        } else {
            orders = JSON.parse(localStorage.getItem('orders') || '[]');
        }
        updateStats();
        renderOrders();
    } catch (e) {
        console.log('Ошибка загрузки', e);
    }
}

// Обновление статистики
function updateStats() {
    document.getElementById('totalOrders').innerText = orders.length;
    document.getElementById('paidOrders').innerText = orders.filter(o => o.status === 'paid').length;
    document.getElementById('waitingOrders').innerText = orders.filter(o => o.status === 'waiting').length;
}

// Оплатить заказ
async function payOrder(id) {
    if (!confirm('Отметить как оплачено?')) return;
    
    if (database) {
        const ordersRef = database.ref('orders');
        const snapshot = await ordersRef.once('value');
        const data = snapshot.val();
        
        Object.keys(data).forEach(key => {
            if (data[key].id === id) {
                data[key].status = 'paid';
                ordersRef.child(key).set(data[key]);
            }
        });
    } else {
        orders = orders.map(o => {
            if (o.id === id) o.status = 'paid';
            return o;
        });
        localStorage.setItem('orders', JSON.stringify(orders));
    }
    
    loadOrders();
}

// Отображение заказов
function renderOrders() {
    const tbody = document.getElementById('ordersBody');
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:40px;">Нет заказов</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.reverse().map(o => `
        <tr>
            <td><strong style="color:#66ccff;">${o.nick}</strong></td>
            <td>${o.amount} Robux</td>
            <td style="font-family:monospace;">${o.code}</td>
            <td>${o.time}</td>
            <td><span class="status status-${o.status}">${o.status === 'paid' ? 'Оплачено' : 'Ожидает'}</span></td>
            <td>
                ${o.status === 'waiting' 
                    ? `<button class="action-btn pay-btn" onclick="payOrder(${o.id})">✅ Оплатить</button>` 
                    : '—'}
            </td>
        </tr>
    `).join('');
}

// Логин
function login() {
    const user = document.getElementById('loginUser').value;
    const pass = document.getElementById('loginPass').value;
    
    if (user === 'Felix' && pass === 'Felix2013FelixBux') {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        loadOrders();
        setInterval(loadOrders, 5000);
    } else {
        alert('Неверный логин или пароль!');
    }
}
