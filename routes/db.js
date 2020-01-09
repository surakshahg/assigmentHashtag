var mysql = require('mysql');
var fs = require('fs');
var HttpStatus = require('http-status-codes');


//var host_ip = "localhost";
var db_username = "root";
var db_password = "r@@T123";
var master_db = "mqproduction";
var movie_measure = "moviemeasure";

exports.authenticate = function(req, res) {

    var details = req.body;

	var connection = mysql.createConnection({ host: host_ip, user: db_username, password: db_password, database : movie_measure });
	connection.connect();
	
	var query = "select * from portal_users where username='"+details.username+"' and password='"+details.password+"'";
	connection.query(query, function(err,rows){
		connection.end();
		res.json(rows);
	})
}
exports.getTheaterList=function(req,res) {

	var connection = mysql.createConnection({ host: host_ip, user: db_username, password: db_password, database : master_db });
	connection.connect();
	
	var query = "select theater_id, screenvision_id, theater_name, theater_address, theater_area, theater_city, theater_state, theater_lat, theater_lon, theater_screens, theater_zip, theater_location from theaterselect theater_id, screenvision_id, theater_name, theater_address, theater_area, theater_city, theater_state, theater_lat, theater_lon, theater_screens, theater_zip, theater_location from theater";
	connection.query(query, function(err,rows){
		connection.end();
		res.json(rows);
	})
}
exports.theater_suggestion = function(req, res) {

    var details = req.body;

    var temp = details.name.split(" ");
    var temp_val = "";
    for(var i=0; i<temp.length; i++){
        if(temp[i].toUpperCase() == "AND" || temp[i].toUpperCase() == "THE" || temp[i].toUpperCase() == "A" ||temp[i].toUpperCase() == "CINEMAS" || temp[i].toUpperCase() == "AN" || temp[i].toUpperCase() == "OF" || temp[i].toUpperCase() == "WE" ||temp[i].toUpperCase() == "THEATRE" || temp[i].toUpperCase() == "YOU" || temp[i].toUpperCase() == "ARE" || temp[i].length<=2){

        }else{
            temp_val = temp_val+' theater_name LIKE "%'+temp[i]+'%" OR '
        }
    }
    temp_val = temp_val+' theater_name LIKE "%'+details.name+'%" OR '
	var connection = mysql.createConnection({ host: host_ip, user: db_username, password: db_password, database : master_db });
	connection.connect();
	
	var query = "SELECT theater_id, theater_name, theater_address, theater_city, theater_state, theater_phone FROM screenvision_theater where "+temp_val+" theater_id = "+details.id;
	console.log(query);
	connection.query(query, function(err,rows){
		connection.end();
		res.json(rows);
	})
}

exports.updateTheaterdata=function(req,res) {

    var details = req.body;
	var connection = mysql.createConnection({ host: host_ip, user: db_username, password: db_password, database : master_db });
	connection.connect();
	
	var query = "update theater SET screenvision_id = '"+details.screenVision_id+"' where theater_id='"+details.theater_id+"'";
	connection.query(query, function(err,rows){
		connection.end();
		res.json(rows);
	})
}


exports.updateshowtimes=function(req,res){
	
	var details = req.body;
	var start_date = details.start_date;
	var end_date = details.end_date;
	var th_id = details.theater_id;
	var movie_details = details.movie_details;
	//console.log(JSON.stringify(details));
	if(movie_details.theaters){
		if(movie_details.theaters.house[0]){
			var theatre_details = movie_details.theaters.house[0];
			
			var city = theatre_details.address[0].city;
			var country = theatre_details.address[0].country;
			var state = theatre_details.address[0].state;
			var zipcode = theatre_details.address[0].zip;
			var location = theatre_details.location;
			var theater_id = theatre_details.house_id;
			var theater_name = theatre_details.name;
			
			if(theatre_details.schedule[0]){
				var movie_data = theatre_details.schedule[0].movie;
				var value = [];
				
				var connection = mysql.createConnection({ host: host_ip, user: db_username, password: db_password, database : master_db });
				connection.connect();
	
				var query1 = "DELETE FROM showtimes where theater_id = '"+th_id+"' and (show_date BETWEEN '"+start_date+"' AND '"+end_date+"')";
				connection.query(query1, function (err, result_2) {
				
					var query = "insert into showtimes(theater_id, theater_name, city, country, state, zipcode, location, movie_id, movie_name, movie_rating, show_date, show_time) values ? ";

					for(var i=0; i<movie_data.length; i++){
						var movie_id = movie_data[i].movie_id;
						var movie_name = movie_data[i].movie_name;
						var movie_rating = movie_data[i].movie_rating;
						var movie_showtimes = movie_data[i].showtimes;
						for(var j=0; j<movie_showtimes.length; j++){
							var movie_date = movie_showtimes[j].date;
							var movie_times = movie_showtimes[j].showtime;
							
							var custom_date = movie_date.split("\\/");
							if(Array.isArray(movie_times)){
								for(var k=0; k<movie_times.length; k++){
								
									var each_value = [];
									each_value.push(theater_id);
									each_value.push(theater_name);
									each_value.push(city);
									each_value.push(country);
									each_value.push(state);
									each_value.push(zipcode);
									each_value.push(location);
									each_value.push(movie_id);
									each_value.push(movie_name);
									each_value.push(movie_rating);
									each_value.push(custom_date[2]+"-"+custom_date[0]+"-"+custom_date[1]);
									each_value.push(movie_times[k]);
									value.push(each_value);
									
								}
								
							}else{
								var each_value = [];
								each_value.push(theater_id);
								each_value.push(theater_name);
								each_value.push(city);
								each_value.push(country);
								each_value.push(state);
								each_value.push(zipcode);
								each_value.push(location);
								each_value.push(movie_id);
								each_value.push(movie_name);
								each_value.push(movie_rating);
								each_value.push(custom_date[2]+"-"+custom_date[0]+"-"+custom_date[1]);
								each_value.push(movie_times);
								value.push(each_value);
							}
						}
					}
					connection.query(query,[value], function (err, result_4) {
						connection.end();
		
						if (err){
							var temp_message={};
							temp_message.err_msg='insertion failed';
							res.send(temp_message);
						}else {
							var temp_message={};
							temp_message.message='succesfully inserted';
							res.send(temp_message);
						}
					});
				});
			}else{
				var temp_message={};
				temp_message.message='No Data';
				res.send(temp_message);
			}
		}else{
			var temp_message={};
			temp_message.message='No Data';
			res.send(temp_message);
		}
	}else{
		var temp_message={};
		temp_message.message='No Data';
		res.send(temp_message);
	}
}

exports.loadShowTimes=function(req,res){
	
	var data=req.body;
	
	var connection = mysql.createConnection({ host: host_ip, user: db_username, password: db_password, database : master_db });
	connection.connect();
	
	var query = "select theater_id, theater_name, country, city, state,zipcode, location, movie_id, movie_name, DATE_FORMAT(show_date,'%Y-%m-%d') as show_date, show_time from showtimes where show_date >= CURDATE()";
	connection.query(query, function(err,rows){
		connection.end();
		res.json(rows);
	})
}
exports.createAssignmnets=function(req,res){
	var data = req.body;
	
	var connection = mysql.createConnection({ host: host_ip, user: db_username, password: db_password, database : movie_measure });
	connection.connect();
	
	var query = "INSERT INTO assignments(assignment_id, theatre_id, movie_id, movie_name, show_date, show_times, status) VALUES ?";
	connection.query(query, [data], function(rows) {
		connection.end();
		res.json(rows);
	})
}

exports.getMaxAssignmentId=function(req,res) {

	var connection = mysql.createConnection({ host: host_ip, user: db_username, password: db_password, database : movie_measure });
	connection.connect();
	
	var query = "select MAX(assignment_id) as assignment_id from assignments";
	connection.query(query, function(err,rows) {
		if(err){
			console.log(err);
		}else{
			connection.end();
			res.json(rows);
		}
	})
}
exports.demoAssignmnets=function(req,res){

	var data = req.body;
	var connection = mysql.createConnection({ host: host_ip, user: db_username, password: db_password, database : movie_measure });
	connection.connect();
	
	var query = "INSERT INTO assignments(assignment_id,user_id, theatre_id, movie_id, movie_name, show_date, show_times, ads_trailer,status) VALUES ?";
	connection.query(query, [data], function(err,rows) {
		if(err){
			console.log(err);
		}else{
			connection.end();
		res.json(rows);
		console.log(rows);
		}
	})
}

exports.clearShowtimes=function(req,res){
	
	var data=req.body;
	
	var connection = mysql.createConnection({ host: host_ip, user: db_username, password: db_password, database : master_db });
	connection.connect();
	
	var query = "delete from showtimes";
	connection.query(query, function(err,rows){
		connection.end();
		res.json(rows);
	})
}

exports.assignmnetList=function(req,res) {
	var data=req.body;
	var connection = mysql.createConnection({ host: host_ip, user: db_username, password: db_password, database : movie_measure });
	connection.connect();
	
	var query = "select a.assignment_id, a.theatre_id,a.movie_id, a.movie_name, DATE_FORMAT(a.show_date,'%Y-%m-%d ') as show_date, a.show_times,a.status, a.ads_trailer,c.first_name, ifnull(c.last_name,'') as last_name from checker c, assignments a where a.user_id=c.user_id ORDER BY assignment_id DESC";
	connection.query(query, [data], function(err,rows) { 
		if(err){
			console.log(err);
		}else{
			connection.end();
			res.json(rows);
		}
	})
}

exports.deleteAssignmnet=function(req,res){
	var data=req.body;
	var connection = mysql.createConnection({ host: host_ip, user: db_username, password: db_password, database : movie_measure });
	connection.connect();
	
	var query = "delete from assignments where (assignment_id,movie_id,show_times) in (?)";
	connection.query(query, [data], function(err,rows) {
		if(err){
			console.log(err);
			connection.end();
		}else{
			connection.end();
			res.json(rows);
		}
	})
}

exports.verifyEmail=function(req,res) {
	var details=req.body;

	var connection = mysql.createConnection({ host: host_ip, user: db_username, password: db_password, database : movie_measure });
	connection.connect();
	
	var query = "SELECT * from checker where verify_code='"+details.verify_code+"'";
	connection.query(query, function (err, result_2) {
		if (err) throw err;
		
		if(result_2.length > 0){
			var query = "update checker SET email_verify = 1 where verify_code = '"+details.verify_code+"'";
			connection.query(query, function (err, result_2) {
				connection.end();
				if (err){
					var retn_details = {};
					retn_details.err_msg = "Error in updating user details";
					res.send(retn_details);
				}else{
					var retn_details = {};
					retn_details.message = "Updated";
					res.send(retn_details);
				}
			});
		}else{
			connection.end();
			var retn_details = {};
			retn_details.err_msg = "Invalid verification code.";
			res.send(retn_details);
		}
	});
}

exports.getAllMovieData = function(req, res) {
	
	var details=req.body;

	var connection = mysql.createConnection({ host: host_ip, user: db_username, password: db_password, database : master_db });
	connection.connect();
	
	var query = "SELECT id, movietickets_id, movie_title, DATE_FORMAT(release_date,'%Y-%m-%d') as release_date, youtube_url, cover_image, cast, director, synopsis, genre, studio_name, extra4, twitter, hashtag, extra2, extra3, extra1 FROM fq_movie_master";
	
	connection.query(query, function (err, rows) {
		connection.end();
		if (err){
			res.send(err);
		}else{
			res.send(rows);
		}
	});
}
exports.getSpecificMovieData = function(req, res) {
	
	var details=req.body;

	var connection = mysql.createConnection({ host: host_ip, user: db_username, password: db_password, database : master_db });
	connection.connect();
	
	var query = "SELECT fmm.id, fmm.movietickets_id, fmm.movie_title, DATE_FORMAT(fmm.release_date,'%Y-%m-%d') as release_date, fmm.cover_image, fmm.cast, fmm.director, fmm.synopsis, fmm.genre, fmm.studio_name, fmm.extra4, fmm.twitter, fmm.hashtag, fmm.extra2, fmm.extra3, fmm.extra1 FROM fq_movie_master fmm where fmm.id = "+details.id;

	connection.query(query, function (err, rows) {
		if (err){
			res.send(err);
		}else{
			var query = "SELECT ft.id as awav_id, ft.youtube_url, ft.trailer_type, ft.trailer_version, ft.trailer_tag, ft.trailer_format, ft.trailer_runtime FROM fq_trailers ft where ft.movie_id = "+details.id;

			connection.query(query, function (err, rows_1) {
				connection.end();
				if (err){
					res.send(err);
				}else{
			
					var temp = {};
					var trailer_arr = [];
					for(var i=0; i<rows_1.length; i++){
						var trailer_temp = {};
						trailer_temp.awav_id = rows_1[i].awav_id;
						trailer_temp.youtube_url = rows_1[i].youtube_url;
						trailer_temp.trailer_type = rows_1[i].trailer_type;
						trailer_temp.trailer_version = rows_1[i].trailer_version;
						trailer_temp.trailer_tag = rows_1[i].trailer_tag;
						trailer_temp.trailer_format = rows_1[i].trailer_format;
						trailer_temp.trailer_runtime = rows_1[i].trailer_runtime;
						
						trailer_arr.push(trailer_temp)
					}
					temp.id = rows[0].id;
					temp.movietickets_id = rows[0].movietickets_id;
					temp.movie_title = rows[0].movie_title;
					temp.release_date = rows[0].release_date;
					temp.cover_image = rows[0].cover_image;
					temp.cast = rows[0].cast;
					temp.director = rows[0].director;
					temp.synopsis = rows[0].synopsis;
					temp.genre = rows[0].genre;
					temp.studio_name = rows[0].studio_name;
					temp.extra4 = rows[0].extra4;
					temp.twitter = rows[0].twitter;
					temp.hashtag = rows[0].hashtag;
					temp.extra2 = rows[0].extra2;
					temp.extra3 = rows[0].extra3;
					temp.extra1 = rows[0].extra1;
					temp.trailers = trailer_arr;
					
					res.send(temp);
				}
			});
		}
	});
}
exports.updateSpecificMovieData = function(req, res) {
	
	var details=req.body;

	var connection = mysql.createConnection({ host: host_ip, user: db_username, password: db_password, database : master_db });
	connection.connect();
	
	var temp_arr = [];
	temp_arr.push(details.cover_image);
	temp_arr.push(details.cast);
	temp_arr.push(details.director);
	temp_arr.push(details.release_date);
	temp_arr.push(details.synopsis);
	temp_arr.push(details.genre);
	temp_arr.push(details.movie_title);
	temp_arr.push(details.studio_name);
	temp_arr.push(details.extra1);
	temp_arr.push(details.extra4);
	temp_arr.push(details.movietickets_id);
	temp_arr.push(details.twitter);
	temp_arr.push(details.hashtag);
	temp_arr.push(details.apple_trialer);
	temp_arr.push(details.trailer_addict);
	temp_arr.push(details.others);
				
	temp_arr.push(details.id);
	
	connection.query('update fq_movie_master SET cover_image = ?, cast = ?, director = ?, release_date = ?, synopsis = ?, genre = ?, movie_title = ?, studio_name = ?, extra1 = ?, extra4 = ?, movietickets_id = ?, twitter = ?, hashtag = ?, extra2 = ?, extra3 = ?, others = ? where id = ?', temp_arr, function (err, result) {
				
		if (err){
			res.send(err);
		}else{
			
			var query = "select id from fq_trailers order by id desc limit 1";
			connection.query(query, function (err, rows) {
				var maxId = rows[0].id;
				var trailers = details.trailers;
				if(trailers.length > 0){
					updateTrailer(0);
					function updateTrailer(i){
						
						if(trailers[i].awav_id==""){
							maxId = parseInt(maxId) + 1;
							trailers[i].awav_id = maxId;
						}
						var sql_query = "insert into fq_trailers(id,movie_id,youtube_url,trailer_type,trailer_version,trailer_tag,trailer_format,trailer_runtime,others) values("+trailers[i].awav_id+",'"+details.id+"','"+trailers[i].youtube_url+"','"+trailers[i].trailer_type+"','"+trailers[i].trailer_version+"','"+trailers[i].trailer_tag+"','"+trailers[i].trailer_format+"','"+trailers[i].trailer_runtime+"','N') ON DUPLICATE KEY UPDATE youtube_url='"+trailers[i].youtube_url+"',trailer_type='"+trailers[i].trailer_type+"',trailer_version='"+trailers[i].trailer_version+"',trailer_tag='"+trailers[i].trailer_tag+"',trailer_format='"+trailers[i].trailer_format+"',trailer_runtime='"+trailers[i].trailer_runtime+"'";
						
						connection.query(sql_query, function (err, rows) {
						
							if((i+1)<trailers.length){
								updateTrailer(i+1)
							}else{
								connection.end();
								res.send(rows);
							}
						});
					}
				}else{
					connection.end();
					res.send(rows);						
				}
			});
		}
	});
}
exports.addSpecificMovieData = function(req, res) {
	
	var details=req.body;

	var connection = mysql.createConnection({ host: host_ip, user: db_username, password: db_password, database : master_db });
	connection.connect();
	
	var query = "select id from fq_movie_master order by id desc limit 1";
	connection.query(query, function (err, rows) {
		var movie_maxId = parseInt(rows[0].id)+1;

		var temp_arr = [];
		temp_arr.push(movie_maxId);
		temp_arr.push(details.cover_image);
		temp_arr.push(details.cast);
		temp_arr.push(details.director);
		temp_arr.push(details.release_date);
		temp_arr.push(details.synopsis);
		temp_arr.push(details.genre);
		temp_arr.push(details.movie_title);
		temp_arr.push(details.studio_name);
		temp_arr.push(details.extra1);
		temp_arr.push(details.extra4);
		temp_arr.push(details.movietickets_id);
		temp_arr.push(details.twitter);
		temp_arr.push(details.hashtag);
		temp_arr.push(details.apple_trialer);
		temp_arr.push(details.trailer_addict);
		temp_arr.push(details.others);

		connection.query('insert into fq_movie_master(id, cover_image, cast, director, release_date, synopsis, genre, movie_title, studio_name, extra1, extra4, movietickets_id, twitter, hashtag, extra2, extra3, others) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', temp_arr, function (err, result) {

			if (err){
				res.send(err);
			}else{
				
				var query = "select id from fq_trailers order by id desc limit 1";
				connection.query(query, function (err, rows) {
					var maxId = rows[0].id;
					var trailers = details.trailers;
					if(trailers.length > 0){
						updateTrailer(0);
						function updateTrailer(i){
							
							maxId = parseInt(maxId) + 1;
							
							var sql_query = "insert into fq_trailers(id,movie_id, youtube_url, trailer_type, trailer_version, trailer_tag, trailer_format, trailer_runtime, others) values("+maxId+","+movie_maxId+",'"+trailers[i].youtube_url+"','"+trailers[i].trailer_type+"','"+trailers[i].trailer_version+"','"+trailers[i].trailer_tag+"','"+trailers[i].trailer_format+"','"+trailers[i].trailer_runtime+"','N')";
							
							connection.query(sql_query, function (err, rows) {
							
								if((i+1)<trailers.length){
									updateTrailer(i+1)
								}else{
									connection.end();
									res.send(rows);
								}
							});
						}
					}else{
						connection.end();
						res.send(rows);						
					}
				});
			}
		});
	})
}
exports.getWebediaData = function(req, res) {
	
	var details=req.body;

	var connection = mysql.createConnection({ host: host_ip, user: db_username, password: db_password, database : master_db });
	connection.connect();
	
	var query = "SELECT movietickets_id, movie_title, DATE_FORMAT(release_date,'%Y-%m-%d') as release_date, youtube_url, cover_image, cast, director, synopsis, genre, studio_name, extra4, twitter, hashtag, extra2, extra3, extra1 FROM movie_review_queue where release_date>= CURDATE() ORDER BY movie_title ASC";
	connection.query(query, function(err,rows){
		connection.end();
		if (err){
			res.send(err);
		}else{
			res.send(rows);
		}          
	});
}

exports.getSuggestion = function(req, res) {
	
	var details = req.body;
	var temp = details.title.split(" ");
	var temp_val = "";
	for(var i=0; i<temp.length; i++){
		if(temp[i].toUpperCase() == "AND" || temp[i].toUpperCase() == "THE" || temp[i].toUpperCase() == "A" || temp[i].toUpperCase() == "AN" || temp[i].toUpperCase() == "OF" || temp[i].toUpperCase() == "WE" || temp[i].toUpperCase() == "YOU" || temp[i].toUpperCase() == "ARE" || temp[i].length<=2){

		}else{
			temp_val = temp_val+' movie_title LIKE "%'+temp[i]+'%" OR '
		}
	}
	temp_val = temp_val+' movie_title LIKE "%'+details.title+'%" OR '

	var connection = mysql.createConnection({ host: host_ip, user: db_username, password: db_password, database : master_db });
	connection.connect();
	
	var query = "SELECT movietickets_id, movie_title, DATE_FORMAT(release_date,'%Y-%m-%d') as release_date, youtube_url, cover_image, cast, director, synopsis, genre, studio_name, extra4, twitter, hashtag, extra2, extra3, extra1, id FROM fq_movie_master where "+temp_val+" movietickets_id = "+details.ticket_id;
	console.log(query);
	connection.query(query, function(err,rows){
		connection.end();
		if (err){
			res.send(err);
		}else{
			res.send(rows);
		}          
	});
}

exports.addToMovieMaster = function(req, res) {
	
	var details = req.body;
	
	var connection = mysql.createConnection({ host: host_ip, user: db_username, password: db_password, database : master_db });
	connection.connect();
	
	var query = "SELECT * FROM movie_review_queue where movietickets_id = "+details.movietickets_id;
	
	connection.query(query, function(err,rows){
		if (err){
			res.send(err);
		}else{
			var query = "SELECT id from fq_movie_master ORDER BY id desc LIMIT 1";
			connection.query(query, function(err,rows_1){

				var date = new Date(rows[0].release_date);
				var max_id = parseInt(rows_1[0].id)+1;
				var temp = {};
				temp.id = max_id;
				temp.cover_image = rows[0].cover_image;
				temp.cast = rows[0].cast;
				temp.director = rows[0].director;
				temp.release_date = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();
				temp.synopsis = rows[0].synopsis;
				temp.genre = rows[0].genre;
				temp.movie_title = rows[0].movie_title;
				temp.studio_name = rows[0].studio_name;
				temp.extra1 = rows[0].extra1;
				temp.extra4 = rows[0].extra4;
				temp.movietickets_id = rows[0].movietickets_id;
				temp.webedia = "1";
				temp.multiple_release_date = rows[0].multiple_release_date;
				temp.multiple_release_note = rows[0].multiple_release_note;
				temp.running_time = rows[0].running_time;
				temp.official_site = rows[0].official_site;
					
				connection.query('insert into fq_movie_master SET ?', temp, function (err, result) {
					if (err){
						res.send(err);
					}else{
						var temp = {};
						temp.cover_image = rows[0].cover_image;
						temp.cast = rows[0].cast;
						temp.director = rows[0].director;
						temp.release_date = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();
						temp.synopsis = rows[0].synopsis;
						temp.genre = rows[0].genre;
						temp.movie_title = rows[0].movie_title;
						temp.studio_name = rows[0].studio_name;
						temp.extra1 = rows[0].extra1;
						temp.extra4 = rows[0].extra4;
						temp.movietickets_id = rows[0].movietickets_id;
						temp.webedia = "insert";
						temp.multiple_release_date = rows[0].multiple_release_date;
						temp.multiple_release_note = rows[0].multiple_release_note;
						temp.running_time = rows[0].running_time;
						temp.official_site = rows[0].official_site;
						connection.query('insert into review_audit_log SET ?', temp, function (err, result_1) {
							if (err) {
								throw err;
							}
							connection.query('DELETE FROM movie_review_queue where movietickets_id = "'+details.movietickets_id+'"', function (err, result_2) {
								connection.end();
								if (err) throw err;
								res.send(result);
							});
						});
					}
				});
			});

		}           
	});
}


exports.updateToMovieMaster = function(req, res) {
	
	var details = req.body;
	
	var connection = mysql.createConnection({ host: host_ip, user: db_username, password: db_password, database : master_db });
	connection.connect();
	
	var query = "SELECT * FROM movie_review_queue where movietickets_id = "+details.movietickets_id;
	connection.query(query, function(err,rows){
		connection.end();
		if (err){
			res.send(err);
		}else{
			var date = new Date(rows[0].release_date);
			var temp_arr = [];
			temp_arr.push(rows[0].cover_image);
			temp_arr.push(rows[0].cast);
			temp_arr.push(rows[0].director);
			temp_arr.push(date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate());
			temp_arr.push(rows[0].synopsis);
			temp_arr.push(rows[0].genre);
			temp_arr.push(rows[0].movie_title);
			temp_arr.push(rows[0].studio_name);
			temp_arr.push(rows[0].extra1);
			temp_arr.push(rows[0].extra4);
			temp_arr.push(rows[0].movietickets_id);
			temp_arr.push("1");
			temp_arr.push(rows[0].multiple_release_date);
			temp_arr.push(rows[0].multiple_release_note);
			temp_arr.push(rows[0].running_time);
			temp_arr.push(rows[0].official_site);
			temp_arr.push(details.internalID);
			console.log(temp_arr);
			connection.query('update fq_movie_master SET cover_image = ?, cast = ?, director = ?, release_date = ?, synopsis = ?, genre = ?, movie_title = ?, studio_name = ?, extra1 = ?, extra4 = ?, movietickets_id = ?, webedia = ?, multiple_release_date = ?, multiple_release_note = ?, running_time = ?, official_site = ? where id = ?', temp_arr, function (err, result) {
				if (err) {
					console.log("If errorrrr"+err);
				}
				var temp = {};
				temp.cover_image = rows[0].cover_image;
				temp.cast = rows[0].cast;
				temp.director = rows[0].director;
				temp.release_date = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();
				temp.synopsis = rows[0].synopsis;
				temp.genre = rows[0].genre;
				temp.movie_title = rows[0].movie_title;
				temp.studio_name = rows[0].studio_name;
				temp.extra1 = rows[0].extra1;
				temp.extra4 = rows[0].extra4;
				temp.movietickets_id = rows[0].movietickets_id;
				temp.webedia = "update";
				temp.multiple_release_date = rows[0].multiple_release_date;
				temp.multiple_release_note = rows[0].multiple_release_note;
				temp.running_time = rows[0].running_time;
				temp.official_site = rows[0].official_site;
				console.log(JSON.stringify(temp));
				connection.query('insert into review_audit_log SET ?', temp, function (err, result_1) {
					if (err) {
						console.log("If errorrrrdfd"+JSON.stringify(err));
					}
					connection.query('DELETE FROM movie_review_queue where movietickets_id = "'+details.movietickets_id+'"', function (err, result_2) {
						connection.end();
						
						if (err) throw err;
						res.send(result_2);
					});
				});
			});
		}          
	});
}
exports.gettrailerdata = function(req, res) {
	var details=req.body;

	var connection = mysql.createConnection({ host: host_ip, user: db_username, password: db_password, database : master_db});
	connection.connect();
	
	var query = "select ft.id, ft.movie_id, ft.youtube_url, ft.trailer_type, ft.trailer_version, ft.trailer_tag, fm.movie_title, DATE_FORMAT(fm.release_date,'%Y-%m-%d') as release_date, ft.trailer_indicator,ft.trailer_source,ft.trailer_runtime from fq_trailers ft, fq_movie_master fm where ft.movie_id=fm.id and fm.release_date >= CURDATE() ORDER BY release_date ASC ";
	connection.query(query, function(err,rows){
		connection.end();
		if (err){
			res.send(err);
		}else{
			res.send(rows);
			console.log(rows);
		}          
	});
 
}
exports.updateToMovieID=function(req,res) {
    var details=req.body;

	var connection = mysql.createConnection({ host: host_ip, user: db_username, password: db_password, database : master_db});
	connection.connect();
	
	var query = "update fq_trailers SET trailer_type='"+details.trailer_type+"',tralier_format='"+details.tralier_format+"',Large_format = '"+details.Large_format +"', red_band= '"+details.red_band +"',version= '"+details.version +"', comments= '"+details.comments +"', run_time= '"+details.run_time +"' where id="+details.movie_id;
	console.log("look at me"+JSON.stringify(query));
	/*connection.query(query, function(err,rows){
		connection.end();
		if (err){
			res.send(err);
		}else{
			res.send(rows);
			console.log(rows);
		}          
	});*/
}
exports.deletemovieReview=function(req,res) {
    var details=req.body;

	var connection = mysql.createConnection({ host: host_ip, user: db_username, password: db_password, database : master_db});
	connection.connect();
	
	var query = 'DELETE FROM movie_review_queue where ticket_id = "'+details.ticket_id+'"'; 
	console.log("look at me"+JSON.stringify(query));
	/*connection.query(query, function(err,rows){
		connection.end();
		if (err){
			res.send(err);
		}else{
			res.send(rows);
			console.log(rows);
		}          
	});*/
}
exports.newcontent_data=function(req,res) {
    var details=req.body;

	var connection = mysql.createConnection({ host: host_ip, user: db_username, password: db_password, database : master_db});
	connection.connect();
	
	var query = "select fm.studio_name, fm.movie_title, ft.trailer_tag, ft.trailer_runtime from fq_trailers ft, fq_movie_master fm where ft.trailer_type='official' and fm.id = ft.movie_id limit 10"; 
	//console.log("look at me"+JSON.stringify(query));
	connection.query(query, function(err,rows){
		connection.end();
		if (err){
			res.send(err);
			console.log("djdsgfk"+ err);
		}else{
			console.log(rows);
			res.send(rows);
			
		}          
	});
}

exports.moviedetails=function(req,res) {
    var details=req.body;

	var connection = mysql.createConnection({ host: host_ip, user: db_username, password: db_password, database : master_db});
	connection.connect();
	
	var query = "select  fm.movie_title from  fq_movie_master fm where fm.release_date >= CURDATE() and  fm.release_date <> '2040' "; 
	//console.log("look at me"+JSON.stringify(query));
	connection.query(query, function(err,rows){
		connection.end();
		if (err){
			res.send(err);
			console.log("djdsgfk"+ err);
		}else{
			console.log(rows);
			res.send(rows);
			
		}          
	});
}
exports.save_moviedetails=function(req,res) {
    var details=req.body;
console.log("im who i am"+JSON.stringify(details))
	var connection = mysql.createConnection({ host: host_ip, user: db_username, password: db_password, database : master_db});
	connection.connect();
	
	var query = "update fq_movie_master SET dsfs='"+details.contentdate+"',dsf='"+details.contentweek+"', hsjch= '"+details.contentyear +"',fdf = '"+details.selectedvalue +"', fdsf= '"+details.foo +"'"; 
	//console.log("look at me"+JSON.stringify(query));
	connection.query(query, function(err,rows){
		connection.end();
		if (err){
			res.send(err);
			console.log("djdsgfk"+ err);
		}else{
			console.log(rows);
			res.send(rows);
			
		}          
	});
}

 