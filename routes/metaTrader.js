var express = require('express');
var router = express.Router();

const eventQueue = require('./tradingView').queue;
const config = require('./config');

/* Redis operation functions */
const redis = require('redis');
const redisClient = redis.createClient();

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client connected !'));

redisClient.connect();


router.post('tick', (req, res, next) => {
  const ipv4 = req.ip.split(':')[3];

  if (!checkPrivateNetwork(req, res, ipv4)) return ;

  /**
   *  open:
   *  close:
   *  high:
   *  low:
   */

});


var CodeTable = {};

router.post('/create-list', (req, res, next) => {
  const ipv4 = req.ip.split(':')[3];
  if (!checkPrivateNetwork(req, res, ipv4)) return ;

  // Real Work.
  const listName = req.body.name;

  redisClient.EXISTS(listName).then(existed => {
    let token = 0;

    if (existed) {
      res.send('NA');
      return ;
    }

    token = Math.floor(Math.random() * 1000000).toString();
    CodeTable[token] = listName;
    res.send(JSON.stringify({
      r: token,
    }));
  });
});

router.post('/close-list', (req, res, next) => {
  const ipv4 = req.ip.split(':')[3];
  if (!checkPrivateNetwork(req, res, ipv4)) return ;

  // Real Work!
  const token = req.body.token;

  delete CodeTable[token];
  res.send('OK');
});

router.post('/rpush', (req, res, next) => {
  const ipv4 = req.ip.split(':')[3];
  if (!checkPrivateNetwork(req, res, ipv4)) return ;

  // Real Work.
  const token = req.body.token;
  if (!(token in CodeTable)) {
    res.send('NA');
    return ;
  }
  
  const listName = CodeTable[token];
  const item = req.body.item;
  redisClient.RPUSH(listName, JSON.stringify(item)).then(count => {
    res.send(JSON.stringify({
      r: count
    }));
  });
});


router.post('/poll', (req, res, next) => {
  const ipv4 = req.ip.split(':')[3];

  if (!checkPrivateNetwork(req, res, ipv4)) return ;

  const event = checkEventQueue(ipv4);

  if (event == null)
    res.send('NA');
  else {
    const jsonStr = JSON.stringify({
      a: event.action,
      l: event.lot,
      sl: event.stopLoss,
      add: event.addition,
    });

    console.log(jsonStr);
    res.send(jsonStr);
  }
});

const checkPrivateNetwork = (req, res, ip) => {

  if (ip == '127.0.0.1' || ip.substr(0, 7) == '192.168') {
    return true;
  }
  else {
    res.send(`Access denied !!! IP: ${ip} MUST Be private network !!!`);
    return false;
  }
}

const checkEventQueue = (ip) => {
  //let event = eventQueue.shift();

  const now = Date.now();

  while (eventQueue.length > 0) {
    let event = eventQueue[0];
    if (( now - event.timestamp ) < 8000) {
      if (event[ip] == undefined) {
        event[ip] = true;
        console.log(event);
      }
      else {
        event = null;
      }

      return event;
    }
    eventQueue.shift();
    console.log("----------");
  }

  return null;
}

module.exports = {
  router: router,
}
