/*

	NODE.JS Gopher Library
	Author: github/blamarche
	License: MIT


   0   Item is a file
   1   Item is a directory
   2   Item is a CSO phone-book server
   3   Error
   4   Item is a BinHexed Macintosh file.
   5   Item is DOS binary archive of some sort.
   6   Item is a UNIX uuencoded file.
   7   Item is an Index-Search server.
   8   Item points to a text-based telnet session.
   9   Item is a binary file!
   +   Item is a redundant server
   T   Item points to a text-based tn3270 session.
   g   Item is a GIF format graphics file.
   I   Item is some kind of image file.  Client decides how to display.

*/

var net = require('net');
var utils = require('./gopher-utils.js');
exports.utils = utils;

/*
Creates and returns a listen server object.
    Parameters: 
        options
        {
            "port": <*port number>
            "domain": <*domain>
            "request": <request event handler> //Really the only one you need
            "connect": <connection event handler>
            "close": <disconnect event handler>
            "data": <raw data event handler>
        }
*/
exports.createServer = function(options) {
	
	options.port = options.port ? options.port : 70;
	options.domain = options.domain ? options.domain : 'localhost';
	
	var rawserver = net.createServer(function(c) { //'connection' listener
        if (options.connect)
            options.connect(c);
        
        c.on('end', function() {
            if (options.close)
                options.close(c);
        });
        
        c.on('data', function(data) {
            data = data.toString('utf8');
            
            if (options.data)
                options.data(c, data);
                            
            var req = utils.parseRequest(data);
            if (req)
            {
                //build wrapped client
                function sendResponse(toSend) {
                    if (toSend.pipe)
                        toSend.pipe(c);
                    else
                        c.end(toSend);
                }
            
                var client = { 
                    "send": sendResponse,
                    "_rawClient": c 
                };
                                
                //look for hooks
                if (rawserver.gopher)
                {
                    var cb = rawserver.gopher.hooks[req.path];
                    if (cb)
                    {
                        req.hooked = true;
                        cb(client, req);
                    }
                }
                
                //call request handler                
                if (options.request) 
                    options.request(client, req);
            }
        });
    });
    
	rawserver.listen(options.port);
	
	var server = {
	    "_rawServer": rawserver,
	    "hooks": {},
	    "options": options,
	    "close": function() {
	        rawserver.close();
	    },
	    "menuLine": function(type, desc, path) {
	        return utils.menuLine(type, desc, path, options.domain, options.port);
	    },
	    "hook": function(path, callback) {
	        if (typeof path == "string" && typeof callback == "function")
	            this.hooks[path] = callback;
	        else 
	            console.log("INVALID HOOK: "+(typeof path)+", "+(typeof callback));
	    }
	};
	
	server._rawServer.gopher = server;
	
	return server;	
};



