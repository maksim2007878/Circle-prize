PORT = 3000
URL = http://localhost:$(PORT)

# Запуск сервера (оставляем в текущем окне)
run:
	@echo "🚀 Запуск сервера..."
	@node server.js

# Отдельная команда для открытия (используем xdg-open для Linux)
open:
	@echo "🌐 Открываю $(URL)..."
	@xdg-open $(URL) || firefox $(URL)

# Комбо-команда (запуск в фоне и открытие)
start:
	@node server.js & sleep 2 && xdg-open $(URL)