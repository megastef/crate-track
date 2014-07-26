var tracker = require('./pixel-tracker.js')
var crate = require ('node-crate')
// whois mit eigenenm parser
var whois = require ('./whois.js')
var NEW_IPS_SQL = "SELECT distinct client_ip FROM web_log WHERE whois_info is null OR whois_info = 'undefined' limit 10000"; 

var schema = {
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
            }

crate.create (schema).success (console.log);

function logToCrate (e)
{
    crate.insert ('web_log', 
        { ts: new Date(), 
          useragent: e.useragent.browser, 
          language: e.language[0], 
          client_ip: e.geo.ip,
          referer: e.referer,
          host: e.host,
          domain: e.domain
        })
        .success(console.log)
        .error (console.log)
}
// handling Web Requests get tracker values
tracker
  .use(function (error, result) {
      logToCrate (result)
  })
  .configure({ disable_cookies : true })




var lastRun = new Date (0);

function updateWhois ()
{
    currentRun = lastRun
    lastRun = new Date()

    crate.execute (NEW_IPS_SQL, [currentRun]).success (function (res){
        console.log (res)
        if (res && res.json && res.json.length > 0)
        {
            // doing lookup for all unique IP's in the logfile
            res.json.forEach (function (e){
                whois.lookup (e.client_ip, function (whoisInfo) {
                    crate.update ('web_log', 
                      {  whois_info: whoisInfo.description }, 
                        "client_ip = '$IP' AND whois_info is null".replace ("$IP", e.client_ip ))
                      .error (console.log)
                      .success (console.log)
                })
            })
        }
    })
}
// lookup IP's frequently
setInterval (updateWhois, 10000)
// listen to pixel requests and log it using pixel-tracker and CRATE
require('http')
    .createServer(tracker.middleware)
    .listen(3000)
