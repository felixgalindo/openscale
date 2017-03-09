const config = {
	serialPort: {
		path: "/dev/ttyUSB0",
		baudRate: 9600
	}
};
var OpenScale = require("../index.js");
var openscale = new OpenScale(config);

//Handle openscale data event
openscale.on("data", function(data) {
	console.log(data);
});

while(1){
	
}