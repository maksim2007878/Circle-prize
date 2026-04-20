const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinBtn');
const input = document.getElementById('participantsInput');
const winnersList = document.getElementById('winnersList');
const overlay = document.getElementById('winnerOverlay');
const display = document.getElementById('winnerNameDisplay');
const closeBtn = document.getElementById('closeBtn');

let names = [];
let startAngle = 0;
let arc = 0;
let spinTimeout = null;
let spinAngleStart = 0;
let spinTime = 0;
let spinTimeTotal = 0;

const colors = ["#3498db", "#e67e22", "#9b59b6", "#f1c40f", "#1abc9c", "#e74c3c", "#2ecc71", "#34495e"];

function drawRouletteWheel() {  // Вид колеса 
    names = input.value.split('\n').filter(name => name.trim() !== "");
    if (names.length === 0) {
        ctx.clearRect(0, 0, 400, 400);
        return;
    }

    const numOptions = names.length;
    arc = Math.PI * 2 / numOptions;

    ctx.clearRect(0, 0, 400, 400);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;

    names.forEach((name, i) => {
        const angle = startAngle + i * arc;
        ctx.fillStyle = colors[i % colors.length];

        ctx.beginPath();
        ctx.moveTo(200, 200);
        ctx.arc(200, 200, 200, angle, angle + arc, false);
        ctx.lineTo(200, 200);
        ctx.fill();
        ctx.stroke();

        ctx.save();
        ctx.fillStyle = "white";
        ctx.translate(200 + Math.cos(angle + arc / 2) * 140, 200 + Math.sin(angle + arc / 2) * 140);
        ctx.rotate(angle + arc / 2 + Math.PI / 2);
        ctx.font = 'bold 16px sans-serif';
        const text = name.length > 12 ? name.substring(0, 10) + ".." : name;
        ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
        ctx.restore();
    });
}

function rotateWheel() {    // Запуск колеса
    spinTime += 20;
    if (spinTime >= spinTimeTotal) {
        stopRotateWheel();
        return;
    }
    const spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
    startAngle += (spinAngle * Math.PI / 180);
    drawRouletteWheel();
    spinTimeout = setTimeout(rotateWheel, 30);
}

function stopRotateWheel() {    // Выборка победителя
    clearTimeout(spinTimeout);
    const degrees = startAngle * 180 / Math.PI + 90;
    const arcd = arc * 180 / Math.PI;
    const index = Math.floor((360 - degrees % 360) / arcd);
    const winner = names[(index + names.length) % names.length];    
    // Показ окна
    display.textContent = winner;
    overlay.style.display = 'flex';

    // Добавляет в историю победителей
    const li = document.createElement('li');
    li.textContent = winner;
    winnersList.prepend(li);
}

function easeOut(t, b, c, d) {  // Остановка колеса
    const ts = (t /= d) * t;
    const tc = ts * t;
    return b + c * (tc + -3 * ts + 3 * t);
}

spinBtn.addEventListener('click', () => {   // Проверка на участников (кнопка)
    if (names.length === 0) return alert("Добавьте участников!");
    spinBtn.disabled = true;
    spinAngleStart = Math.random() * 10 + 40;
    spinTime = 0;
    spinTimeTotal = Math.random() * 3000 + 4000;
    rotateWheel();
});

// Обработка закрытия окна  
closeBtn.addEventListener('click', () => {
    overlay.style.display = 'none';
    spinBtn.disabled = false;
});

input.addEventListener('input', drawRouletteWheel); // Добавляет участников в колесо


drawRouletteWheel();
