'use strict';
// FIXME require statements at the top
var express = require('express');
var bodyParser = require('body-parser');
var redis = require('redis');
// FIXME constants naming
// FIXME separate constants and global variables
const Constant = {
    PORT: 8080,
    REQEXP: {
        USERNAME: /^[0-9a-z]{8,16}$/i,
        PASSWORD: /^([0-9a-z]{4,12})$/,
    },
};

var app = express();
var clientRedis = redis.createClient();
var accountCount = 1000000;

clientRedis.

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// FIXME function at bottom
// FIXME middlewares
app.get('/accounts/:ID', function(req, res) {
    var accountId = req.params.ID;
    var respInfo;

    // Check accountId
    // NOTE consider testing type first
    // NOTE consider using automatic boolean conversion instead of typeof test
    // FIXME don't test ID with username regex
    clientRedis.get(accountId, function(errRedis, resRedis) {
        if(errRedis) {
            console.log('Error Redis: ' + errRedis);

            res.status(500).json({
                message: 'DB error',
            });
            return;
        }

        if(!resRedis) {
            console.log('Get account info error: invalid id');

            res.status(404).json({
                id: accountId,
            });
            return;
        }

        respInfo = {
            id: resRedis.id,
            username: resRedis.username,
            createdAt: resRedis.createdAt,
        };

        // NOTE consider assign variable first
        res.status(200).json(respInfo);
    });
});

app.post('/accounts', [
    checkParams,
    createAccount,
]);

app.listen(Constant.PORT, function() {
    console.log('Listen on ' + Constant.PORT);
});

function checkParams(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    console.log(req.body.username, req.body.password + '\r');

    // Check username
    // FIXME reqexpForPassword => typo
    if(typeof username !== 'string' || !(Constant.REQEXP.USERNAME.test(username))) {
        console.log('Create account fail: invalid username.');

        res.status(400).json({
            message: 'Invalid create accounts request',
            field: 'username',
        });
        return;
    }

    // Check password
    if(typeof(password) !== 'string' || !(Constant.REQEXP.PASSWORD.test(password))) {
        console.log('Create account fail: invalid password.');

        res.status(400).json({
            message: 'Invalid create accounts request',
            field: 'password',
        });
        return;
    }

    // Conflict
    // FIXME move conflict below password check (might contain DB access)
    // FIXME not necessary with this id generation mechanism
    // NOTE consider using automatic boolean conversion instead of typeof test
    clientRedis.get(username.toLowerCase(), function(errRedis, resRedis) {
        if(errRedis) {
            console.log('Error Redis: ' + errRedis);

            res.status(500).json({
                message: 'DB error',
            });
            return;
        }

        if(resRedis) {
            console.log('Create account fail: conflict.');

            res.status(409).json({
                username: username,
            });
            return;
        }

        next();
    });
}

function createAccount(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var nowId;

    nowId = addAccount(username, password, done);

    function done() {
        var respInfo;

        clientRedis.hgetall(nowId, function(errRedis, resRedis) {
            if(errRedis) {
                console.log('Error Redis: ' + errRedis);
            }
            console.log('Info: ' + JSON.stringify(resRedis, null, 4));
        });
        // NOTE console.log already contains linebreak
        console.log('New account created successfully.\r');

        respInfo = {
            message: 'Account created',
            // NOTE why -1 ?
            id: nowId,
        };

        res.status(201).json(respInfo);
    }
}

function addAccount(username, pwd, callback) {
    var info = {
        id: accountCount.toString(),
        username: username,
        createdAt: new Date().getTime(),
        password: pwd,
    };

    accountCount += 1;

    // FIXME only store id in usernameMap
    clientRedis.hmset(info.id, info, function() {
        clientRedis.set(username.toLowerCase(), info.id, callback);
        accountCount += 1;
    });

    return info.id;
}
