#! /usr/bin/env node
var twitter = require('ntwitter');
var config = require("./config.js");

var twit = new twitter(config.keys);

var abbrs = config.abbrs;

var userList = config.IDs;

twit.stream('statuses/filter', {"follow": userList.join(",")}, function(stream){
	stream.on("data", function(data){
		console.log("TWEET: <" + data.text + "> from " + data.user.screen_name + " (" + data.user.name + ")");
		var length = data.text.length;
		var corrections = [];
		if(data.text.indexOf("#CalloutBot") > -1){
			return;
		}
		for(var i = 0; i < abbrs.length; i++){
			var regex = new RegExp("\\b" + abbrs[i].short + "\\b", "i");
			if(data.text.search(regex) > -1){
				var extended = data.text.replace(abbrs[i].patten, abbrs[i].full);
				if(extended.length <= 140){
					corrections.push(abbrs[i]);
				}
			}
		}
		if(corrections.length > 0){
			var text = "@" + data.user.screen_name + " You used " +
			((abbrs.length == 1) ? "an abbreviation" : (abbrs.length + " abbreviations")) +
			" with " + (140 - length) + " characters left. Remember: \"" +
			((abbrs.length == 1) ?
				(corrections[0].short + "\" is not a word.") :
				(corrections[0].short + "\" and \"" + corrections[1].short + "\" are not words.")
			) + " #CalloutBot";
			twit.updateStatus(text, {in_reply_to_status_id: data.id_str}, function(){
				console.log("Correction sent!");
			});
		}
	});
	stream.on("error", function(err){
		console.error(err);
	});
});

process.stdin.resume();