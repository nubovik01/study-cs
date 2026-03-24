// Выводит список всех юзернеймов из сообщений. Необходимо экспортировать историю 
// чата в Telegram в формате JSON и скормить скрипту полученный файл result.json.

const fs = require("fs");
const json = require("./result.json"); // название файла

const messages = json.messages;

const users_usernames = new Set();

for (const message of messages) {
  const entities = message.text_entities;
  if (!entities) continue;

  for (const entity of entities) {
    if (entity.type != "mention") continue;
    users_usernames.add(entity.text);
  };
};

// Массив юзернеймов сохранится в файл usernames.json
fs.writeFileSync("usernames.json", JSON.stringify([...users_usernames], null, 2), "utf8");

// OUTPUT: [ '@crow', '@kirby', '@teez2157', '@song', ...]
