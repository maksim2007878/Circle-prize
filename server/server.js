const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
// Статика из корня проекта
app.use(express.static(path.join(__dirname, '..')));

const filePath = path.join(__dirname, 'history.json');
const ADMIN_PASSWORD = "1111"; 

// Сохранение победителя
app.post('/save-winner', (req, res) => {
    if (req.headers['x-auth-password'] !== ADMIN_PASSWORD) {
        console.log("Попытка записи: Неверный пароль");
        return res.status(401).json({ error: "Unauthorized" });
    }

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

// Получение истории
app.get('/get-history', (req, res) => {
    if (req.headers['x-auth-password'] !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.json([]);
    }
});

// Очистка истории
app.post('/clear-history', (req, res) => {
    if (req.headers['x-auth-password'] !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    fs.writeFileSync(filePath, JSON.stringify([], null, 4));
    console.log("🧹 История очищена");
    res.json({ status: 'cleared' });
});

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`Доступ для друзей: http://ip:${PORT}`);
});