
var http = require('http');
var url = require('url');
var tty = require('tty');

require('./ext');

//Default proxy port on port 3128 - yeah, I use SQUID
var default_port = 3128;

//By Default we match everything - but might not be so good if you have an active system!
var default_url_regex = ".*";

var tribe = [];

this.HeadHunter = function(url_regex, port) {
    var aPort = port || default_port;
    var aUrlRegex = url_regex || default_url_regex;
    this.port = parseInt(aPort);
    //this.watchThis = new RegExp(url_regex.replace(/[-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"));
    this.urlString = aUrlRegex;
    this.watchThis = new RegExp(this.urlString);
    this.server = null;
    tribe.push(this);
}

this.HeadHunter.prototype = new(function() {

    //A function to show intstructions
    this.showInstructions = function() {
        process.stdout.write(("HeadHunter is running on port "+this.port.toString().underline+"\n"));
        process.stdout.write("Currently watching: "+ this.urlString.underline+"\n");
        process.stdout.write("Press CTRL-C to exit, 'c' to clear the screen.\n");
    };

    //When the hunter is closed it needs to close the server connection
    this.close = function() {
        if (this.server != null) {
            this.server.close();
        }
    };
    
    this.initialize = function() {
        var that = this;
        
        this.server = http.createServer(function(req, res) {

            //Let's get our request options from the client's request
            var options = url.parse(req.url);
            delete options.host; //we don't want host, because we use hostname
            options.method = req.method; //make sure we get the right method
            delete options.pathname; //we don't want the pathname, just path will suffice
        
            var isWatched = options.href.match(that.watchThis); //flag if this is something we want to watch
                
            if (isWatched) { //Let's see what is being requested
                console.log(">> REQUEST");
                console.log((">> "+"Options".underline));
                for (option in  options) {
                    var value = options[option];
                    console.log((">> "+option+": "+value));
                }
                console.log((">> "+"Headers".underline));
                for (header in  req.headers) {
                    var value = req.headers[header];
                    console.log((">> "+header+": "+value));
                }
            }

            //We want the headers as well, but we add them after our watch dump to make it easier
            options.headers = req.headers;
        
            //Right, we need to proxy the request to where it is meant to go
            var proxy = http.request( options, function(siteResponse) {
                for (i in siteResponse.headers) { //we want to send the server response headers back to the client
                    res.setHeader(i, siteResponse.headers[i]);
                }
                res.statusCode = siteResponse.statusCode; //also we want to send the status code back
                if (isWatched) { //Let's see what is being sent back
                    console.log("<< Status: " + siteResponse.statusCode);
                    console.log(("<< "+"Headers".underline));
                    for (header in  siteResponse.headers) {
                        var value = siteResponse.headers[header];
                        console.log(("<< "+header+": "+value));
                    }
                }
                siteResponse.on('data', function(chunk) {
                    res.write(chunk); //pass any body data from the server back to the client
                });
                siteResponse.on('close', function() {
                    if (isWatched) { //Watch it close - should be end, but close on error
                        console.log("<< RESPONSE CLOSE\n::");
                    }
                    res.end(); //End our response back to the client
                });
                siteResponse.on('end', function() {
                    if (isWatched) { //Watch it end
                        console.log("<< RESPONSE END\n::");
                    }
                    res.end(); //End our response back to the client
                });
            });
            proxy.on('error', function(e) {
                console.error(e);
                console.log("::");
                res.end();
            });
            proxy.on('clientError', function(e) {
                console.error(e); //If our proxy client has an error we show it and 
                res.end(); //end our response back to the client
            });
            
            req.on('error', function(e) {
               console.error(e); //If the request has an error,
               proxy.end(); //we end our proxy connection to the server
               res.end(); //and end our response back to the client
            });
            req.on('data', function(chunk) {
                proxy.write(chunk); //anything the client send in the body we want to proxy on to where it is meant to go
            });
            req.on('end', function() {
                if (isWatched) { //watch the request end
                    isWatched && console.log(">> REQUEST END\n==\n<< RESPONSE");
                }
                proxy.end(); //And end sending data to the server
            });
            req.on('close', function() {
                if (isWatched) {  //watch the request close 
                    isWatched && console.log(">> REQUEST CLOSE\n==\n<< RESPONSE");
                }
                proxy.end(); //end sending data to the server
            });
            
        }).listen(this.port);
        this.showInstructions();
        this.listenToKeys();
    };

    this.listenToKeys = function() {
        var that = this;
        //Grab keyboard events - pretty much straight from the node manual
        process.stdin.resume();
        tty.setRawMode(true);
        process.stdin.on('keypress', function(chr, key) {
            if (key && key.ctrl && key.name == 'c') { //So if it is ctrl-c we'll exit
                console.log("Gracefull exit");
                tribe.forEach(function(hunter) {
                   hunter.close(); 
                });
                process.exit();
            } else if(key && !key.ctrl && key.name == 'c') { //if it is just the 'c' key pressed then we...
                console.log("Clear screen");
                process.stdout.write("\033[2J\033[H"); //..clear the screen and move to the home position (wow - memories of my 300baud modem coming back)
                that.showInstructions(); //and show the instructions again - blank screen looks...blank
            }
        });
    };    
});
