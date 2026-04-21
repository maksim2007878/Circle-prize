const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('.'));

const filePath = path.join(__dirname, 'history.json');

// Инициализация файла при старте
if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify([], null, 4));

// Сохранение победителя
app.post('/save-winner', (req, res) => {
    const winnerData = req.body;
    try {
        const history = JSON.parse(fs.readFileSync(filePath, 'utf-8') || "[]");
        history.push(winnerData);
        fs.writeFileSync(filePath, JSON.stringify(history, null, 4));
        console.log(`✅ Победитель записан в JSON: ${winnerData.name}`);
        res.json({ status: 'ok' });
    } catch (e) {
        res.status(500).json({ status: 'error' });
    }
});

// Очистка истории
app.post('/clear-history', (req, res) => {
    fs.writeFileSync(filePath, JSON.stringify([], null, 4));
    console.log("🧹 История очищена");
    res.json({ status: 'cleared' });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Сервер: http://localhost:${PORT}`));