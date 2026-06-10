import { create } from 'zustand';

interface AIStore {
  categorizeProduct: (name: string, description: string) => Promise<{category: string; subcategory?: string; tags?: string[]}>;
  chatAssistant: (messages: {role: string, parts: {text: string}[]}[]) => Promise<string>;
}

export const useAIStore = create<AIStore>(() => ({
  categorizeProduct: async (name, description) => {
    const res = await fetch('/api/categorize-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description })
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
  }
}));
