var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    host: '54.183.152.41:9200',
    log: 'trace',
});

client.ping({
    requestTimeout: 1000,
}, function(error) {
    if(error) {
        console.trace('elasticsearch cluster is down!');
    }
    else {
        console.log('All is well');
    }
});

client.explain({
  // the document to test
  index: 'myindex',
  type: 'mytype',
  id: '1',

  // the query to score it against
  q: 'field:value'
}, function (error, response) {
  // ...
});
