# P2PWebhook

シンプルなP2P（Peer-to-Peer）Webhook通信を実現するNode.jsライブラリです。

署名付きリクエストにより、安全にサーバー間通信を行えます。

---

## ✨ 特徴

* 🔐 HMAC-SHA256による署名検証
* 📡 双方向通信（送信・受信）
* ⚡ シンプルなAPI
* 🚫 外部サービス不要

---

## 📦 インストール

```bash
npm install axios express p2p-webhook
```

※ `crypto` はNode.js標準モジュールです

---

## 🚀 使い方

### 1. インスタンス作成

```js
const P2PWebhook = require('P2PWebhook');

const webhook = new P2PWebhook({
  id: 'serverA',
  secret: 'shared-secret',
  targetUrl: 'http://localhost:3001'
});
```

---

### 2. サーバー起動（受信側）

```js
webhook.onMessage((data, senderId) => {
  console.log('受信:', data, '送信元:', senderId);
});

webhook.listen(3000);
```

---

### 3. データ送信

```js
await webhook.send({
  message: 'Hello from serverA'
});
```

---

## 🔄 通信の流れ

1. `send()` でデータ送信
2. 署名（HMAC-SHA256）を生成
3. 相手の `/webhook/:id/request` にPOST
4. 受信側で署名検証
5. `onMessage()` のハンドラが実行

---

## 🔐 セキュリティ

* 共有シークレットを使用して署名を生成
* `crypto.timingSafeEqual` によりタイミング攻撃対策
* 不正な署名は `401 Unauthorized` を返す

---

## 📌 API

### `new P2PWebhook(options)`

| パラメータ     | 型      | 説明       |
| --------- | ------ | -------- |
| id        | string | 自分の識別ID  |
| secret    | string | 共有シークレット |
| targetUrl | string | 送信先のURL  |

---

### `send(data)`

データを相手に送信します。

* `data`: 任意のJSONデータ

---

### `onMessage(callback)`

メッセージ受信時の処理を登録します。

```js
callback(data, senderId)
```

---

### `listen(port)`

Webhookサーバーを起動します。

---

## ⚠️ 注意

* `secret` は必ず送信側・受信側で一致させてください
* `targetUrl` は受信側のURLを指定してください
* 本番環境ではHTTPSの使用を推奨します
