install:
	npm install
	npm install --prefix client
	npm install --prefix server

dev:
	npm run dev

client:
	npm run client

server:
	npm run server

build:
	npm run build

start:
	npm run start

clean:
	rm -rf node_modules
	rm -rf client/node_modules
	rm -rf server/node_modules
	rm -rf client/dist
	rm -rf coverage

re: clean install

.PHONY: install dev client server build start clean re