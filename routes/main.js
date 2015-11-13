// This file contains the primary routes for the platform
module.exports = function(express, app, middleware, passport, mongoose, User, Post) {
	var router = express.Router();
	
	// =====================================
	// HOME / LOG-IN PAGE
  	// =====================================
	router.get('/', function(req, res){
		res.render('index', {
			errorMessage: req.flash('loginMessage')
		});
	});
	
	router.post('/login', passport.authenticate('local-login', {
		successRedirect: '/dashboard',
		failureRedirect: '/',
		failureFlash: true // Show flash messages
	}));
	
	// =====================================
  	// SIGN-UP PAGE
  	// =====================================
	router.get('/signup', function(req, res){
		res.render('signup', {
			errorMessage: req.flash('signupMessage')
		});
	});
	
	router.post('/signup', passport.authenticate('local-signup', {
		successRedirect: '/dashboard',
		failureRedirect: '/signup',
		failureFlash: true // Show flash messages
	}));
	
	// =====================================
  	// DASHBOARD PAGE
	// =====================================	
	router.get('/dashboard', middleware.isLoggedIn, function(req, res){
		res.render('dashboard', {
			user : req.user,
            successMessage : req.flash('successMessage') || ""
		});
	});
	
    // =====================================
  	// USER PROFILE PAGE
	// =====================================	
    router.get('/users/:user', function(req, res) {
        var query = User.findOne({ _id : mongoose.Types.ObjectId(req.params.user) }, function(err, result){
            if(err) {
				console.log("An error occurred while retrieving this user: " + err.stack);
			}
            res.render('profile', {
                profileOwner : result,
                posts : result.posts
            });
        });
    });
     
	// =====================================
    // FEED
    // =====================================	
	router.get('/feed', middleware.isLoggedIn, function(req,res) {
		var query = Post.where().sort({ 'createdAt' : -1 }).limit(10);
		query.find(function(err, docs) {
			if(err) {
				console.log("An error occurred while searching for recent posts: " + err.stack);
			}
			res.render('feed', {
				user : req.user,
				posts : docs
			});
		});
	});
	
	// =====================================
  	// FACEBOOK ROUTES
  	// =====================================
	router.get('/auth/facebook', passport.authenticate('facebook', {scope : 'email'}));
	
	// Handle callback after authenticaiton
	router.get('/auth/facebook/callback',
		passport.authenticate('facebook', {
			successRedirect : '/dashboard',
			failureRedirect : '/'
		}));
		
	// =====================================
    // LOGOUT
    // =====================================	
	router.get('/logout', function(req, res){
		req.logout();
		res.redirect('/');
	});

	// mount the router on the app - https://scotch.io/tutorials/learn-to-use-the-new-router-in-expressjs-4
	// All routes relative to '/'
	app.use('/', router);
}