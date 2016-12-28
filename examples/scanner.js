const NetworkScanner = require('..');

let scan = new NetworkScanner;

scan.find((devices)=>{
	console.log(devices);
});