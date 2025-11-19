import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { testN8nConnection } from '../services/n8n-service';
import { testOllamaConnection } from '../services/ollama-service';

const SettingsPage = () => {
  const [n8nWebhook, setN8nWebhook] = useState('');
  const [n8nEnabled, setN8nEnabled] = useState(true);
  const [ollamaEndpoint, setOllamaEndpoint] = useState('');
  const [ollamaModel, setOllamaModel] = useState('');
  const [ollamaEnabled, setOllamaEnabled] = useState(true);

  useEffect(() => {
    // Load settings from localStorage
    const settings = localStorage.getItem('integration-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setN8nWebhook(parsed.n8nWebhook || 'https://iwx2qmuze8sekiq2gbcu8rfl.hooks.n8n.cloud');
      setN8nEnabled(parsed.n8nEnabled !== false);
      setOllamaEndpoint(parsed.ollamaEndpoint || 'http://localhost:11434');
      setOllamaModel(parsed.ollamaModel || 'llama2');
      setOllamaEnabled(parsed.ollamaEnabled !== false);
    } else {
      // Set defaults
      setN8nWebhook('https://iwx2qmuze8sekiq2gbcu8rfl.hooks.n8n.cloud');
      setOllamaEndpoint('http://localhost:11434');
      setOllamaModel('llama2');
    }
  }, []);

  const handleSave = () => {
    const settings = {
      n8nWebhook,
      n8nEnabled,
      ollamaEndpoint,
      ollamaModel,
      ollamaEnabled,
    };
    localStorage.setItem('integration-settings', JSON.stringify(settings));
    toast.success('Settings saved successfully!');
  };

  const handleTestN8n = async () => {
    // Save settings first
    const settings = {
      n8nWebhook,
      n8nEnabled,
      ollamaEndpoint,
      ollamaModel,
      ollamaEnabled,
    };
    localStorage.setItem('integration-settings', JSON.stringify(settings));
    
    // Then test connection
    const connected = await testN8nConnection();
    if (connected) {
      toast.success('n8n webhook is reachable!');
    } else {
      toast.error('Failed to connect to n8n webhook');
    }
  };

  const handleTestOllama = async () => {
    // Save settings first
    const settings = {
      n8nWebhook,
      n8nEnabled,
      ollamaEndpoint,
      ollamaModel,
      ollamaEnabled,
    };
    localStorage.setItem('integration-settings', JSON.stringify(settings));
    
    // Then test connection
    const connected = await testOllamaConnection();
    if (connected) {
      toast.success('Ollama is running and reachable!');
    } else {
      toast.error('Failed to connect to Ollama. Make sure it\'s running.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h2 className="text-3xl font-bold mb-8">Settings</h2>
      
      <div className="space-y-8">
        {/* n8n Settings */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-xl font-semibold mb-4">n8n Integration</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="n8n-webhook">Webhook URL</Label>
              <Input
                id="n8n-webhook"
                value={n8nWebhook}
                onChange={(e) => setN8nWebhook(e.target.value)}
                placeholder="https://your-n8n-instance.com/webhook/..."
                className="mt-2"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="n8n-enabled"
                checked={n8nEnabled}
                onChange={(e) => setN8nEnabled(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="n8n-enabled">Enable n8n integration</Label>
            </div>
            <Button onClick={handleTestN8n} variant="outline">
              Test Connection
            </Button>
          </div>
        </div>

        {/* Ollama Settings */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-xl font-semibold mb-4">Ollama AI</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="ollama-endpoint">API Endpoint</Label>
              <Input
                id="ollama-endpoint"
                value={ollamaEndpoint}
                onChange={(e) => setOllamaEndpoint(e.target.value)}
                placeholder="http://localhost:11434"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="ollama-model">Model</Label>
              <Input
                id="ollama-model"
                value={ollamaModel}
                onChange={(e) => setOllamaModel(e.target.value)}
                placeholder="llama2, mistral, codellama, etc."
                className="mt-2"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="ollama-enabled"
                checked={ollamaEnabled}
                onChange={(e) => setOllamaEnabled(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="ollama-enabled">Enable Ollama AI features</Label>
            </div>
            <Button onClick={handleTestOllama} variant="outline">
              Test Connection
            </Button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
