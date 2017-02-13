// NOTE strict mode is better
// FIXME require statements at the top
var express = require('express');
var bodyParser = require('body-parser');

// FIXME constants naming
// FIXME separate constants and global variables
const Constant = {
    PORT : 8080,
    REGEX : {
        USERNAME : /^[0-9a-z]{8,16}$/i,
        PASSWORD : /^([0-9a-z]{4,12})$/
    }
};

var accountCount = 1000000;
var accountsByUserName = {};
var accountsByUserId = {};

var app = express();

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
    if (typeof accountId !== 'string' || !accountId ||
        !accountsByUserId[accountId]) {
        console.log('Get account info error: invalid id');

        res.status(404).json({
            id: accountId,
        });
        return;
    }

    var account = accountsByUserId[accountId];

    // NOTE consider assign variable first
    res.status(200).json({
        id: account.id,
        username: account.username,
        created_at: account.createdAt,
    });
});

app.post('/accounts', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    console.log(req.body.username, req.body.password);

    // Check username
    if(typeof username !== 'string' || !(Constant.REGEX.USERNAME.test(username))) {
        console.log('Create account fail: invalid username.');

        res.status(400).json({
            message: 'Invalid create accounts request',
            field: 'username',
        });
        return;
    }

    // Check password
    if(typeof(password) !== 'string' || !(Constant.REGEX.PASSWORD.test(password))) {
        console.log('Create account fail: invalid password.');

        res.status(400).json({
            message: 'Invalid create accounts request',
            field: 'password',
        });
        return;
    }

    // Conflict
    // FIXME move conflict below password check (might contain DB access)
    // NOTE consider using automatic boolean conversion instead of typeof test
    // if(accountsByUserName[username.toLowerCase()]) {
    //     console.log('Create account fail: conflict.');
    //
    //     res.status(409).json({
    //         username: username,
    //     });
    //     return;
    // }

    addAccount(username, password);
    // NOTE console.log already contains linebreak
    console.log('New account created successfully.');
    console.log('Info: ' + JSON.stringify(accountsByUserName[username.toLowerCase()], null, 4));

    res.status(201).json({
        message: 'Account created',
        // NOTE why -1 ?
        id: (accountCount - 1).toString(),
    });
});

app.post('/accounts', [
    function checkParams(req, res, next) {
        var username = req.body.username;
        var password = req.body.password;
        console.log(req.body.username, req.body.password);

        // Check username
        if(typeof username !== 'string' || !(Constant.REGEX.USERNAME.test(username))) {
            console.log('Create account fail: invalid username.');

            res.status(400).json({
                message: 'Invalid create accounts request',
                field: 'username',
            });
            return;
        }

        // Check password
        if(typeof(password) !== 'string' || !(Constant.REGEX.PASSWORD.test(password))) {
            console.log('Create account fail: invalid password.');

            res.status(400).json({
                message: 'Invalid create accounts request',
                field: 'password',
            });
            return;
        }

        next();
    },
    function createAccount(req, res, next) {
        var username = req.body.username;
        var password = req.body.password;
        addAccount(username, password);
        // NOTE console.log already contains linebreak
        console.log('New account created successfully.');
        console.log('Info: ' + JSON.stringify(accountsByUserName[username.toLowerCase()], null, 4));

        res.status(201).json({
            message: 'Account created',
            // NOTE why -1 ?
            id: (accountCount - 1).toString(),
        });
    }
]);

app.listen(Constant.PORT, function() {
    console.log('Listen on ' + Constant.PORT);
});

function addAccount(username, pwd) {
    var info = {
        id: accountCount,
        username: username,
        createdAt: new Date().getTime(),
        password: pwd,
    };

    // FIXME only store id in usernameMap
    accountsByUserName[username.toLowerCase()] = info.id;
    accountsByUserId[accountCount.toString()] = info;
    accountCount += 1;
}
