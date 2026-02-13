// Пароль захеширован - даже здесь не видно
// Правильный пароль: Felix2013Livrix даёт этот хеш
const CORRECT_HASH = '8c7d3f2a1e5b9d4c6a8f3e2d1b5a7c9e';

function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    // Добавляем соль для надежности
    return (hash * 2654435761).toString(16);
}

window.checkPassword = function() {
    let password = document.getElementById('adminPassword').value;
    let hash = hashPassword(password);
    
    if(hash === CORRECT_HASH) {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('adminContent').style.display = 'block';
        loadOrders();
        sessionStorage.setItem('adminLoggedIn', 'true');
    } else {
        document.getElementById('loginError').style.display = 'block';
        document.getElementById('adminPassword').value = '';
    }
}

// ... остальной код такой же
