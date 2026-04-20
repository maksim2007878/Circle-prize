const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('.'));

const filePath = path.join(__dirname, 'history.json');

// Сохранение
app.post('/save-winner', (req, res) => {
    const winnerData = req.body;
    const filePath = path.join(__dirname, 'history.json');

    // 1. Сначала читаем, что уже есть в файле
    let history = [];
    if (fs.existsSync(filePath)) {
        try {
            const fileData = fs.readFileSync(filePath, 'utf-8');
            history = JSON.parse(fileData || "[]");
        } catch (e) {
            console.error("Ошибка парсинга JSON, сбрасываем историю");
            history = [];
        }
    }

    // 2. Добавляем нового победителя
    history.push(winnerData);

    // 3. Записываем обратно (с обработкой ошибок)
    try {
        fs.writeFileSync(filePath, JSON.stringify(history, null, 4), 'utf-8');
        console.log(`✅ Успешно записано в history.json: ${winnerData.name}`);
        res.json({ status: 'ok' });
    } catch (err) {
        console.error("❌ Ошибка при записи файла:", err);
        res.status(500).json({ status: 'error' });
    }
});