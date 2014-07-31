var fs = require('fs')
var log = fs.readFileSync ('./logarc/access_log')
var regexLogLine = /^([0-9a-f.:]+) - - \[([0-9]{2}\/[a-z]{3}\/[0-9]{4}):([0-9]{2}:[0-9]{2}:[0-9]{2}[^\]]*)\] \"([^\"]+)\" [0-9]+ [0-9]+ (\"([^\"]+)\") (\"([^\"]+)\")/i;
var regexHttpRequest = /^(GET|POST) (.+) HTTP\/(1.[0-1])$/i;
var dtStart = new Date(0)
var lines = log.toString().split ('\n')
var objects = lines.map (function (e){
	var parts = regexLogLine.exec(e);
        if ( parts != null ) {
            var recDate = Date.parse(new Date(parts[2]+' '+parts[3]));

            // Determine the earliest datetime covered by log
            if (recDate < dtStart ) {
                dtStart = recDate;
            }

            // Process the HTTP request portion
            var httpRec = regexHttpRequest.exec(parts[4]);
            if ( httpRec != null ) {
                return {
		
                    ts: recDate,
                    client_ip: parts[1],
		            method: httpRec[1],
                    //http_version: httpRec[3],
                    path: httpRec[2],
		            referer: parts[6],
		            useragent: parts[8]
                }
            }
        } 
})

objects = objects.filter (function (e){ return (e ? true  : false) })
objects.forEach (function (o) {
    console.log (JSON.stringify (o) )
})
/*
web_log: 
              {
                ts:         'timestamp',
                host:       'string',
                domain:     'string',
                referer:    'string',
                decay:      'long',
                useragent:  'string', 
                language:   'string', 
                client_ip:  'string',
                whois_info: 'string'
              }
              */
