//----------- Hue

var hue = require("node-hue-api"),
    HueApi = hue.HueApi,
    lightState = hue.lightState;

var host = "192.168.1.24",
    username = "newdeveloper",
    api = new HueApi(host, username),
    lyssignal = require("./lib/lyssignal"),
    fs = require('fs'),
    state;


//----------- Express

var express = require('express');
var app = express();
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
    fs.readFile(__dirname + '/test.html', 'utf8', function(err, text) {    
        res.send(text);
    });
});

app.get('/green', function(req, res){
  
  	console.log('green start');
  	lyssignal.setGreen(req.query.n);
	res.send('Ok');
	console.log('green slutt');
});

app.get('/yellow', function(req, res){
  
  	console.log('yellow start');
  	lyssignal.setYellow(req.query.n);
	res.send('Yellow Ok');
	console.log('yellow slutt');
});

app.get('/red', function(req, res){
  
  	console.log('red start');
  	lyssignal.setRed(req.query.n);
	res.send('Red Ok');
	console.log('red slutt');
});

app.get('/off', function(req, res){
  	console.log('off start');
	lyssignal.off(req.query.n);
	res.send('Ok');
	console.log('off slutt');
});

app.get('/blink', function(req, res){
  	console.log('blink start');
	lyssignal.setBlink(req.query.n);
	res.send('Ok');
	console.log('blink slutt');
});

app.get('/offall', function(req, res){
  	console.log('off all start');
	lyssignal.offall();
	res.send('Ok');
	console.log('off all slutt');
});

app.listen(3000);