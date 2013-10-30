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
var request = require('request');
var appId = 'APP_ID';
var appSecret = 'APP_SECRET';
var bearerToken;


// authenticates by getting bearer token from facebook using appId and appSecret
// from above 
function authenticate (cb) {
	if (bearerToken) return cb(null, bearerToken); // return cached copy

	var url = 'https://graph.facebook.com/oauth/access_token?client_id=' + appId
					+ '&client_secret=' + appSecret
					+ '&grant_type=client_credentials';

	// POST to twitter REST endpoint to get Bearer Token
	request.post(url, function (err, res, body) {
		if (err) return cb(err);

		// body looks like 'access_token=asdfasfdwerwexzcffwqfafsdafs'
		bearerToken = body.substring(body.indexOf('=') + 1);

		cb(null, bearerToken);
	});
}


// query facebook's search API getting results related to keyword
exports.getResults = function (keyword, limit, cb) {
	authenticate(function (err, bearer) {
		var options = {
			url: 'https://graph.facebook.com/search',
			qs: {
				'q': keyword,
				'limit': limit,
				'fields': 'message',
				'access_token': bearer
			}
		};

		request.get(options, function (err, res, body) {
			if (err) return cb(err);

			if (res.statusCode != 200) {
        if (res.statusCode == 400) {
          var msg = 'Facebook returned 400. Make sure you include your App ID and App Secret.';
        }
				return cb({ error: msg });
			}

      var results = JSON.parse(body);
      var posts = results.data.map(function (post) {
        return post.message;
      });

			return cb(null, posts);
		});
	});
};
