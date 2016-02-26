var consolere = require('console-remote-client').connect('console.re','80','mycms');
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var http         = require('http');
console.re.log('remote log test');
// public folder to store assets
app.use(express.static(__dirname + '/public'));
app.use('/', express.static(__dirname + '/'));
require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)

//body parser to get the html information
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.set('view engine', 'ejs'); // set up ejs 

// required for passport
app.use(session({ secret: 'letscreatesomething' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport


// get sharejs dependencies
var sharejs = require('share');
require('redis');

// options for sharejs 
var options = {
  db: {type: 'redis'},
};
var shareCodeMirror = require('share-codemirror');
// This example uses express.
app.use(express.static(shareCodeMirror.scriptsDir));
// attach the express server to sharejs
//sharejs.server.attach(app, options);
app.listen(port);
console.log('The magic happens on port ' + port);