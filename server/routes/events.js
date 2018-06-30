const express = require('express');
const router = express.Router();
const sse = require('sse-channel');

const poi = new sse();

router.get('/poi', (req, res) => poi.addClient(req, res));

router.post('/poi', async function(req, res, next) {
  res.send('');

  let msg = { event: 'poi' };

  msg.data = JSON.stringify(req.body);

  poi.send(msg);
});

module.exports = router;
