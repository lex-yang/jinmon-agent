var express = require('express');
var router = express.Router();

const config = require('./config');

const WHITE_IP_LIST = [
  "52.89.214.238",
  "34.212.75.30",
  "54.218.53.128",
  "52.32.178.7",
  "127.0.0.1",
];

const EventQueue = Array();

const BULLISH_MARKET = "BL";
const BEARISH_MARKET = "BR";

var CurrentTrend = BEARISH_MARKET;
var Debounced = false;

router.post('/buy', (req, res, next) => {
  if (!Prerequisite(req, res)) return ;

  if (!Debounced && !config.disabled) {
    let action = 'buy';

    EventQueue.push({
      action: action,
      lot: config.lot,
      timestamp: Date.now(),
      stopLoss: req.body.sl,
    });  
  }

  Debounced = false;
  res.send('OK');
});

router.post('/sell', (req, res, next) => {
  if (!Prerequisite(req, res)) return ;

  if (!Debounced && !config.disabled) {
    let action = 'sell';

    EventQueue.push({
      action: action,
      lot: config.lot,
      timestamp: Date.now(),
      stopLoss: req.body.sl,
    })  
  }

  Debounced = false;
  res.send('OK');
});

router.post('/close', (req, res, next) => {
  if (!checkWhiteIps(req, res)) return ;

  EventQueue.push({
    action: 'close',
    timestamp: Date.now(),
  })
  res.send('OK');
});

router.post('/debounce', (req, res, next) => {
  if (!checkWhiteIps(req, res)) return ;

  console.log('Enable de-bounce Filter !');
  Debounced = true;
  res.send('OK');
});

router.post('/obv-bl', (req, res, next) => {
  if (!checkWhiteIps(req, res)) return ;

  if (config.enableTrendTrade &&
      CurrentTrend == BEARISH_MARKET) {

    console.log('Regular Bullish Div. in Bear Market !!!')
    EventQueue.push({
      action: 'close',
      timestamp: Date.now(),
    })  
  }
  res.send('OK');
});

router.post('/obv-br', (req, res, next) => {
  if (!checkWhiteIps(req, res)) return ;

  if (config.enableTrendTrade &&
      CurrentTrend == BULLISH_MARKET) {

    console.log('Regular Bearish Div. in Bull Market !!!')
    EventQueue.push({
      action: 'close',
      timestamp: Date.now(),
    })
  }
  res.send('OK');
});

router.post('/trend-bl', (req, res, next) => {
  if (!checkWhiteIps(req, res)) return ;

  console.log('Revers Market Direction to Bull Market .')
  CurrentTrend = BULLISH_MARKET;
  res.send('OK');
});

router.post('/trend-br', (req, res, next) => {
  if (!checkWhiteIps(req, res)) return ;

  console.log('Revers Market Direction to Bear Market .')
  CurrentTrend = BEARISH_MARKET;
  res.send('OK');
});


const Prerequisite = (req, res) => {
  return checkWhiteIps(req, res) && checkStopLoss(req, res);
}

const checkStopLoss = (req, res) => {
  if (config.requireStopLoss && req.body.sl == undefined) {
    const msg = 'Set STOP LOSS to protect your assets !!!'
    console.log(msg);
    res.send(msg);
    return false;
  }
  else {
    return true;
  }
}

const checkWhiteIps = (req, res) => {
  // skip check.
  if (!config.whiteIps) return true;

  const ipv4 = req.ip.split(':')[3];
  if (WHITE_IP_LIST.includes(ipv4)) {
    return true;
  }
  else {
    const msg = `Access denied !!! IP: ${ipv4} NOT in white list`;
    console.log(msg)
    res.send(msg);
    return false;
  }
}

module.exports = {
  queue: EventQueue,
  router: router,
}
