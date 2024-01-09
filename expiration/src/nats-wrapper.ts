import nats, { Stan } from 'node-nats-streaming';

class NatsWrapper {
  private _client?: Stan;

  get client() {
    if (!this._client) {
      throw new Error('Cannot access NATS before initialization');
    }
    return this._client;
  }

  connect(cid: string, clientId: string, url: string) {
    this._client = nats.connect(cid, clientId, { url });

    return new Promise<void>((resolve, reject) => {
      this.client.on('connect', () => {
        console.log('Connected to NATS Server');

        resolve();
      });

      this.client.on('error', (err) => {
        console.log('Failed to connect to NATS Server');
        reject(err);
      });
    });
  }
}

export default new NatsWrapper();
