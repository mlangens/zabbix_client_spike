var http = require('http');
var authBody = {
	"jsonrpc": "2.0",
	"id": 1,
	"auth": "",
	"method": "user.login",
	"params": {
		"user": "",
		"password": ""
	}
}

var authBodyJSON = JSON.stringify(authBody);

var request = http.request({
	method: 'POST',
	hostname: 'example_url',
	timeout: 5000,
	path: 	'/api_jsonrpc.php',
	headers: {
		"Accept": "application/json",
		"Content-Type" : "application/json"
	},
	params: authBody
}, function(response) {
	var buffer = "";
	response.on('data', (chunk) => {
		buffer = buffer.concat(chunk);
	});
	response.on('end', (chunk) => {
		if(typeof chunk === "string") {
			buffer = buffer.concat(chunk);
		}
		requestHostgroupGetObjects(buffer);
	});
});

request.write(authBodyJSON);
request.end();

function requestHostgroupGetObjects (stuff) {
	var session = new Session(stuff);
	session.rpcRequest('hostgroup.getobjects', {}).then((response)=>{
		console.log(response);
	});
}

class Session {
	constructor(userLoginResponseJSON){
		var parsed = JSON.parse(userLoginResponseJSON);
		this.token = parsed.result;
		this.sequence = parsed.id;
	}

	rpcRequest(method, params) {
		return new Promise((resolve, reject) => {
			var payload = {
				"jsonrpc": "2.0",
				"id": ++this.sequence,
				"auth": this.token,
				"method": method,
				"params": params
			}

			var payloadJSON = JSON.stringify(payload);
			var request = http.request({
				method: 'POST',
				hostname: '',
				timeout: 5000,
				path: 	'/api_jsonrpc.php',
				headers: {
					"Accept": "application/json",
					"Content-Type" : "application/json"
				},
				params: payload
			}, function(response) {
				var buffer = "";
				response.on('data', (chunk) => {
					buffer = buffer.concat(chunk);
				});
				response.on('end', (chunk) => {
					if(typeof chunk === "string") {
						buffer = buffer.concat(chunk);
					}
					resolve(buffer);
				});
				response.on('error', (err) => {
					reject(err);
				});
			});
			request.write(payloadJSON);
			request.end();
		});
	}
}
