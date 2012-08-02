/*

	NODE.JS Gopher Library
	Author: github/blamarche
	License: MIT

*/

exports.parseRequest = function(reqdata) {
    var fields = reqdata.split("\t");
    var path = fields[0];
    var query = fields.length > 1 ? fields[1] : "";
    
    return {
        "path": path ? exports.trim(path) : "",
        "query": query ? exports.trim(query) : "",
        "fields": fields,
        "hooked": false
    };
};

exports.menuLine = function(type, desc, path, domain, port) {
    return type+desc+"\t"+path+"\t"+domain+"\t"+port+"\r\n";
};

exports.trim = function(string) {
    return string.replace(/^\s*|\s*$/g, '').replace("\r","").replace("\n","");
};

