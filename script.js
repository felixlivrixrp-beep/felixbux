// Webhook Discord
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1471128466593288417/LGKIJtZe_dVEFMDeG6VPNWp-JxuCtYFJRKMmxaeqILqc2lz1qde8BwWWlGvPjZ4ciDh9';

// Генерация кода
function generateCode() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let code = '';
    code += letters[Math.floor(Math.random() * 26)];
    for(let i = 0; i < 5; i++) {
        if(i % 2 === 0) {
            code += numbers[Math.floor(Math.random() * 10)];
        } else {
            code += letters[Math.floor(Math.random() * 26)];
        }
    }
    return code;
}

// Копирование кода
function copyCode() {
    const code = document.getElementById('code').innerText;
    navigator.clipboard.writeText(code);
    alert('Код скопирован!');
}

// Запуск
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('orderForm');
    if(!form) return;
    
    const result = document.getElementById('result');
    const codeEl = document.getElementById('code');
    const codeMsg = document.getElementById('codeMsg');
    
    // Кнопки пресетов
    document.querySelectorAll('.preset').forEach(btn => {
        btn.addEventListener('click', function() {
            document.getElementById('amount').value = this.dataset.amount;
        });
    });
    
    // Отправка формы
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const amount = document.getElementById('amount').value;
        
        if(!username || !amount) {
            alert('Заполни все поля!');
            return;
        }
        
        const code = generateCode();
        
        // Отправка в Discord
        try {
            await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    content: `**Новый заказ!**\n👤 Ник: ${username}\n💰 Робуксы: ${amount}\n🔑 Код: ${code}`
                })
            });
        } catch(e) {
            console.log('Ошибка отправки');
        }
        
        // Показываем результат
        codeEl.innerText = code;
        codeMsg.innerText = code;
        result.classList.remove('hidden');
    });
});
