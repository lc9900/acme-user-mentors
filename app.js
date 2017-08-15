const express = require('express');
const app = express();
const nunjucks = require('nunjucks');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const utils = require('./utils');
const db = require('./models');


// Setting view engine and nunjucks
app.set('view engine', 'html');
app.engine('html', nunjucks.render);
nunjucks.configure('views', {
    express: app,
    noCache: true
});

// Method override
app.use(methodOverride('_method'));

// body-paser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Static file
app.use('/vendors', express.static(path.join(__dirname, 'node_modules')));

// Webserver Port
var port = process.env.PORT || 3000;

db.syncAndSeed().then(() => {
    app.listen(port, () => {
        utils.inform(`Web Server listening on port ${port}`);
    });
}).catch((err) => { throw err});


app.use('/users', require('./routes/users'));

app.get('/', (req, res) => {
    res.render('index', {pageName: "This is the acme user mentor index page"});
});

// Error page goes here
app.use((err, req, res, next) => {
    res.render('error', {error: err.message});
});
