var ruter = require('./lib/ruter'),
    fs = require('fs'),
    express = require('express');

var app = express();
app.use(express.static(__dirname + '/public'));


app.get('/', function(req, res){
    fs.readFile(__dirname + '/index.html', 'utf8', function(err, text) {    
        res.send(text);
    });
});


var lyspaerer = {
    1: {
        stopp: null,
        linje: null
    },
    2: {
        stopp: null,
        linje: null
    },
    3: {
        stopp: null,
        linje: null
    }
}


function getLysPaere(id){
    return lyspaerer[id];
}

app.get('/api/stoppesteder', function(req, res){    
    getStoppesteder(res)
});

function getStoppesteder(res){
    var stoppesteder = [];
    var stream = ruter.getStops('598263', '6645750', '5');
    stream.on('data', function(stoppested) {  
        stoppesteder.push(stoppested);
    });
    stream.on('end', function() {  
        res.send(stoppesteder)
    });
}

app.get('/api/lyspaerer/:id', function(req, res){
    res.send(getLysPaere(req.params.id))    
});

app.put('/api/lyspaerer/:id/stopp', function(req, res){
    
});

app.put('/api/lyspaerer/:id/linje', function(req, res){
    
});

app.listen(3000);

