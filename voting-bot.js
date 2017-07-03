/**
 * https://steemit.com/@jongeun
 */

var fs = require('fs');
var steem = require('steem');
var log4js = require('log4js');
var logger = log4js.getLogger('VOTING-BOT');
logger.setLevel('DEBUG');

var SECOND = 1000;
var CONFIG_FILEPATH = "./configs/config.json";

var config = require(CONFIG_FILEPATH);

var user = require('./configs/user.json');
var wif = initUser();
var query = {
		tag: config.tag,
		limit: 100
}
//startBot();
setInterval(function() {
	fs.readFile(CONFIG_FILEPATH, 'utf8', function (err, data) {
		  if (err) throw err;
		  config = JSON.parse(data);
		  query.tag = config.tag
		  startBot();
	});
}, config.monitoringPeriod * SECOND);



function startBot(){
	steem.api.getDiscussionsByCreated(query, function(err, getDiscussionsByCreatedResult) {
		if(!err && getDiscussionsByCreatedResult){
			var availableDiscussions = [];
			for(var i=0; i<getDiscussionsByCreatedResult.length; i++){
				
				var discussion = getDiscussionsByCreatedResult[i];
				
				var createdTime = Date.parse(discussion.created);
				
				if(config.lastVotingTimestamp < createdTime){
					
					availableDiscussions.push({
						author: discussion.author,
						permlink:discussion.permlink,
						memo : "https://steemit.com"+discussion.url,
						postCreatedAt: createdTime
					});
				}
			}
			getAccountInfo(availableDiscussions);
		}
		
	});
	function getAccountInfo(availableDiscussions){
		
		var users = [];
		var userFollowers = [];
		for(var i=0; i<availableDiscussions.length; i++){
			users.push(availableDiscussions[i].author);
		}
		var count = 0;
		steem.api.getAccounts(users, function(err, getAccountsResult) {
			if(!err && getAccountsResult){
				for(var i=0; i<getAccountsResult.length; i++){
					var account = getAccountsResult[i];
					steem.api.getFollowCount(account.name, function(err, getFollowCountResult) {
						if(!err && getFollowCountResult){
							
							userFollowers.push({
								account: getFollowCountResult.account,
								followerCount: getFollowCountResult.follower_count
							});
							count++;
							if(count == getAccountsResult.length){
								availableDiscussions.sort(function (a, b) { 
									return a.author < b.author ? -1 : a.author > b.author ? 1 : 0;  
								});
								userFollowers.sort(function (a, b) { 
									return a.account < b.account ? -1 : a.account > b.account ? 1 : 0;  
								}); 
								generateVortingCandidate(availableDiscussions, userFollowers);
								
							}
						}
					});
				}
				
			}
		});
	}
}
function generateVortingCandidate(availableDiscussions, userFollowers){
	
	vortingCandidateFeeds = [];
	for(var i=0; i<availableDiscussions.length; i++){
		availableDiscussions[i].followerCount = userFollowers[i].followerCount;
		vortingCandidateFeeds.push(availableDiscussions[i]);
	}
	vortingCandidateFeeds.sort(function (a, b) { 
		return a.followerCount < b.followerCount ? -1 : a.followerCount > b.followerCount ? 1 : 0;  
	});
	config.lastVotingTimestamp = vortingCandidateFeeds[0].postCreatedAt;
	var str = JSON.stringify(config, null, 4);	
	
	
	logger.info('보팅 후보: '+vortingCandidateFeeds[0].memo);
	fs.writeFile(CONFIG_FILEPATH, str, "utf8", function (err) {
		
    });
	vote(vortingCandidateFeeds[0]);
	
}

function vote(postInfo){
	var max = config.maxVotingPower * 100;
	var min = config.minVotingPower * 100;
	votingPower = Math.floor(Math.random()*(max-min+1)) +min;

	
	postInfo.votingPower = votingPower;
	logger.info('보팅 파워: '+(votingPower/100));
	
	steem.broadcast.vote(wif, user.name, postInfo.author, postInfo.permlink, votingPower, function(err, voteResult) {
		if(!err && voteResult){

			logger.info('보팅 성공: '+postInfo.memo);
			createComment(postInfo);
		}else{
			logger.info('보팅 실패: '+err);
		}
	});
}

function initUser(){
	return steem.auth.toWif(user.name, user.password, 'posting');
}
function createComment(postInfo){
	
	var commentPermlink = steem.formatter.commentPermlink(postInfo.author, postInfo.permlink);
	postInfo.votingPower /= 100;
	body = 'This post received a '+postInfo.votingPower+'% upvote from @'+user.name+' thanks to @'+postInfo.author+'! For more information, [click here]('+config.introductionLink+')!';
	steem.broadcast.comment(wif,  postInfo.author, postInfo.permlink, user.name, commentPermlink, "", body, "", function(err, result) {
		if(!err && result){
			logger.info('리플 작성 성공: '+body);
		}else{
			logger.info('리플 작성 실패: '+err);
		}
	});
	
}

