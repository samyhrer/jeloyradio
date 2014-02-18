var ruter = require('./lib/ruter'),
    lyssignal = require('./lib/lyssignal'),
    fs = require('fs'),
    moment = require('moment'),
    SSE = require('express-sse'),    
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
        id: '1',
        //stoppId: '3010425',
        //linjeId: '20',
        stoppId: null,
        linjeId: null,
        level: null,
        minutesUntilExpectedDeparture: '0'
    },
    2: {
        id: '2',
        stoppId: null,
        linjeId: null,
        level: null,
        minutesUntilExpectedDeparture: '0'
    },
    3: {
        id: '3',
        stoppId: null,
        linjeId: null,
        level: null,
        minutesUntilExpectedDeparture: '0'
    }
}


function getLysPaere(id){
    return lyspaerer[id];
}

function setMinutesRemaining(id, minutes){
    lyspaerer[id].minutesUntilExpectedDeparture = minutes;
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

sse = new SSE()
app.get('/api/lyspaerer/updates', sse.init);

app.get('/api/lyspaerer/:id', function(req, res){
    res.send(getLysPaere(req.params.id))    
});

app.put('/api/lyspaerer/:id', function(req, res){
    var id = req.params.id;
    var lyspaere = getLysPaere(id);
    var stoppId = req.body.stoppId;
    var linjeId = req.body.linjeId;
    lyspaere.stoppId = stoppId + "";
    lyspaere.linjeId = linjeId + "";
    lyssignal.setBlink(id);
    ticktack();
    res.send("ok");
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




lyssignal.setWhite(1);
lyssignal.setWhite(2);
lyssignal.setWhite(3);

setInterval(ticktack, 15000);

function ticktack(){
    var configs = [getLysPaere(1), getLysPaere(2), getLysPaere(3)];    
    for(var i=0; i < configs.length;i++){
        var lyspaere = configs[i];
        var stoppId = lyspaere.stoppId;
        var linjeId = lyspaere.linjeId;
        if(stoppId && linjeId){            
            updateLyspaereState(lyspaere);
        }
        else{
            //console.log("Ikke konfigurert for lyspære: " + i);
        }
    }
}

function updateLyspaereState(lyspaere){   
    //console.log(lyspaere)
    var alternatives = [];
    var stream = ruter.getDepartures(lyspaere.stoppId, lyspaere.linjeId);            
    stream.on('data', function(data){
        alternatives.push(data);                
    })
    stream.on('end', function(){
        if(alternatives.length > 0){
            var firstAlternative = alternatives[0];
            var now = moment(new Date());
            var then = moment(firstAlternative.forventetAvgang);
            var diffInMinutes = then.diff(now, 'minutes');         

            setMinutesRemaining(lyspaere.id, diffInMinutes);                
            var walkTime = 0;
            var spareMinutes = diffInMinutes - walkTime;                  
     
            var level = '';
            if(spareMinutes >= 5){
                var level = 'nogo';
                lyssignal.setRed(lyspaere.id);
            }
            if(spareMinutes < 5){
                var level = 'ready';
                lyssignal.setYellow(lyspaere.id);
            }

            if(spareMinutes === 2){
                var level = 'go';
                lyssignal.setGreen(lyspaere.id);
            }
            if(spareMinutes === 1){
                var level = 'gogogo';
                lyssignal.setBlink(lyspaere.id);
            }
            if(spareMinutes === 0){
                var level = 'nogo';
                lyssignal.setRed(lyspaere.id);
            }
            lyspaere.level = level;
            sse.send(lyspaere);  
            console.log("forventet avgang: " + firstAlternative.linje + " : " + diffInMinutes);
            console.log("---------------------------")
       
        }
    })
}

app.listen(3000);

