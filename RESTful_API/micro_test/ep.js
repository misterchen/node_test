var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var elasticsearch = require('elasticsearch');
const Constant = {
    ELASTIC: {
        HOST: '54.183.152.41:9200',
    },
    EXPRESS: {
        PORT: 8080,
    },
};

var elasticClient = new elasticsearch.Client({
    host: Constant.ELASTIC.HOST,
    log: 'trace',
});
app.use(bodyParser.json());

app.post('/parser/config', function(req, res) {
    if(!typeof req.body.data === 'Array' || !req.body.dataLength || !req.body.modelID || !req.body.type) {
        res.status(400).send('Invalid parameters');
        return;
    }

    console.log(req.body);

    for(var x in req.body.data) {
        checkConfigPara(req.body.data[x], res);
    }

    elasticClient.index({
        index: 'parser',
        type: 'config',
        body: res.body,
    }, function(err, ela_res) {
        if(err) {
            console.log(err);
            res.status(500).send('DB fail');
            return;
        }
        res.status(200).send('Config setting success');
    });
});

app.listen(Constant.EXPRESS.PORT, function() {
    console.log('Listen on ' + Constant.EXPRESS.PORT);
});

function checkConfigPara(data, res) {
    if(!data.type || !data.key || !data.byteLength) {
        res.status(400).send('Invalid parameters of "data"');
    }

    if(data.type === 'skip') {

    }
    else if(data.type === 'string') {

    }
    else if(data.type === 'int') {

    }
    else {
        res.status(400).send('Invalid parameters');
    }

}
