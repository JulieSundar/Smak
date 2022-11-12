// silly chrome wants SSL to do screensharing
	var fs = require('fs'),
    express = require('express'),
    https = require('https'),
    http = require('http');
	


var privateKey = fs.readFileSync('fakekeys/privatekey.pem').toString(),
    certificate = fs.readFileSync('fakekeys/certificate.pem').toString();


var app = express();

app.use(express.static(__dirname));

https.createServer({key: privateKey, cert: certificate}, app).listen(443);
http.createServer(app).listen(8000);

console.log('running on https://localhost:443 and http://localhost:8000');
