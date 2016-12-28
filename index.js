const EventEmitter = require('events');
const axios = require('axios');
const shell = require('child_process').exec;

module.exports = class NetworkScanner extends EventEmitter {
	constructor(){
		super()

		this.fired = 0;
		this.devices = [];
		this.ignoreItems = [];

		this.on('devices_ready',this.cleanUpDevice);
	}
	find(cb){

		this.on('done',cb);

		shell(this.findStartingIP(),(err,ip,stderr)=>{
			shell(this.useNmapOnIPRange(ip.trim()),(err,devices)=>{
				this.emit('devices_ready',devices);
			})
		})

		return this;
	}
	ignore(array){
		if( !Array.isArray(array) ){
			array = [array];
		}
		this.ignoreItems = array;

		return this;
	}
	useIgnoreItems(thing){
		this.ignoreItems.forEach((replacee)=>{
			thing = thing.replace(replacee,'');
		})
		return thing.replace('(','').replace(')','');
	}
	findStartingIP(){
		return "ifconfig | grep 192 | cut -d ' ' -f 2 | cut -d '.' -f 1,2,3";
	}
	useNmapOnIPRange(ipRange){
		return "nmap -sP "+ipRange+".0/24 | grep report | cut -d ' ' -f 5,6";
	}
	checkIfDone(){
		this.fired += 1;
		if( this.devices.length == this.fired ){
			this.emit('done',this.devices);
		}
	}
	researchDevice(device,key){
		axios.get('http://'+device.ip+':8008/ssdp/device-desc.xml').then((response)=>{
			let friendlyName = response.data.split('<friendlyName>')[1].split('</friendlyName>')[0];
			this.devices[key].chromecast = true;
			this.devices[key].name = friendlyName;
			this.checkIfDone()
		}).catch(()=>{
			this.checkIfDone()
		})
	}
	cleanUpDevice(devices){
		this.devices = devices.split("\n");
		this.devices.forEach((device,key)=>{
			device = device.trim().split(' ');

			if( device[1] ){
				device = {
					name: this.useIgnoreItems(device[0]),
					ip: this.useIgnoreItems(device[1])
				}
			} else {
				device = {
					name: '?',
					ip: this.useIgnoreItems(device[0])
				}
			}

			device.chromecast = false;

			this.devices[key] = device;
			
			this.researchDevice(device,key);
		})
	}
}