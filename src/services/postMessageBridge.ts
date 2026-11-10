import { ConfiguratorPostMessage, ConfiguratorPostMessageType } from '../types/shopify';

export class PostMessageBridge {
  private static instance: PostMessageBridge;
  private messageHandlers: Map<ConfiguratorPostMessageType, Set<(payload: unknown) => void>> = new Map();

  private constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('message', this.handleWindowMessage.bind(this));
    }
  }

  public static getInstance(): PostMessageBridge {
    if (!PostMessageBridge.instance) {
      PostMessageBridge.instance = new PostMessageBridge();
    }
    return PostMessageBridge.instance;
  }

  private handleWindowMessage(event: MessageEvent): void {
    const data = event.data as ConfiguratorPostMessage;
    if (!data || !data.type || data.source !== 'PARENT_HOST') return;

    const handlers = this.messageHandlers.get(data.type);
    if (handlers) {
      for (const handler of handlers) {
        handler(data.payload);
      }
    }
  }

  public on<T = unknown>(type: ConfiguratorPostMessageType, callback: (payload: T) => void): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    const handlers = this.messageHandlers.get(type)!;
    handlers.add(callback as (payload: unknown) => void);

    return () => {
      handlers.delete(callback as (payload: unknown) => void);
    };
  }

  public emit<T = unknown>(type: ConfiguratorPostMessageType, payload: T): void {
    if (typeof window === 'undefined') return;

    const message: ConfiguratorPostMessage<T> = {
      type,
      payload,
      source: 'VERTICAL_3D_CONFIGURATOR',
      version: '1.0.0',
    };

    // If inside an iframe, post to window.parent
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(message, '*');
    }

    // Also dispatch on local window for testing/debugging
    window.dispatchEvent(new CustomEvent(`configurator:${type}`, { detail: payload }));
  }
}

export const postMessageBridge = PostMessageBridge.getInstance();

