const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
const HOST = "127.0.0.1", PORT = 4173;
const files = {"/":["index.html","text/html"],"/index.html":["index.html","text/html"],"/styles.css":["styles.css","text/css"],"/app.js":["app.js","text/javascript"]};
async function main(){
 const server=http.createServer((req,res)=>{const entry=files[new URL(req.url,`http://${HOST}:${PORT}`).pathname];if(!entry){res.writeHead(404);return res.end("Not found");}res.writeHead(200,{"Content-Type":entry[1]+"; charset=utf-8","X-Content-Type-Options":"nosniff"});fs.createReadStream(path.join(__dirname,entry[0])).pipe(res);});
 await new Promise(resolve=>server.listen(PORT,HOST,resolve));let browser;
 try{const test=process.argv.includes("--test");browser=await chromium.launch({headless:test});const page=await browser.newPage();await page.goto(`http://${HOST}:${PORT}`);if(test){await page.getByRole("button",{name:/run simulation/i}).click();await page.getByText(/simulation saved locally/i).waitFor({timeout:5000});console.log("PASS: local dashboard simulation.");}else{console.log(`Dashboard: http://${HOST}:${PORT}`);await new Promise(resolve=>browser.on("disconnected",resolve));}}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}}
main().catch(e=>{console.error(e);process.exitCode=1;});