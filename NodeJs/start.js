const http = require("http");
const fs = require("fs");
const path=require('path');

console.log(path.extname('index.js'))  //it will give extension name
console.log(__dirname)

const percent = require("./features");
http
  .createServer((req, res) => {
    if (req.url === "/about") {
      res.end(`<h1>${percent()}</h1>`);
    } else if (req.url === "/") {
      fs.readFile('./index.html', (err, data)=>{
        res.end(data);
      })
     
    } else res.end("<h1>Invalid URL</h1>");
  })
  .listen(5000, () => {
    console.log("Server is listenng");
  });
