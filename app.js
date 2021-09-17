var express = require('express');
var path = require('path');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var mtRouter = require('./routes/metaTrader');
var tvRouter = require('./routes/tradingView');
var configRouter = require('./routes/config');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', indexRouter);
app.use('/mt', mtRouter.router);
app.use('/tv', tvRouter.router);
app.use('/config', configRouter.router);

module.exports = app;
