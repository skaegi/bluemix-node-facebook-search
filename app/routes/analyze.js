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
var _ = require('underscore');
var request = require('request');
var facebook = require('../lib/facebook')

// query facebook search API to get recent posts related to specified keyword
// then send posts through either the Name or Company Text analytics service. 
// once analytic service processes the posts, do a count of the number of mentions of specific
// companies or names and return JSON with that information
exports.get = function (req, res) {
	facebook.getResults(req.params.keyword, 100, function (err, posts) {
    if (err) {
      console.log(err);
      return res.json(err);
    }

    // check requested type of analytics to be done
    var annotationType;

    if (req.params.option == 'companies') {
      annotationType = ['com.ibm.langware.en.Company'];
    } else if (req.params.option == 'people') {
      annotationType = ['com.ibm.langware.en.Person'];
    }

    var data = {
      'texts': posts, 
      'annotations': annotationType
    };

    // extract company names or people names from posts
    extractNames(req.params.option, data, function (err, response) {
      if (err) return res.json(err);

      countMentions(response, function (err, result) {
        if (err) return res.json(err);
        res.json(result);
      });
    });
  });
};

// query analytics service to extract company or people names from posts
function extractNames(type, data, cb) {
  // choose correct analytics service to hit
  var url = app.get('company_analytics_url');
  
  if (type == 'people') {
    url = app.get('name_analytics_url');
  }

  if (!url) {
    return cb({
      error: 'No service URL found. Make sure you have bound the correct services to your app.'
    });
  }

  var options = {
    url: url,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    json: data
  };

  // post to analytics service
  request.post(options, function (err, response, body) {
    if (err) {
      console.log('Error extracting companies:');
      console.log(err);
      return cb(err);
    }

    if (response.statusCode != 200) {
      return cb({ error: 'Status code: ' + response.statusCode });
    }

    return cb(null, response);
  });
}


// count number of mentions of company names after returned by IBM Text Analytics service
function countMentions(response, cb) {
  var posts = response.body;    // posts marked up with analytics metadata
  var histogram = new Object(); // used to count occurrences of company or people name

  // iterate through each post to count number of mentions of names contained within all of the posts
  posts.forEach(function (post) {
    var analyzed = post.analyticsResults[0].annotations;

    analyzed.forEach(function (result) {
      var name = result['covered-text'].toLowerCase();
      histogram[name] = (histogram[name] == null) ?  1 : histogram[name] + 1;
    });
  });

  cb(null, {
    labels: _.keys(histogram), 
    response: _.values(histogram)
  });
}
