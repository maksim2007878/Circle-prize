const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());

// Настройка статики: теперь корень проекта на уровень выше папки server
app.use(express.static(path.join(__dirname, '..')));

const filePath = path.join(__dirname, 'history.json');

// Сохранение
app.post('/save-winner', (req, res) => {
    const winnerData = req.body;
    let history = [];
    if (fs.existsSync(filePath)) {
        try {
            history = JSON.parse(fs.readFileSync(filePath, 'utf-8') || "[]");
        } catch (e) { history = []; }
    }
    history.push(winnerData);
    fs.writeFileSync(filePath, JSON.stringify(history, null, 4));
    console.log(`Победитель записан: ${winnerData.name}`);
    res.json({ status: 'ok' });
});

// Получение истории для фронтенда
app.get('/get-history', (req, res) => {
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.json([]);
    }
});

// Очистка
app.post('/clear-history', (req, res) => {
    fs.writeFileSync(filePath, JSON.stringify([], null, 4));
    res.json({ status: 'cleared' });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Сервер запущен из папки server на http://localhost:${PORT}`));