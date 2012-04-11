#Head Hunter
##Hunt heads in web requests. Let's you proxy HTTP requests and watch headers for requests matching your description

##What
This node based application acts as a local proxy running on your own system.
Simply configure it with a `regex` to watch and whenever a request is made to the
matching url the request and response headers will be dumped to the console.

##How
Just start running the application. Be sure to set your system proxy to `localhost` on port `3128`.
From now on all web requests on your system will be pass through head hunter.

##Limitations
Obviously it won't do SSL. The current incarnation has been written quite quickly
so I can simply get results, but I intend to improve this. Want to help? 

##Why?
I recently had a need to monitor the headers for certain web requests. Using the
standard browser based development tools to watch the headers wasn't an option
since the problem was occuring with the Adobe PDF Plugin and byte range requests.

There is probably something else out there but I wanted an excuse to write something
in node - plus by the time I finish researching, installing another solution it would be done
 - damn I love being a programmer!