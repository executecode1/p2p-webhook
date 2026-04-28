const crypto = require('crypto');
const axios = require('axios');
const express = require('express');

class P2PWebhook {
  constructor({ id, secret, targetUrl }) {
    this.id = id;
    this.secret = secret;
    this.targetUrl = targetUrl;
    this.handlers = [];
  }

  generateSignature(payload) {
    return crypto
      .createHmac('sha256', this.secret)
      .update(JSON.stringify(payload))
      .digest('hex');
  }

  verifySignature(payload, signature) {
    if (!signature) return false;
    try {
      const expected = this.generateSignature(payload);
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    } catch (e) {
      return false;
    }
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

  onMessage(callback) {
    this.handlers.push(callback);
  }

  listen(port) {
    const app = express();
    
    app.use(express.json());

    app.post('/webhook/:id/request', (req, res) => {
      const signature = req.headers['x-webhook-signature'];
      
      if (!this.verifySignature(req.body, signature)) {
        return res.sendStatus(401);
      }

      this.handlers.forEach(fn => fn(req.body.data, req.body.senderId));
      res.sendStatus(200);
    });

    return app.listen(port);
  }
}

module.exports = P2PWebhook;
