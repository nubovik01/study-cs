const https = require("https");
const fs = require("fs");
const path = require("path");

let numberOfPhoto = 0, countOfImagesOnTheServer = 150;

const agent = new https.Agent({ rejectUnauthorized: false });

fs.mkdirSync(path.resolve(__dirname, "downloaded-content"), { recursive: true });

function downloadImage(number) {
  https.get("https://*****.live/img/" + number, { agent }, response => {
    if (response.statusCode < 200 || response.statusCode >= 300) {
      console.error("maybe file [n=%s] is not found? http code: %s", number, response.statusCode);
      response.resume();
      return;
    };

    response.pipe(fs.createWriteStream(path.resolve(__dirname, "downloaded-content", number + ".jpg")));
  }).on("error", () => {
    console.error("maybe this resource does not exists?");
  });
};

// loop this N times until all photos are downloaded
while (++numberOfPhoto <= countOfImagesOnTheServer) {
  downloadImage(numberOfPhoto);
};