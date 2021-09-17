var express = require('express');
var router = express.Router();

const config = require('../config');

const WHITE_IP_LIST = [
  "52.89.214.238",
  "34.212.75.30",
  "54.218.53.128",
  "52.32.178.7",
];

const EventQueue = Array();

router.post('/buy', (req, res, next) => {
  if (!Prerequisite(req, res)) return ;

  EventQueue.push({
    action: 'buy',
    lot: config.lot,
    timestamp: Date.now(),
    stopLoss: req.body.sl,
  });
  res.send('OK');
});

router.post('/sell', (req, res, next) => {
  if (!Prerequisite(req, res)) return ;

  EventQueue.push({
    action: 'sell',
    lot: config.lot,
    timestamp: Date.now(),
    stopLoss: req.body.sl,
  })
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
