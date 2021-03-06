var express = require('express');
var router = express.Router();


var Config = {
	router: router,
	lot: 0.1,
	requireStopLoss: true,
	whiteIps: true,
	verbose: true,
	disabled: false,
  logger: false,
}

router.post('/disable', (req, res, next) => {
  if (!checkPrivateNetwork(req, res)) return ;

  console.log('Disable Agent !')
  Config.disabled = true;
  res.send('OK');
});

router.post('/enable', (req, res, next) => {
  if (!checkPrivateNetwork(req, res)) return ;

  console.log('Enable Agent !')
  Config.disabled = false;
  res.send('OK');
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

module.exports = Config;