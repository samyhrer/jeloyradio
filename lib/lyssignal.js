//----------- Hue

var hue = require("node-hue-api"),
    HueApi = hue.HueApi,
    lightState = hue.lightState;

var host = "192.168.1.24",
    username = "newdeveloper",
    api = new HueApi(host, username),
    state;

var displayResult = function(result) {
    //console.log(JSON.stringify(result, null, 2));
};

function setWhite(number){
	LightState(number, 255, 255, 255);
}

function setGreen(number){
	LightState(number, 0, 255, 0);
}

function setYellow(number){
	LightState(number, 255, 255, 0);
}

function setRed(number){
  	LightState(number, 255, 0, 0);
}

function off(number){
	LightStateOff(number);
}

function offall(){
	LightStateOff(1);
  	LightStateOff(2);
  	LightStateOff(3);
}

function setBlink(number)
{
	setGreen(number)
	api.lightStatus(number, function(err, result)
	{
		if(result.state.on)
		{
			//console.log('SetBlink start ' + number);
			state = lightState.create().alert(true);
			// --------------------------
			// Using a promise
			api.setLightState(number, state)
			    .then(displayResult)
			    .done();

		    //console.log('SetBlink slutt ' + number);
		}
	});	
}

function LightStateOff(number)
{
	api.lightStatus(number, function(err, result)
	{
		if(result.state.on)
		{
			//console.log('LightState off start ' + number);
			state = lightState.create().off();
			// --------------------------
			// Using a promise
			api.setLightState(number, state)
			    .then(displayResult)
			    .done();

			// --------------------------
			//console.log('LightState off slutt ' + number);
		}
	});		
}

function LightState(number, r, g, b)
{
	// Set light state to 'on' with warm white value of 500 and brightness set to 100%
	state = lightState.create().on().rgb(r, g, b);

	//console.log('LightState start ' + number);

	// --------------------------
	// Using a promise
	api.setLightState(number, state)
	    .then(displayResult)
	    .done();

	// --------------------------

	//console.log('LightState slutt ' + number);
}

exports.setWhite = setWhite;
exports.setRed = setRed;
exports.setGreen = setGreen;
exports.setYellow = setYellow;
exports.setBlink = setBlink;
exports.off = off;
exports.offall = offall;