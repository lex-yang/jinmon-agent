var express = require('express');
var path = require('path');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var mtRouter = require('./routes/metaTrader');
var tvRouter = require('./routes/tradingView');
var config = require('./routes/config');

var app = express();

(config.logger && app.use(logger('dev')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', indexRouter);
app.use('/mt', mtRouter.router);
app.use('/tv', tvRouter.router);
app.use('/config', config.router);

module.exports = app;
