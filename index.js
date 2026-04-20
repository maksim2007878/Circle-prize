const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinBtn');
const input = document.getElementById('participantsInput');
const winnersList = document.getElementById('winnersList');
const overlay = document.getElementById('winnerOverlay');
const display = document.getElementById('winnerNameDisplay');
const closeBtn = document.getElementById('closeBtn');
const clearBtn = document.getElementById('clearHistoryBtn');

let names = [];
let startAngle = 0;
let arc = 0;
let spinTimeout = null;
let spinAngleStart = 0;
let spinTime = 0;
let spinTimeTotal = 0;
const colors = ["#3498db", "#e67e22", "#9b59b6", "#f1c40f", "#1abc9c", "#e74c3c", "#2ecc71", "#34495e"];

async function loadHistory() {
    try {
        const res = await fetch('/history.json');
        const history = await res.json();
        winnersList.innerHTML = '';
        history.reverse().forEach(data => {
            const li = document.createElement('li');
            li.textContent = `${data.name} (${data.time})`;
            winnersList.appendChild(li);
        });
    } catch (e) { console.log("История пуста"); }
}

function drawRouletteWheel() {
    names = input.value.split('\n').filter(name => name.trim() !== "");
    if (names.length === 0) { ctx.clearRect(0, 0, 400, 400); return; }
    arc = Math.PI * 2 / names.length;
    ctx.clearRect(0, 0, 400, 400);
    names.forEach((name, i) => {
        const angle = startAngle + i * arc;
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.moveTo(200, 200);
        ctx.arc(200, 200, 200, angle, angle + arc, false);
        ctx.lineTo(200, 200);
        ctx.fill();
        ctx.save();
        ctx.fillStyle = "white";
        ctx.translate(200 + Math.cos(angle + arc / 2) * 140, 200 + Math.sin(angle + arc / 2) * 140);
        ctx.rotate(angle + arc / 2 + Math.PI / 2);
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(name.substring(0, 10), -ctx.measureText(name.substring(0, 10)).width / 2, 0);
        ctx.restore();
    });
}

function rotateWheel() {
    spinTime += 20;
    if (spinTime >= spinTimeTotal) { stopRotateWheel(); return; }
    startAngle += ((spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal)) * Math.PI / 180);
    drawRouletteWheel();
    spinTimeout = setTimeout(rotateWheel, 30);
}

function stopRotateWheel() {
    clearTimeout(spinTimeout);
    const degrees = startAngle * 180 / Math.PI + 90;
    const index = Math.floor((360 - degrees % 360) / (arc * 180 / Math.PI));
    const winner = names[(index + names.length) % names.length];
    
    const now = new Date();
    const winnerData = { name: winner, time: now.toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'}) };

    fetch('/save-winner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(winnerData)
    }).then(() => console.log("Победитель сохранен"));

    display.textContent = winner;
    overlay.style.display = 'flex';
    const li = document.createElement('li');
    li.textContent = `${winner} (${winnerData.time})`;
    winnersList.prepend(li);
}

function easeOut(t, b, c, d) { t /= d; return b + c * (t * t * t - 3 * t * t + 3 * t); }

spinBtn.addEventListener('click', () => {
    if (!names.length) return alert("Добавьте участников!");
    spinBtn.disabled = true;
    spinAngleStart = Math.random() * 10 + 40;
    spinTime = 0;
    spinTimeTotal = Math.random() * 3000 + 4000;
    rotateWheel();
});

closeBtn.addEventListener('click', () => { overlay.style.display = 'none'; spinBtn.disabled = false; });
input.addEventListener('input', drawRouletteWheel);

clearBtn.addEventListener('click', () => {
    if (confirm("Очистить историю?")) {
        fetch('/clear-history', { method: 'POST' })
        .then(() => { winnersList.innerHTML = ''; alert("Готово!"); });
    }
});

drawRouletteWheel();
loadHistory();