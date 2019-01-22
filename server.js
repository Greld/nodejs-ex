var express = require('express');
let path = require('path');
let proxy = require('express-http-proxy');
var app = express();

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';


// respond with "hello world" when a GET request is made to the homepage
app.use(express.static(path.join(__dirname, 'static/')))
    .use('/embed2.html', proxy('embed.windy.com', {
      https: true
    }))
    .use('/v', proxy('embed.windy.com', {
      https: true,
      proxyReqPathResolver: function(req) {
        return '/v' + require('url').parse(req.url).path;
      }
    }))
    .use('/js', proxy('embed.windy.com', {
      https: true,
      proxyReqPathResolver: function(req) {
        return '/js' + require('url').parse(req.url).path;
      }
    }))
    .use('/img', proxy('embed.windy.com', {
      https: true,
      proxyReqPathResolver: function(req) {
        return '/img' + require('url').parse(req.url).path;
      }
    }))
    .use('/cityforecast', proxy('ims-s.windy.com', {
        https: true,
        proxyReqPathResolver: function(req) {
            return '/forecast/citytile/v1.3' + require('url').parse(req.url).path;
        }
    }));

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
