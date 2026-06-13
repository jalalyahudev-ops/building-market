import { create } from 'zustand';

interface AIStore {
  categorizeProduct: (name: string, description: string, imageBase64?: string) => Promise<{category: string; subcategory?: string; tags?: string[]}>;
  chatAssistant: (messages: {role: string, parts: {text: string}[]}[]) => Promise<string>;
  processServiceRequest: (text: string) => Promise<{category: string; quantity: number; datetime?: string; location?: string; task_description?: string; materials?: {name: string, quantity: string}[]}>;
}

export const useAIStore = create<AIStore>(() => ({
  categorizeProduct: async (name, description, imageBase64) => {
    const res = await fetch('/api/categorize-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, imageBase64 })
    });
    if (!res.ok) throw new Error('Failed to categorize product');
    return res.json();
  },
  chatAssistant: async (messages) => {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages })
    });
    if (!res.ok) throw new Error('Failed to use AI assistant');
    const data = await res.json();
    return data.text;
  },
  processServiceRequest: async (text) => {
    const res = await fetch('/api/process-service-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (!res.ok) throw new Error('Failed to process service request');
    return res.json();
  }
}));
