const crypto = require('crypto');
const axios = require('axios');

class P2PWebhook {
  constructor({ id, secret, targetUrl, port }) {
    this.id = id;
    this.secret = secret;
    this.targetUrl = targetUrl;
    this.port = port;
    this.handlers = [];
  }

  generateSignature(payload) {
    return crypto
      .createHmac('sha256', this.secret)
      .update(JSON.stringify(payload))
      .digest('hex');
  }

  verifySignature(payload, signature) {
    const expected = this.generateSignature(payload);
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  }

  async send(data) {
    const payload = {
      senderId: this.id,
      data,
      timestamp: Date.now()
    };
    const signature = this.generateSignature(payload);
    
    return axios.post(`${this.targetUrl}/webhook/${this.id}/request`, payload, {
      headers: { 'x-webhook-signature': signature }
    });
  }

  middleware() {
    return (req, res, next) => {
      const signature = req.headers['x-webhook-signature'];
      if (!signature || !this.verifySignature(req.body, signature)) {
        return res.status(401).send('Invalid Signature');
      }
      this.handlers.forEach(fn => fn(req.body.data, req.body.senderId));
      res.sendStatus(200);
    };
  }

  onMessage(callback) {
    this.handlers.push(callback);
  }

  listen(app) {
    app.use(require('express').json());
    app.post('/webhook/:id/request', this.middleware());
    app.listen(this.port);
  }
}

module.exports = P2PWebhook;
