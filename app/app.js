/*-------------------------------------------------------------------*/
/*                                                                   */
/* Copyright IBM Corp. 2013 All Rights Reserved                      */
/*                                                                   */
/*-------------------------------------------------------------------*/
/*                                                                   */
/*        NOTICE TO USERS OF THE SOURCE CODE EXAMPLES                */
/*                                                                   */
/* The source code examples provided by IBM are only intended to     */
/* assist in the development of a working software program.          */
/*                                                                   */
/* International Business Machines Corporation provides the source   */
/* code examples, both individually and as one or more groups,       */
/* "as is" without warranty of any kind, either expressed or         */
/* implied, including, but not limited to the warranty of            */
/* non-infringement and the implied warranties of merchantability    */
/* and fitness for a particular purpose. The entire risk             */
/* as to the quality and performance of the source code              */
/* examples, both individually and as one or more groups, is with    */
/* you. Should any part of the source code examples prove defective, */
/* you (and not IBM or an authorized dealer) assume the entire cost  */
/* of all necessary servicing, repair or correction.                 */
/*                                                                   */
/* IBM does not warrant that the contents of the source code         */
/* examples, whether individually or as one or more groups, will     */
/* meet your requirements or that the source code examples are       */
/* error-free.                                                       */
/*                                                                   */
/* IBM may make improvements and/or changes in the source code       */
/* examples at any time.                                             */
/*                                                                   */
/* Changes may be made periodically to the information in the        */
/* source code examples; these changes may be reported, for the      */
/* sample code included herein, in new editions of the examples.     */
/*                                                                   */
/* References in the source code examples to IBM products, programs, */
/* or services do not imply that IBM intends to make these           */
/* available in all countries in which IBM operates. Any reference   */
/* to the IBM licensed program in the source code examples is not    */
/* intended to state or imply that IBM's licensed program must be    */
/* used. Any functionally equivalent program may be used.            */
/*-------------------------------------------------------------------*/


// module dependencies
var http = require('http');
var path = require('path');
var express = require('express');
var hogan = require('hogan-express');

// routes
var routes = require('./routes');
var analyze = require('./routes/analyze');
var graph = require('./routes/graph');

// all environments
app = express();

// check if application is being run in cloud environment
if (process.env.VCAP_SERVICES) {
  // store analytics service URLs in app variables if they exist
  var services = JSON.parse(process.env.VCAP_SERVICES);

  for (var svcName in services) {
    if (svcName.match(/^[Cc]ompanies.*/)) {
      app.set('company_analytics_url', services[svcName][0]['credentials']['url']);
    }
    if (svcName.match(/^[Nn]ames.*/)) {
      app.set('name_analytics_url', services[svcName][0]['credentials']['url']);
    }
  }
}

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.set('env', 'development');
app.engine('html', hogan);

app.use(express.favicon(path.join(__dirname, 'public/images/favicon.ico')));
app.use(express.logger());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// routing
app.get('/', routes.index);
app.get('/graph', graph.get);
app.get('/analyze/:keyword/:option', analyze.get);

// start server
http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
