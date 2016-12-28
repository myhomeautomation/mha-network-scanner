# mha-network-scanner
Scan all network devices check for certain ones (chromecasts)

```js
const NetworkScanner = require('mha-network-scanner');

let scan = new NetworkScanner;

scan.find((devices)=>{
	console.log(devices);
});
```

## install
```
npm install myhomeautomation/mha-network-scanner --save
```
