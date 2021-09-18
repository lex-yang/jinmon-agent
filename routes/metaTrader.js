var express = require('express');
var router = express.Router();

const eventQueue = require('./tradingView').queue;
const config = require('./config');

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
  }

  return null;
}

module.exports = {
  router: router,
}
