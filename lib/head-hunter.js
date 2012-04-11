
//This is the regex I am interested in
var watchThis = /^http?:\/\/mico.localhost:8080\/CorporateOverview/;

var http = require('http');
var url = require('url');
var tty = require('tty');

//We'll proxy on port 3128 - yeah, I use SQUID
var port = 3128;

//A function to show intstructions
var showInstructions = function() {
    process.stdout.write("HeadHunter is running on port "+port+"\n");
    process.stdout.write("Currently watching: "+ watchThis+"\n");
    process.stdout.write("Press CTRL-C to exit, 'c' to clear the screen.\n");
}

//Grab keyboard events - pretty much straight from the node manual
process.stdin.resume();
tty.setRawMode(true);
process.stdin.on('keypress', function(chr, key) {
    if (key && key.ctrl && key.name == 'c') { //So if it is ctrl-c we'll exit
        console.log("Gracefull exit");
        hunter.close();
        process.exit();
    } else if(key && !key.ctrl && key.name == 'c') { //if it is just the 'c' key pressed then we...
        console.log("Clear screen");
        process.stdout.write("\033[2J\033[H"); //..clear the screen and move to the home position (wow - memories of my 300baud modem coming back)
        showInstructions(); //and show the instructions again - blank screen looks...blank
    }
});

//Now we start head hunting
var hunter = http.createServer(function(req, res) {
    //Let's get our request options from the client's request
    var options = url.parse(req.url);
    delete options.host; //we don't want host, because we use hostname
    options.method = req.method; //make sure we get the right method
    delete options.pathname; //we don't want the pathname, just path will suffice
    options.headers = req.headers; //and we'll also duplicate the headers

    var isWatched = options.href.match(watchThis); //flag if this is something we want to watch

    if (isWatched) { //Let's see what is being requested
        console.log(">>>>>>>>>>");
        console.log("Options:");
        console.dir(options);
    }

    //Right, we need to proxy the request to where it is meant to go
    var proxy = http.request( options, function(siteResponse) {
        for (i in siteResponse.headers) { //we want to send the server response headers back to the client
            res.setHeader(i, siteResponse.headers[i]);
        }
        res.statusCode = siteResponse.statusCode; //also we want to send the status code back
        if (isWatched) { //Let's see what is being sent back
            console.log("Status: " + siteResponse.statusCode);
            console.log(siteResponse.headers);
        }
        siteResponse.on('data', function(chunk) {
            res.write(chunk); //pass any body data from the server back to the client
        });
        siteResponse.on('close', function() {
            if (isWatched) { //Watch it close - should be end, but close on error
                console.log("==SERVER CLOSE==");
            }
            res.end(); //End our response back to the client
        });
        siteResponse.on('end', function() {
            if (isWatched) { //Watch it end
                console.log("==SERVER END==");
            }
            res.end(); //End our response back to the client
        });
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
            isWatched && console.log("CLIENT END");
            isWatched && console.log("<<<<<<<<<<");
        }
        proxy.end(); //And end sending data to the server
    });
    req.on('close', function() {
        if (isWatched) {  //watch the request close 
            isWatched && console.log("CLIENT CLOSE");
            isWatched && console.log("<<<<<<<<<<");
        }
        proxy.end(); //end sending data to the server
    });
    
});
hunter.listen(port);
showInstructions();

