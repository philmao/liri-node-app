var keys = require("./keys.js");

// FS setup
var fs = require('fs');

// Datetime module setup
var dateTime = require('date-time');

// Line reader module setup
// var lineReader = require('line-reader');

// Twitter setup
//
var Twitter = require('twitter');

var client = new Twitter({
  consumer_key: keys.twitterKeys.consumer_key,
  consumer_secret: keys.twitterKeys.consumer_secret,
  access_token_key: keys.twitterKeys.access_token_key,
  access_token_secret: keys.twitterKeys.access_token_secret
});

var screen_name = "mao_philip";

// Spotify module setup
// 
var Spotify = require('node-spotify-api');

var spotify = new Spotify({
  id: keys.spotifyKeys.id,
  secret: keys.spotifyKeys.secret
});

// Request module setup
//
var request = require("request");

// Main
var command = process.argv[2];

var query = "";

// for inputs having multiple words (with quotes)
if(process.argv[3] != undefined) {
	query = process.argv[3];
}
// for inputs having multiple words (no quotes)
if(process.argv[4] != undefined) {
	for(var i = 4; i < process.argv.length; i++) {
		query += ' ' + process.argv[i];
	}
}
console.log(query);

var logFile = function(text) {

	var d = dateTime();
	var newText = d + ": " + text + "\n";

	fs.appendFile("log.txt", newText, function(err) {

	  // If an error was experienced we say it.
	  if (err) {
	    console.log(err);
	  }

	});
}

var doAction = function(command, query) {

	switch (command) {
		case 'my-tweets':
			// console.log("my-tweets");

			var params = {screen_name: screen_name};
			client.get('statuses/user_timeline', params, function(error, tweets, response) {
			  if (!error) {
			  	var maxTweets = tweets.length;
			  	if(maxTweets > 20) {
			  		maxTweets = 20;
			  	}
			    // console.log(tweets);
			    for(var i = 0; i < maxTweets; i++) {
			    	console.log(tweets[i].created_at);
			    	console.log(tweets[i].text + "\n");

			    }
			  }
			});
			logFile(command);
			break;
		
		case 'spotify-this-song':
			console.log("spotify-this-song");

			if(query === "") {
				query = "The Sign";
				console.log("Using default song...")
			}
			// console.log("Track: " + query);

			spotify.search({ type: 'track', query: query, limit: 20 }, function(err, data) {
				if (err) {
					return console.log('Error occurred: ' + err);
				}
				// console.log(data.tracks.items);
				for(var i = 0; i < data.tracks.items.length; i++) {
					if(data.tracks.items[i].name === query) {
						console.log("Song: " + data.tracks.items[i].name);
						console.log("Artist(s): " + data.tracks.items[i].artists[0].name);
						console.log("Preview link: " + data.tracks.items[i].href);
						console.log("Album: " + data.tracks.items[i].album.name);
						break;
					}
				}
			});
			var logText = command + ' "' + query + '"';
			logFile(logText);
			break;

		case 'movie-this':
			console.log("movie-this");

			// for inputs having multiple words (with quotes)
			if(query === "") {
				query = "Mr Nobody";
			}

			var url = "http://www.omdbapi.com/?t=" + query + "&y=&plot=short&apikey=40e9cece";
			console.log(url);

			request(url, function(error, response, body) {

			  // If the request is successful (i.e. if the response status code is 200)
			  if (!error && response.statusCode === 200) {

			    // Parse the body of the site and recover just the imdbRating
			    // (Note: The syntax below for parsing isn't obvious. Just spend a few moments dissecting it).
			    // console.log(body);
			    console.log("The movie's title is: " + JSON.parse(body).Title);
			    console.log("The movie's year is: " + JSON.parse(body).Year);
			    console.log("The movie's IMDB rating is: " + JSON.parse(body).imdbRating);
			    console.log("The movie's country is: " + JSON.parse(body).Country);
			    console.log("The movie's language is: " + JSON.parse(body).Language);
			    console.log("The movie's plot is: " + JSON.parse(body).Plot);
			    console.log("The movie's actors is/are: " + JSON.parse(body).Actors);
			    console.log("The movie's Rotten Tomatoes rating is: " + JSON.parse(body).Ratings[1].Value);

			  }
			});
			var logText = command + ' "' + query + '"';
			logFile(logText);
			break;

		case 'do-what-it-says':
			console.log("do-what-it-says");
			logFile(command);

			fs.readFile("random.txt", "utf8", function(error, data) {
				// console.log(data);
				var array = data.split(",");
				// console.log(array);

				if(array[0] === 'my-tweets') {
					doAction(array[0], "");
				}
				else {
					var input = array[1].replace(/^"(.+(?="$))"$/, '$1');
					// console.log(input);
					doAction(array[0], input);	
				}
			});

			// lineReader.eachLine('random.txt', function(line, last) {
			// 	console.log(line);
			// 	var array = line.split(",");
			// 	console.log(array);

			// 	if(array[0] === 'my-tweets') {
			// 		doAction(array[0], "");
			// 	}
			// 	else {
			// 		var input = array[1].replace(/^"(.+(?="$))"$/, '$1');
			// 		console.log(input);
			// 		doAction(array[0], input);	
			// 	}
			// });
			break;

		default:
			console.log("error: invalid command");
			break;
	}
}

doAction(command, query);