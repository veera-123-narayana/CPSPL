/**
 * INNOVRUSH 2K26 — Global Real-time Multi-System Synchronization Client
 * Powered by Supabase Realtime Broadcast Channels (WebSockets)
 * Enables instant (<50ms) cross-device updates across all 100+ systems globally.
 */

import { getSupabaseClient } from './supabase';

class WebSocketClient {
  constructor() {
    this.ws = null;
    this.supabaseChannel = null;
    this.clientId = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : `sys_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    this.listeners = new Map(); // eventType -> Set of callbacks
    this.reconnectTimeout = null;
    this.isConnected = false;
    this.hasRequestedInitialState = false;
  }

  connect() {
    if (typeof window === 'undefined') return;

    // 1. INITIALIZE SUPABASE CLOUD REALTIME WEBSOCKETS (Works globally on Netlify & cross-machine)
    try {
      const supabase = getSupabaseClient();
      if (supabase && !this.supabaseChannel) {
        this.supabaseChannel = supabase.channel('innovrush_live_sync', {
          config: {
            broadcast: { self: false }
          }
        });

        this.supabaseChannel.on('broadcast', { event: 'LIVE_EVENT' }, (message) => {
          const { type, payload, senderId } = message.payload || {};
          if (senderId === this.clientId) return; // Ignore echoes

          if (type) {
            this.emit(type, { type, payload, senderId });
            this.emit('*', { type, payload, senderId });
          }
        });

        this.supabaseChannel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            this.isConnected = true;
            this.emit('connection_change', { connected: true });
            
            // Request authoritative state snapshot on first connect
            if (!this.hasRequestedInitialState) {
              this.hasRequestedInitialState = true;
              this.sendCloudBroadcast('REQUEST_CURRENT_STATE', { clientId: this.clientId });
            }
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            this.isConnected = false;
            this.emit('connection_change', { connected: false });
          }
        });
      }
    } catch (e) {
      console.warn('[Realtime] Supabase channel initialization warning:', e);
    }

    // 2. CONNECT TO LOCAL WEBSOCKET (For local Node backend server if active)
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
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
        // Only reconnect local WS if on local environment (avoid spamming on static Netlify)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          this.reconnect();
        }
      };

      this.ws.onerror = () => {
        // Silently handled - Supabase Realtime channel takes over
      };
    } catch (e) {
      // Local WS not available on static hosting
    }
  }

  reconnect() {
    if (this.reconnectTimeout) return;
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect();
    }, 3000);
  }

  /**
   * Broadcast an event to all 100+ systems across the globe via Supabase Realtime Cloud WebSockets
   */
  broadcast(eventType, payload = {}) {
    // 1. Trigger local in-memory listeners for immediate UI responsiveness in this tab
    this.emit(eventType, { type: eventType, payload });
    this.emit('*', { type: eventType, payload });

    // 2. Broadcast to all other systems via Supabase Realtime Cloud WebSockets
    this.sendCloudBroadcast(eventType, payload);

    // 3. Also send over local Node WebSocket if connected
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({ type: eventType, payload }));
      } catch (e) {
        // ignore
      }
    }
  }

  sendCloudBroadcast(eventType, payload = {}) {
    if (this.supabaseChannel) {
      try {
        this.supabaseChannel.send({
          type: 'broadcast',
          event: 'LIVE_EVENT',
          payload: {
            type: eventType,
            payload,
            senderId: this.clientId,
            timestamp: Date.now()
          }
        });
      } catch (err) {
        console.warn('[Realtime] Broadcast send error:', err);
      }
    }
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
