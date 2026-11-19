const fs = require("fs");
const crypto = require("crypto");

const maxDuplicates = 50; // consecutive duplicates before stopping
const delay = 250; // pause between requests, in milliseconds

const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const getHash = buffer => crypto.createHash("sha256").update(buffer).digest("hex");

async function main() {
  fs.mkdirSync("images", { recursive: true });

  const seen = new Set(fs.readdirSync("images").map(file => file.split(".")[0]));
  let duplicates = 0;

  while (duplicates < maxDuplicates) {
    try {
      const response = await fetch("https://api.floyzi.ru/random_pic", { cache: "no-store" });
      const buffer = Buffer.from(await response.arrayBuffer());
      const hash = getHash(buffer);

      if (!response.ok || seen.has(hash)) {
        duplicates++;
        console.log("Duplicate #", duplicates);
        continue;
      };

      duplicates = 0;
      seen.add(hash);
      const extension = (response.headers.get("content-type") || "").split("/")[1]?.split(";")[0] || "bin";
      fs.writeFileSync(`images/${hash}.${extension}`, buffer);
      console.log("New image! #", seen.size);
    } catch (error) {
      console.log("error", error.message);
    } finally {
      await sleep(delay);
    };
  };
};

main();