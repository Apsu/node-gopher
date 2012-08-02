var gopher = require('../');
var fs = require('fs');



var server = gopher.createServer({
    "port": 70,
    "domain": "localhost",
    "connect": onConnect,
    "close": onClose,
    "data": onData,
    "request": onRequest
});

function onConnect(client) {
    console.log("CONNECT: "+client);;
}

function onClose(client) {
    console.log("CLOSE: "+client);
}   

function onData(client, data) {
    console.log("DATA: "+data);
}

function onRequest(client, request) {
    try {
        console.log("REQ: "+request.path);
        
        if (request.path!="")
        {
            switch (request.path)
            {
                case "/Search":
                    client.send(
                        server.menuLine("i", "Search results for "+request.query+":", "") +
                        server.menuLine("7", "Search Again", "/Search") +
                        server.menuLine("0", "Some result", "/Textdoc")
                        );
                    break;
                
                case "/Textdoc":
                    client.send(fs.createReadStream("./package.json", { "encoding": 'utf8' }));
                    break;
                    
                default:
                    client.send(server.menuLine("3", "ERROR - Not Found: "+request.path, ""));
                    break;
            }
        }
        else
        {
            client.send(
                server.menuLine("i", "Default Menu", "") +
                server.menuLine("7", "Search", "/Search") +
                server.menuLine("0", "Textdoc", "/Textdoc")
                );
        }
    }
    catch (err) {
        client.send(server.menuLine("3", "ERROR - Internal", ""));
    }
}

