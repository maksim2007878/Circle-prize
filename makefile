# Переменные
PORT = 3000
URL = http://localhost:$(PORT)

# Запуск сервера через npx serve (не требует глобальной установки)
run:
	@echo "🚀 Запуск сервера serve на $(URL)"
	@npx serve . -l $(PORT)

# Открытие браузера по умолчанию (универсально для всех ОС)
open:
	@echo "🌐 Открываю браузер..."
	@if command -v cmd.exe > /dev/null; then cmd.exe /c start $(URL); \
	elif [ "$$(uname)" = "Darwin" ]; then open $(URL); \
	elif command -v xdg-open > /dev/null; then xdg-open $(URL); \
	else echo "Не удалось найти команду для открытия браузера"; fi

# Запустить сервер и открыть браузер одновременно
start:
	@make -j 2 run open

# Справка
help:
	@echo "Команды:"
	@echo "  make start - запустить всё сразу (нужен Node.js)"
	@echo "  make run   - только запустить сервер"
