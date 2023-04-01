const http = require('http')
const fs   = require('fs')
const port = 8080

str = ""
for ( k of process.argv.slice(2) )
str += k.replace(/\u005c/g,"/") + "\n"

str = str.slice(0,-1) // supprimer le saut de ligne à la fin

http.createServer( async function (req, res) {
	
	res.writeHead(200,{'content-type':'text/html;charset=utf8'})

	if( req.url == '/'){

		res.end(`
		<style>
		#editor {
		  position: absolute;
		  top: 0;
		  right: 0;
		  bottom: 0;
		  left: 0;
		  font-family: monospace;
		}
		</style>
		<div id="editor"></div>
		<script src="https://ace.c9.io/build/src-min-noconflict/ace.js"></script>
		<script>
		var editor = ace.edit("editor");
		editor.setValue(\`${str}\`);
		// editor.setTheme("ace/theme/nord_dark");
		// editor.getSession().setMode("ace/mode/javascript");
		editor.getSession().setUseWorker(false);
		editor.setShowPrintMargin(false);

		editor.setOptions({
		  fontSize: "20px"
		});
		document.onkeydown = function(e) {

			if ( e.ctrlKey && e.key == "s" ){

				e.preventDefault()

				send(editor.getSession().getValue())
			}
		}
		function send(x){
		var xhr = new XMLHttpRequest()
		xhr.open("POST", "data")
		xhr.setRequestHeader("content-type","application/x-www-form-urlencoded;charset=utf8")
		xhr.send( JSON.stringify( { "data": encodeURI(x) } ) )
		}
		</script>
		`)

	}else if (req.url == '/data'){

		if( req.method == "POST" ){

			try{

			body = JSON.parse( await bodyParser(req) )

			str = decodeURI(body.data)

			console.log( str.split("\n").length )
			console.log( str )

			}catch(e){}
		}
	}
  
}).listen(port)

console.log(`Running at port ${port}`)

function bodyParser (req) { 

	return new Promise( resolve => {

		body = ''
		req.on( 'data', data => body += data)
		req.on( 'end', () => {resolve(body)} )

	})

}
