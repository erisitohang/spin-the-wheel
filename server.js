const path = require('path');
const express = require('express');
const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('./webpack.config.js');
const router = express.Router();

const isDeveloping = process.env.NODE_ENV !== 'production';
const port = isDeveloping ? 3000 : process.env.PORT;
const app = express();

router.get('/api/data', function(req, res) {
    res.sendFile(path.normalize(__dirname + '/app/data/gift.json'))
});

app.use('/', router);
app.use(express.static(__dirname + '/build'));
app.get('/', function response(req, res) {
    res.sendFile(path.join(__dirname, 'build/index.html'));
});

app.listen(port, '0.0.0.0', function onStart(err) {
    if (err) {
        console.log(err);
    }
    console.info('==> 🌎 Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port);
});