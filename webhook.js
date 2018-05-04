var http = require('http')

http.createServer(function(req, res) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	run_cmd('sh', ['./auto_build.sh'],
	function(text) {
		console.log('script end:')
		console.log(text)
	});

	res.end('Hello World\n');

}).listen(7777)

function run_cmd(cmd, args, callback) {
	var spawn = require('child_process').spawn;
	var child = spawn(cmd, args);
	var resp = "";
	child.stdout.on('data',
	function(buffer) {
		resp += buffer.toString();
	});
	child.stdout.on('end',
	function() {
		callback(resp)
	});
}