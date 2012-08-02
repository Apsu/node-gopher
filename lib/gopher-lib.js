/*

	NODE.JS Gopher Library
	Author: github/blamarche
	License: MIT

*/

var net = require('net');
var utils = require('./gopher-utils.js');

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
        
        c.setEncoding('utf8');
        
        c.on('end', function() {
            if (options.close)
                options.close(c);
        });
        
        c.on('data', function(data) {
            if (options.data)
                options.data(c, data);
                
            if (options.request) {
                var req = utils.parseRequest(data);
                if (req)
                    options.request({ 
                                        "send": function(toSend) {
                                            if (toSend.pipe)
                                                toSend.pipe(c);
                                            else
                                                c.end(toSend);
                                        },
                                        "rawClient": c 
                                    },
                                    req
                                );
            }
        });
    });
    
	rawserver.listen(options.port);
	
	var server = {
	    "rawServer": rawserver,
	    "options": options,
	    "close": function() {
	        rawserver.close();
	    },
	    "menuLine": function(type, desc, path) {
	        return utils.menuLine(type, desc, path, options.domain, options.port);
	    },
	};
	
	return server;	
};



