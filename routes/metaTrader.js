var express = require('express');
var router = express.Router();

const eventQueue = require('./tradingView').queue;
const config = require('./config');

router.post('/poll', (req, res, next) => {
  if (!checkPrivateNetwork(req, res)) return ;

  const event = checkEventQueue();

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

const checkPrivateNetwork = (req) => {
  const ipv4 = req.ip.split(':')[3];

  if (ipv4 == '127.0.0.1' || ipv4.substr(0, 7) == '192.168') {
    return true;
  }
  else {
    res.send(`Access denied !!! IP: ${ipv4} MUST Be private network !!!`);
    return false;
  }
}

const checkEventQueue = () => {
  let event = eventQueue.shift();

  while (event != undefined) {
    if (( Date.now() - event.timestamp ) < 8000) {
      console.log(event);
      return event;
    }
    event = eventQueue.shift();
  }

  return null;
}

module.exports = {
  router: router,
}
