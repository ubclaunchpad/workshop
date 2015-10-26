// Configuring passport

// Requiring modules
var LocalStrategy = require('passport-local').Strategy,
	User = require('../models/user');
	
module.exports = function(passport) {
	
	// ================================================
    // passport session setup 
	// ================================================
	// Used for sessions
	passport.serializeUser(function(user, done){
		done(null, user.id);
	});
	
	// Used for mongoDB check
	passport.deserializeUser(function(id, done){
		User.findById(id, function(err, user){
			if(err) console.log(err);
			done(err, user);
		});
	});
	
	// ================================================
    // LOCAL SIGNUP
	// ================================================
	passport.use('local-signup', new LocalStrategy({
		usernameField : 'email',
		passwordField : 'password',
		passReqToCallback: true // To pass back the request to the callback 
	},
	function(req, email, password, done) {
		// we want user.findOne to fire when data is sent back
		process.nextTick(function(){
			// Check if the user already exists
			User.findOne({'local.email' : email}, function(err, user){
				if (err) return done(err);
				
				if(user) {
					return done(null, false, req.flash('signupMessage', 'Account with that email already exists'));
				} else {
					// If an account does not exist, create one
					var newUser = new User();
					
					newUser.local.email = email;
					newUser.local.password = newUser.generateHash(password);
					
					// Save the details of the new user
					newUser.save(function(err){
						if(err) throw err;
						return done(null, newUser);
					});
				}
			});
		});
	}));
	
	// ================================================
    // LOCAL LOGIN
	// ================================================
	passport.use('local-login', new LocalStrategy({
		usernameField : 'email',
		passwordField : 'password',
		passReqToCallback: true // To pass back the request to the callback 
	},
	function(req, email, password, done){
		User.findOne({'local.email' : email}, function(err, user){
			if (err) return done(err);
			
			// If no user is found
			if(!user) {
				return done(null, false, req.flash('loginMessage', 'Account with this email does not exist.'));
			}
			
			if(!user.validPassword(password)) {
				return done(null, false, req.flash('loginMessage', 'Incorrect username/email combination. Please try again.'));
			}
			
			// If everything looks good, return user
			return done(null, user);
		});
	}));
};