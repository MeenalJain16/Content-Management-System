// app/routes.js
module.exports = function(app, passport) {
    var fs = require('fs');
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    // show the login form
    app.get('/login', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    app.get('/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    app.get('/profile', isLoggedIn, function(req, res) {
		fs.readdir('C:/Users/Meenal/login/projects/'+ req.user.email +'/', function(err, items) {
			if(err) {
				return console.log(err);
			}
			var filesList="";
			for(var i = 0; i < items.length; i++) {
				filesList += items[i] + "||";
			}
			var backups = '1234';
			res.render('profile.ejs', {
				email : req.user.email,
				dirList: filesList.split("||")
				,backup_files: backups
			});
		});
    });

    app.get('/logout', function(req, res) {
        req.logout();
		req.session.destroy();
        res.redirect('/');
    });
	
	// process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
	
	 // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
	
	app.post('/cms_create_file', function(req, res){
		console.log("We are in get cms");
		var path = req.body.path;
		var file_name = req.body.value;
		
		var new_file_path= path.substring(0, path.length - 4);
		console.log(new_file_path);
		var dir = new_file_path +'/'+file_name;
		console.log(dir);
		var fd = fs.openSync(dir, 'w');
		res.send("Great");
	});
	app.post('/save_file', function(req, res){
		console.log("Savedd");
		fs.writeFile(req.body.path, req.body.file_content, function(err) {
			if(err) {
				return console.log(err);
			}
			res.send("Your file is saved.");
		});
	});
	
	app.post('/read_file', function(req, res){
		console.log("We are in read_file");
		var path = req.body.path;
		fs.readFile(path, 'utf8', function(err, contents) {
			console.log(contents);
			res.send(contents);
		});
	});
	app.post('/delete_file', function(req, res){
		console.log("We are in delete_file");
		var path = req.body.path;
		console.log(path);
		fs.unlink(path, function(err, contents) {
			if (err) {
				return console.error(err);
			}
			console.log("File deleted !!");
			res.send("File deleted Successfully");
		});
	});
	app.post('/delete_backup', function(req, res){
		console.log("We are in delete_backup file");
		var path = req.body.path;
		console.log(path);
		var deleteFolderRecursive = function(path) {
						if( fs.existsSync(path) ) {
							fs.readdirSync(path).forEach(function(file,index){
							  var curPath = path + "/" + file;
							  if(fs.lstatSync(curPath).isDirectory()) { // recurse
								deleteFolderRecursive(curPath);
							  } else { // delete file
								fs.unlinkSync(curPath);
							  }
							});
							fs.rmdirSync(path);
						}
		};
		res.send("Directory deleted");
	});
	app.post('/version_control', function(req, res){
		console.log("We are in Version Control");
		var src = req.body.src_path;
		var dest = req.body.dest_path;
		var fse = require('fs-extra');

		fse.copy(src, dest, function (err) {
		    if (err) 
				return console.error(err)
			res.send("success!");
		}) 
		
	});
	//to fetch all backups on profile after submitting buttons
	app.post('/version', function(req, res){
		console.log("We are in fetch version Control");
		var path = req.body.path;
		var email = req.body.email;
		var timestamp = "";
		var count = 0;
			fs.readdir(path, function(err, backup_files){
				if (err) {
				   return console.error(err);
				}
				var c = backup_files.length;
				for(var i = 0; i < backup_files.length; i++){
					console.log('filesss '+backup_files[i]);
					fs.stat(path + '/' + backup_files[i] + '/', function (err, stats) {
						  if (err) throw err;
						  console.log('stats: ' + JSON.stringify(stats.mtime));
						  timestamp += JSON.stringify(stats.mtime) + "||";
						  console.log("---> "+timestamp);
						  generate_call(timestamp, c);
						});
					
				}
				function generate_call(timestamp, c){
					count += 1;
					if(count==c)
						res.send({backup_files: backup_files, timestamp: timestamp.split("||") });
				}
				//res.render('version');
				//res.render('version', {email: email, backup_files: backup_files });
			});
	});
	app.get('/cms/(:id)', function(req, res) {
		res.render('pad');
	});
    app.post('/cms', isLoggedIn, function(req, res){
		var dir = './projects/' + req.body.email + '/' + req.body.directories;
		console.log(dir);
		if (!fs.existsSync(dir)){
			fs.mkdirSync(dir); // check whether folder is created  successfully or not. If not, send error
		} 
		var file_arr = "";
		var path = req.body.path;
		console.log(path);
		var file_name = req.body.file_name;
		if(path == undefined || file_name == undefined){
			var contents = "";
		}
		else if(path != undefined || file_name != undefined){
			var new_file_path= path.substring(0, path.length - 8);
			var location = new_file_path +'/'+file_name;
			console.log(location);
			fs.readFile(location, 'utf8', function(err, contents) {
				console.log(contents);
			});
		}
		var c = 0; //counter for folders list
		fs.readdir('./projects/'+ req.body.email +'/',function(err, files){
			if (err) {
			   return console.error(err);
			}
			var counter = files.length;
			files.forEach( function (file){
				fs.readdir('./projects/' + req.body.email + '/' + file + '/',function(err, inner_files){
		
					file_arr += "+New";
					if (err) {
					   return console.error(err);
					}
					inner_files.forEach( function (file1){
						file_arr += "||" + file1;
					});
					
					generate_callback(file_arr, counter);
					file_arr += "-";
				});
			}); 
		
			function generate_callback(file_arr, counter) {
				c += 1;
				if(c == counter){
					var file_array = file_arr.split("-");
					res.render('pad',{dir : req.body.directories, email: req.body.email, folders: files, inner_files: file_array, file_contents:contents });
				}
			};		
		});	
}); //end of cms post 
app.post('/versions', isLoggedIn, function(req, res){
		var c = 0; //counter for folders list
		var file_arr = "";
		var contents = "";
		var directories = req.body.mytext;
		console.log(directories);
		fs.readdir('./backup_projects/'+ req.body.email +'/'+directories+"_backup/",function(err, files){
			if (err) {
			   return console.error(err);
			}
			var counter = files.length;
			files.forEach( function (file){
				fs.readdir('./backup_projects/'+ req.body.email +'/'+directories+"_backup/" + file + '/',function(err, inner_files){
		
					file_arr += "+New";
					if (err) {
					   return console.error(err);
					}
					inner_files.forEach( function (file1){
						file_arr += "||" + file1;
					});
					
					generate_callback(file_arr, counter);
					file_arr += "-";
				});
			}); 
		
			function generate_callback(file_arr, counter) {
				c += 1;
				if(c == counter){
					var file_array = file_arr.split("-");
					res.render('pad',{dir : req.body.directories, email: req.body.email, folders: files, inner_files: file_array, file_contents:contents });
				}
			};	
		});
});
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next){

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

