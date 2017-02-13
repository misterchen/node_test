'use strict';
// FIXME require statements at the top
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
// FIXME constants naming
// FIXME separate constants and global variables
var port = 8080;
var accountCount = 1000000;
var accountsByUserName = {};
var accountsByUserId = {};
var reqexpForUserName = /^[0-9a-z]{8,16}$/i;
var reqexpForPassword = /^([0-9a-z]{4,12})$/;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// FIXME function at bottom
// FIXME middlewares
app.get('/accounts/:ID', function(req, res) {
    var accountId = req.params.ID;

    // Check accountId
    // NOTE consider testing type first
    // NOTE consider using automatic boolean conversion instead of typeof test
    // FIXME don't test ID with username regex
    if(!(reqexpForUserName.test(req.params.ID)) || typeof(accountsByUserId[accountId]) === 'undefined') {
        console.log('Get account info error: invalid id');

        res.status(404).json({
            id: accountId,
        });
        return;
    }

    // NOTE consider assign variable first
    res.status(200).json({
        id: accountsByUserId[accountId].id,
        username: accountsByUserId[accountId].username,
        createdAt: accountsByUserId[accountId].createdAt,
    });
});

app.post('/accounts', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    console.log(req.body.username, req.body.password + '\r');

    // Check username
    // FIXME reqexpForPassword => typo
    if(typeof username !== 'string' || !(reqexpForPassword.test(username))) {
        console.log('Create account fail: invalid username.');

        res.status(400).json({
            message: 'Invalid create accounts request',
            field: 'username',
        });
        return;
    }

    // Conflict
    // FIXME move conflict below password check (might contain DB access)
    // FIXME not necessary with this id generation mechanism
    // NOTE consider using automatic boolean conversion instead of typeof test
    if(typeof(accountsByUserName[username.toLowerCase()]) !== 'undefined') {
        console.log('Create account fail: conflict.');

        res.status(409).json({
            username: username,
        });
        return;
    }

    // Check password
    if(typeof(password) !== 'string' || !(reqexpForPassword.test(password))) {
        console.log('Create account fail: invalid password.');

        res.status(400).json({
            message: 'Invalid create accounts request',
            field: 'password',
        });
        return;
    }

    addAccount(username, password);
    // NOTE console.log already contains linebreak
    console.log('New account created successfully.\r');
    console.log('Info: ' + JSON.stringify(accountsByUserName[username.toLowerCase()], null, 4) + '\r');

    res.status(201).json({
        message: 'Account created',
        // NOTE why -1 ?
        id: (accountCount - 1).toString(),
    });
});

app.listen(port, function() {
    console.log('Listen on ' + port);
});

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
