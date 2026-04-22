const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinBtn');
const input = document.getElementById('participantsInput');
const winnersList = document.getElementById('winnersList');
const overlay = document.getElementById('winnerOverlay');
const display = document.getElementById('winnerNameDisplay');
const closeBtn = document.getElementById('closeBtn');
const clearBtn = document.getElementById('clearHistoryBtn');

// Работа с паролем в памяти браузера
const getSavedPass = () => sessionStorage.getItem('spin_pass');

function askPassword() {
    const pass = prompt("Введите пароль для доступа к розыгрышу:");
    if (pass) {
        sessionStorage.setItem('spin_pass', pass);
        location.reload(); // перезагрузка для доступа только с паролем
    }
}

let names = [], startAngle = 0, arc = 0, spinTimeout = null;
let spinAngleStart = 0, spinTime = 0, spinTimeTotal = 0;
const colors = ["#3498db", "#e67e22", "#9b59b6", "#f1c40f", "#1abc9c", "#e74c3c", "#2ecc71", "#34495e"];

// Загрузка истории
async function loadHistory() {
    const currentPass = getSavedPass();
    if (!currentPass) return;

    try {
        const res = await fetch('/get-history', {
            headers: { 'x-auth-password': currentPass }
        }); 
        
        if (res.status === 401) {
            sessionStorage.removeItem('spin_pass');
            return askPassword();
        }

        const history = await res.json();
        winnersList.innerHTML = '';
        history.reverse().forEach(data => {
            const li = document.createElement('li');
            const dateInfo = data.date ? `${data.date} ` : '';
            li.textContent = `${data.name} (${dateInfo}${data.time})`;
            winnersList.appendChild(li);
        });
    } catch (e) { console.log("Ошибка загрузки истории"); }
}

function drawRouletteWheel() {
    names = input.value.split('\n').filter(name => name.trim() !== "");
    if (!names.length) { ctx.clearRect(0, 0, 400, 400); return; }
    arc = Math.PI * 2 / names.length;
    ctx.clearRect(0, 0, 400, 400);
    names.forEach((name, i) => {
        const angle = startAngle + i * arc;
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.moveTo(200, 200); ctx.arc(200, 200, 200, angle, angle + arc, false); ctx.lineTo(200, 200);
        ctx.fill(); ctx.stroke();
        ctx.save();
        ctx.fillStyle = "white"; ctx.translate(200 + Math.cos(angle + arc / 2) * 140, 200 + Math.sin(angle + arc / 2) * 140);
        ctx.rotate(angle + arc / 2 + Math.PI / 2);
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(name.substring(0, 10), -ctx.measureText(name.substring(0, 10)).width / 2, 0);
        ctx.restore();
    });
}

function rotateWheel() {
    spinTime += 30;
    if (spinTime >= spinTimeTotal) { stopRotateWheel(); return; }
    startAngle += ((spinAngleStart - (spinTime / spinTimeTotal * spinAngleStart)) * Math.PI / 180);
    drawRouletteWheel();
    spinTimeout = setTimeout(rotateWheel, 30);
}

function stopRotateWheel() {
    clearTimeout(spinTimeout);
    const index = Math.floor((360 - (startAngle * 180 / Math.PI + 90) % 360) / (arc * 180 / Math.PI));
    const winner = names[(index + names.length) % names.length];
    
    const now = new Date();
    const winnerData = { 
        name: winner, 
        date: now.toLocaleDateString('ru-RU'),
        time: now.toLocaleTimeString('ru-RU', {hour:'2-digit', minute:'2-digit'}) 
    };

    // отправка с паролем
    fetch('/save-winner', {
        method: 'POST', 
        headers: { 
            'Content-Type': 'application/json',
            'x-auth-password': getSavedPass() 
        },
        body: JSON.stringify(winnerData)
    }).then(res => {
        if (res.status === 401) {
            alert("Срок действия пароля истек или он неверный!");
            sessionStorage.removeItem('spin_pass');
            askPassword();
        }
    });

    const updatedNames = names.filter(n => n != winner);
    input.value = updatedNames.join('\n');
    drawRouletteWheel();

    display.textContent = winner;
    overlay.style.display = 'flex';
    const li = document.createElement('li'); 
    li.textContent = `${winner} (${winnerData.date} ${winnerData.time})`;
    winnersList.prepend(li);
}

spinBtn.addEventListener('click', () => {
    if (!names.length) return alert("Добавьте участников!");
    spinBtn.disabled = true; spinAngleStart = Math.random() * 10 + 30;
    spinTime = 0; spinTimeTotal = Math.random() * 3000 + 4000;
    rotateWheel();
});

closeBtn.addEventListener('click', () => { overlay.style.display = 'none'; spinBtn.disabled = false; });

clearBtn.addEventListener('click', () => {
    if (confirm("Очистить историю?")) {
        fetch('/clear-history', { 
            method: 'POST',
            headers: { 'x-auth-password': getSavedPass() }
        }).then(res => {
            if (res.ok) winnersList.innerHTML = '';
            else alert("Ошибка доступа!");
        });
    }
});

input.addEventListener('input', drawRouletteWheel);

// Проверка пароля
if (!getSavedPass()) {
    askPassword();
} else {
    drawRouletteWheel();
    loadHistory();
}