// logging
//  winston is the most popular node logging package, but is overkill for us
// Refs:
// - http://docs.nodejitsu.com/articles/intermediate/how-to-log
// - http://devgigs.blogspot.com/2014/01/mastering-nodejs-logging.html

var fs      = require("fs");

var loggers = {};

function Logger() {
	var self         = {};
	// default log level
	self.logLevel    = 'warn';
	self.setLogLevel = function(level) {
		self.logLevel = level;
		return self;
	};
	
	// output stream
	self.logStream  = process.stdout;
	self.setLogFile = function(filename) {
		self.logStream = fs.createWriteStream(filename, {flags: 'a'});
		return self;
	};
	
	var logimpl = function(level, args) {
		var levels = ['error', 'warn', 'info', 'debug'];
		if(levels.indexOf(level) <= levels.indexOf(self.logLevel)) {
			var message_parts = Object.values(args).map(a => (typeof a !== 'string') ? JSON.stringify(a) : a);
			var message       = level + ': ' + message_parts.join(" ");
			
			self.logStream.write(message.trimEnd() + '\n');
			// always print errors to console
			if(level === 'error' && self.logStream !== process.stdout)
				console.log(message);
		}
	}
	
	self.log   = function(level) { logimpl(level,   Array.prototype.slice.call(arguments, 1)); }
	self.error = function(     ) { logimpl('error', arguments                               ); }
	self.warn  = function(     ) { logimpl('warn',  arguments                               ); }
	self.info  = function(     ) { logimpl('info',  arguments                               ); }
	self.debug = function(     ) { logimpl('debug', arguments                               ); }
	return self;
}

// look up logger by name or create a new one
module.exports = function(name) {
	if(name && loggers[name]) {
		return loggers[name];
	} else {
		var logger = Logger();
		
		if(name) loggers[name] = logger;
		return logger;
	}
}
