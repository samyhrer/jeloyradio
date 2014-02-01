var ruter = require('./lib/ruter'),
    lyssignal = require('./lib/lyssignal'),
    fs = require('fs'),
    moment = require('moment'),
    express = require('express');

var app = express();
app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser());


app.get('/', function(req, res){
    fs.readFile(__dirname + '/index.html', 'utf8', function(err, text) {    
        res.send(text);
    });
});


var lyspaerer = {
    1: {
        stoppId: "3010013",
        linjeId: "60"
    },
    2: {
        stoppId: null,
        linjeId: null
    },
    3: {
        stoppId: null,
        linjeId: null
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
    var id = req.params.id;
    var lyspaere = getLysPaere(id);
    var stoppId = req.body.stoppId;
    lyspaere.stoppId = stoppId;
    res.send("ok");
});

app.put('/api/lyspaerer/:id/linje', function(req, res){
    var id = req.params.id;
    var lyspaere = getLysPaere(id);
    var linjeId = req.body.linjeId;
    lyspaere.linjeId = linjeId;
    res.send("ok");
});


setInterval(function(){
    var configs = [getLysPaere(1), getLysPaere(2), getLysPaere(3)];
    for(var i=0;i<configs.length;i++){
        var config = configs[i];
        var stoppId = config.stoppId;
        var linjeId = config.linjeId;
        if(stoppId && linjeId){
            var alternatives = [];
            var stream = ruter.getDepartures(stoppId, linjeId);            
            stream.on('data', function(data){
                alternatives.push(data);                
            })
            stream.on('end', function(){
                var firstAlternative = alternatives[0];
                var now = moment(new Date());
                var then = moment(firstAlternative.forventetAdgang);
                var diffInMinutes = then.diff(now, 'minutes');
                var walkTime = 0;
                var spareMinutes = diffInMinutes - walkTime;
                console.log(spareMinutes)
                if(spareMinutes > 5){
                    lyssignal.setRed(i);
                }
                if(spareMinutes < 5){
                    lyssignal.setYellow(i);
                }
                if(spareMinutes < 2){
                    lyssignal.setGreen(i);
                }
                if(spareMinutes < 1){
                    lyssignal.setBlink(i);
                }
                /*

                for(var i=0; i < alternatives.length; i++){
                    var now = moment(new Date());
                    var then = moment(alternatives[i].forventetAdgang);
                    var alternative = alternatives[i];
                    console.log(then.diff(now, 'minutes'))
                }
                */
            })
        }
        else{
            //console.log("Ikke konfigurert for lyspære: " + i);
        }
    }

}, 10000)


app.listen(3000);

