var request = require('request'),
    JSONStream = require('JSONStream'),
    moment  = require('moment'),
    stream = require('stream'),
    lineRef = null

var departuredataTransformer = new stream.Transform( { objectMode: true } )
departuredataTransformer._transform = function (departureData, encoding, done) {
    //console.log(lineRef)
    //if(lineRef === departureData.LineRef.toString()){
        this.push({
            'forventetAdgang': moment(departureData.ExpectedDepartureTime).format(),
            'linje': departureData.LineRef + " " + departureData.DestinationDisplay
        });
    //}        
    done()
}

var api = {
    'departures': 'http://reis.trafikanten.no/reisrest/realtime/getalldepartures/',
    'nearbyStops': 'http://api-test.trafikanten.no/Place/GetClosestStopsByCoordinates/?coordinates=(X=COORD_X,Y=COORD_Y)&proposals=PROPS'
}

function getDepartures(stopId, lineRef){
    var jsonstream = JSONStream.parse([/./])                                 
    var departureData = request({ url: api.departures + stopId })
                            .pipe(jsonstream)
                            .pipe(departuredataTransformer);    
    return departureData; 
}

function getStops(x, y, props){
    var jsonstream = JSONStream.parse([/./])                                 
    var stopsData = request({ url: 'http://api-test.trafikanten.no/Place/GetClosestStopsByCoordinates/?coordinates=(X=598273,Y=6645700)&proposals=10' })
                            .pipe(jsonstream)                  
    return stopsData; 
}


exports.getDepartures = getDepartures
exports.getStops = getStops