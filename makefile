PORT = 5000
URL = http://localhost:$(PORT)

run:
	@echo "Запуск сервера..."
	@node server/server.js

open:
	@sleep 1 && (xdg-open $(URL) || open $(URL) || cmd.exe /c start $(URL))

start:
	@make -j 2 run open