#Head Hunter

##Summary
Hunt heads in web requests. Let's you proxy HTTP requests and watch headers for
requests matching your description

##Usage
Basic usage:

    $ head-hunter <url regex>
    
To watch everything:

    $ head-hunter ".*"
    
To watch all .pdf files on a site:

    $ head-hunter "^http://www.example.com/.*\.pdf"

To watch all .pdf files on your local development site:

    $ head-hunter "^http://localhost:8080/.*\.pdf"

##Requirements
You will need [node](http://nodejs.org/) and [npm](http://npmjs.org/).
The package is set for a minimum node requiremnt of 0.6.14 simply because that
is what is installed on my system when I wrote it. It may work with earlier
versions but I can't verify it.

##What is it?
This node based application acts as a local proxy running on your local system.
Simply configure it with a `regex` to watch and whenever a request is made to the
matching url the request and response headers will be dumped to the console.

##How do I use it?
Just start running the application with a regex for the requests you are
interested in. Be sure to set your system proxy to `localhost` on port `3128`.
From now on all web requests on your system will be pass through head hunter, and
any requests that match your regex will have both the request and response headers
displayed.

##Why did you make it?
I recently had a need to monitor the headers of certain web requests. Using the
standard browser based development tools to watch the headers wasn't an option
since the problem was occuring with the Adobe PDF Plugin and byte range requests.

There is probably something else out there but I wanted an excuse to write something
in node - plus by the time I finish researching and installing another solution
it would be done - damn I love being a web programmer!
 
##Limitations
Obviously it won't do SSL. The current incarnation has been written quite quickly
so I can simply get results, but I intend to improve this. Want to help? 

##Future ideas
- Monitored configuration file of interesting regex
- Storing request/headers to file, db or email
- Multiple configurations
- Transparent proxy: that way you could have all your internal users using it and
if there is one or two people with a problem that can't be replicated just simply
"flick a switch" to start monitoring