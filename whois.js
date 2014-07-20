var whois = require('node-whois')

function lookup (ip, callback)
{
	if (ip == '127.0.0.1')
			ip = '82.41.23.45'
	whois.lookup(ip, function(err, data) {
	   // console.log(data)
	    try {
	    var lines = data.split ('\n')
	    lines = lines.filter (function (e,i){
	    	 if (/^\%/im.test(e))
	    	 	return false;
	    	 else if ( e == '') 
	    	 	return false
	    	 else if (/descr/i.test (e))
	    	 	return true
	    	 else false
	    })
	    lines = lines.map (function (e,i) {
	    	if (/descr/i.test (e))
	    	{
	    		var x = e.replace (/descr\:\s+/, '')
	    		return  x;
	    	} else {
	    		''
	    	}
	    })
	} catch (ex) {console.log (ex) }
		console.log (lines.join ('\n'))
	    callback ({description: lines.join ('\n'), original: data})
	})

}

//lookup ('82.41.23.227',function (result) {
//	console.log (result.description)
//})

exports.lookup = lookup;

