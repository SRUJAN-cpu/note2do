export interface TodoItem {
  id: string;
  description: string;
  checked: boolean;
  order: number;
}

export interface Document {
  id: string;
  title: string;
  content?: string;
  type: 'normal' | 'todo';
  todoItems?: TodoItem[];
  tags: string[];
  lastModified: string;
}

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3001/api';

export const api = {
  async getDocuments(): Promise<Document[]> {
    const response = await fetch(`${API_BASE_URL}/documents`);
    if (!response.ok) throw new Error('Failed to fetch documents');
    return response.json();
  },

  async getDocument(id: string): Promise<Document> {
    const response = await fetch(`${API_BASE_URL}/documents/${id}`);
    if (!response.ok) throw new Error('Failed to fetch document');
    return response.json();
  },

  async createDocument(title?: string, type?: 'normal' | 'todo', content?: string, tags?: string[], todoItems?: TodoItem[]): Promise<Document> {
    const response = await fetch(`${API_BASE_URL}/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, type, content, tags, todoItems }),
    });
    if (!response.ok) throw new Error('Failed to create document');
    return response.json();
  },

  async updateDocument(id: string, title: string, content: string | undefined, tags: string[], todoItems?: TodoItem[]): Promise<Document> {
    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content, tags, todoItems }),
    });
    if (!response.ok) throw new Error('Failed to update document');
    return response.json();
  },

  async deleteDocument(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete document');
  },
};