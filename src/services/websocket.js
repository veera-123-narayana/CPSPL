/**
 * INNOVRUSH 2K26 — Real-time WebSocket Client
 */

class WebSocketClient {
  constructor() {
    this.ws = null;
    this.listeners = new Map(); // eventType -> Set of callbacks
    this.reconnectTimeout = null;
    this.isConnected = false;
  }

  connect() {
    if (typeof window === 'undefined') return;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // If running in Vite dev mode on 5173, backend ws is on 5000
    const host = window.location.port === '5173' ? `${window.location.hostname}:5000` : window.location.host;
    const wsUrl = `${protocol}//${host}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.emit('connection_change', { connected: true });
        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.type) {
            this.emit(data.type, data);
            this.emit('*', data);
          }
        } catch (e) {
          console.error('[WS] Parse error:', e);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.emit('connection_change', { connected: false });
        this.reconnect();
      };

      this.ws.onerror = () => {
        this.isConnected = false;
        this.emit('connection_change', { connected: false });
      };
    } catch (e) {
      console.error('[WS] Connection exception:', e);
      this.reconnect();
    }
  }

  reconnect() {
    if (this.reconnectTimeout) return;
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect();
    }, 2500);
  }

  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);

    // Return unbind function
    return () => {
      const callbacks = this.listeners.get(eventType);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  emit(eventType, data) {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach(cb => {
        try {
          cb(data);
        } catch (e) {
          console.error(`[WS] Error in listener for ${eventType}:`, e);
        }
      });
    }
  }
}

export const wsClient = new WebSocketClient();
