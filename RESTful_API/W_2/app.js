'use strict';
// FIXME require statements at the top
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
// FIXME constants naming
// FIXME separate constants and global variables
const Constant = {
    PORT: 8080,
    REQEXP: {
        USERNAME: /^[0-9a-z]{8,16}$/i,
        PASSWORD: /^([0-9a-z]{4,12})$/,
        INDEX: /^([0-9]){,10}$/,
        limit: /^([0-9]){,10}$/,
    },
};

var accountCount = 1000000;
var accountsByUserName = {};
var accountsByUserId = {};

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
    if(!accountsByUserId[accountId]) {
        console.log('Get account info error: invalid id');

        res.status(404).json({
            id: accountId,
        });
        return;
    }

    respInfo = {
        id: accountsByUserId[accountId].id,
        username: accountsByUserId[accountId].username,
        createdAt: accountsByUserId[accountId].createdAt,
    };

    // NOTE consider assign variable first
    res.status(200).json(respInfo);
});

app.post('/accounts', [
    checkCreateParams,
    createAccount,
]);

app.get('/accounts>', [
    checkQueryParams,
    createAccount,
]);

app.listen(Constant.PORT, function() {
    console.log('Listen on ' + Constant.PORT);
});

function checkCreateParams(req, res, next) {
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
    if(accountsByUserName[username.toLowerCase()]) {
        console.log('Create account fail: conflict.');

        res.status(409).json({
            username: username,
        });
        return;
    }

    next();
}

function createAccount(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var respInfo;

    addAccount(username, password);

    // NOTE console.log already contains linebreak
    console.log('New account created successfully.\r');
    console.log('Info: ' + JSON.stringify(accountsByUserName[username.toLowerCase()], null, 4));

    respInfo = {
        message: 'Account created',
        // NOTE why -1 ?
        id: accountsByUserName[username.toLowerCase()].id.toString(),
    };

    res.status(201).json(respInfo);
}

function addAccount(username, pwd) {
    var info = {
        id: accountCount,
        username: username,
        createdAt: new Date().getTime(),
        password: pwd,
    };

    // FIXME only store id in usernameMap
    accountsByUserName[username.toLowerCase()] = info;
    accountsByUserId[accountCount.toString()] = info;
    accountCount += 1;
}

function checkQueryParams(req, res, next) {
    var usernames = req.query.usernames;
    var index = req.query.index;
    var limit = req.query.limit;

    if(typeof usernames === 'undefined') {
        res.status(400).send('Invalid usernames');
    }

    if(typeof index === 'undefined') {
        res.status(400).send('Invalid index');
    }

    if(typeof limit === 'undefined') {
        res.status(400).send('Invalid index');
    }
}
