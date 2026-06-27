const { createServer } = require('node:http');

const hostname = '0.0.0.0';
const port = 3000;

const server = createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello');
});

server.listen(port, hostname, () => {
    console.log(`Server running @ https://${hostname}:${port}/`);
});

process.on('SIGINT', () => {
    console.log("Shutting down");
    process.exit(0);
})