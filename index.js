var http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs');

var mimeTypes = {
    "html": "text/html",
    "js": "text/javascript",
    "css": "text/css",
    "json": "application/json"
};

http.createServer(function (req, res) {
    var uri = decodeURI(url.parse(req.url).pathname);
    if (path.normalize(uri) !== uri) {
        res.writeHead(403, "Forbidden", { 'Content-Type': 'text/plain' });
        res.end();
        return;
    }
    if (uri === "/reports/ProtectedDemo.json" && req.headers["x-auth-token"] !== "*YOUR TOKEN*") {        
        console.log("No custom header provided");
        res.writeHead(403, "Forbidden", { 'Content-Type': 'text/plain' });
        res.end();
        return;
    }

    var filename = path.join(process.cwd(), uri);   
    try {
        if (fs.statSync(filename).isDirectory()) filename += '/index.html';

        fs.exists(filename, function (exists) {
            if (!exists) {
                console.log("not exists: " + filename);
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.write('404 Not Found\n');
                res.end();
                return;
            }

            var mimeType = mimeTypes[path.extname(filename).split(".")[1]];
            if (mimeType) res.writeHead(200, { 'Content-Type': mimeType });

            var fileStream = fs.createReadStream(filename);
            fileStream.pipe(res);

        });
    }
    catch (e) {
        return;
    }
}).listen(8889);


console.log("Static file server running at http://localhost:" + 8889 + "/\nCTRL + C to shutdown");