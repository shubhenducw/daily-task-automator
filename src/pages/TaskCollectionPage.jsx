import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { sendTasksToN8n } from '../services/n8n-service';
import { generateTaskSuggestions, summarizeTasks } from '../services/ollama-service';
import { MarkdownEditor } from '../components/MarkdownEditor';

const TaskCollectionPage = () => {
  const [tasks, setTasks] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [summary, setSummary] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    const savedTasks = localStorage.getItem('daily-tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      const now = new Date().toISOString();
      setTasks([{ 
        id: Date.now(), 
        text: '', 
        description: '',
        label: 'Feature', 
        env: 'dev',
        status: 'Backlog',
        createdAt: now,
        editedAt: now
      }]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('daily-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleTaskChange = (id, field, value) => {
    setTasks(tasks.map(task => 
      task.id === id 
        ? { ...task, [field]: value, editedAt: new Date().toISOString() } 
        : task
    ));
  };

  const addTask = () => {
    const now = new Date().toISOString();
    setTasks([...tasks, { 
      id: Date.now(), 
      text: '', 
      description: '',
      label: 'Feature', 
      env: 'dev',
      status: 'Backlog',
      createdAt: now,
      editedAt: now
    }]);
  };

  const removeTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleGetSuggestions = async () => {
    setLoadingAI(true);
    try {
      const suggestions = await generateTaskSuggestions(tasks);
      setAiSuggestions(suggestions);
      if (suggestions.length > 0) {
        toast.success(`Got ${suggestions.length} AI suggestions!`);
      } else {
        toast.info('No suggestions available. Make sure Ollama is running.');
      }
    } catch (error) {
      toast.error('Failed to get AI suggestions');
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSummarize = async () => {
    setLoadingAI(true);
    try {
      const taskSummary = await summarizeTasks(tasks);
      setSummary(taskSummary);
      if (taskSummary) {
        toast.success('Summary generated!');
      } else {
        toast.info('Could not generate summary. Make sure Ollama is running.');
      }
    } catch (error) {
      toast.error('Failed to generate summary');
    } finally {
      setLoadingAI(false);
    }
  };

  const addSuggestionAsTask = (suggestion) => {
    const now = new Date().toISOString();
    setTasks([...tasks, { 
      id: Date.now(), 
      text: suggestion, 
      description: '',
      label: 'Feature', 
      env: 'dev',
      status: 'Backlog',
      createdAt: now,
      editedAt: now
    }]);
    toast.success('Added suggestion as task!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Tasks submitted:', tasks);
    
    // Check if running in Tauri environment
    const isTauri = typeof window !== 'undefined' && window.__TAURI_INTERNALS__;
    
    // Send to n8n webhook
    const n8nResult = await sendTasksToN8n(tasks);
    if (n8nResult.success) {
      console.log('Tasks sent to n8n successfully');
    }
    
    if (isTauri) {
      try {
        await invoke('log_task', { task: JSON.stringify(tasks) });
        toast.success('Tasks logged successfully!' + (n8nResult.success ? ' Sent to n8n.' : ''));
      } catch (error) {
        console.error('Failed to log tasks:', error);
        toast.error('Failed to log tasks. See console for details.');
      }
    } else {
      // Running in browser mode, just show success
      console.log('Running in browser mode. Tasks saved to localStorage.');
      toast.success('Tasks saved!' + (n8nResult.success ? ' Sent to n8n.' : '') + ' (Browser mode)');
    }
  };

  return (
    <div className="w-full py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Daily Tasks</h2>
        <div className="flex gap-2">
          <Button 
            onClick={handleGetSuggestions} 
            variant="outline" 
            disabled={loadingAI || tasks.length === 0}
            className="flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
            </svg>
            AI Suggestions
          </Button>
          <Button 
            onClick={handleSummarize} 
            variant="outline" 
            disabled={loadingAI || tasks.length === 0}
          >
            Summarize
          </Button>
        </div>
      </div>

      {/* AI Summary */}
      {summary && (
        <div className="mb-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
          <h3 className="text-sm font-semibold text-indigo-400 mb-2">AI Summary</h3>
          <p className="text-sm">{summary}</p>
        </div>
      )}

      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <div className="mb-6 p-4 bg-card/50 border border-border rounded-lg">
          <h3 className="text-sm font-semibold mb-3">AI Suggested Tasks</h3>
          <div className="space-y-2">
            {aiSuggestions.map((suggestion, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-background/50 rounded">
                <span className="text-sm">{suggestion}</span>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => addSuggestionAsTask(suggestion)}
                >
                  Add
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {tasks.map((task, index) => (
          <div key={task.id} className="flex flex-col gap-4 bg-card/50 p-4 rounded-lg border border-border">
            {/* Labels Row */}
            <div className="flex gap-4 items-start">
              <span className="text-muted-foreground font-mono w-6 text-right hidden md:block">{index + 1}.</span>
              <div className="flex-1">
                <Label htmlFor={`task-${task.id}`}>Task Title</Label>
              </div>
              <div className="w-full md:w-40">
                <Label>Label</Label>
              </div>
              <div className="w-full md:w-32">
                <Label>Environment</Label>
              </div>
              <div className="w-full md:w-48">
                <Label>Status</Label>
              </div>
              <div className="w-10"></div> {/* Spacer for remove button */}
            </div>

            {/* Inputs Row */}
            <div className="flex gap-4 items-start">
              <div className="w-6 hidden md:block"></div> {/* Spacer for serial number */}
              <div className="flex-1">
                <Input
                  id={`task-${task.id}`}
                  value={task.text}
                  onChange={(e) => handleTaskChange(task.id, 'text', e.target.value)}
                  placeholder="Enter task description"
                  autoFocus={index === tasks.length - 1}
                />
              </div>
              <div className="w-full md:w-40">
                <Select value={task.label} onValueChange={(value) => handleTaskChange(task.id, 'label', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Label" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hotfix">Hotfix</SelectItem>
                    <SelectItem value="Feature">Feature</SelectItem>
                    <SelectItem value="Under-QA">Under-QA</SelectItem>
                    <SelectItem value="Help-Needed">Help-Needed</SelectItem>
                    <SelectItem value="Bug">Bug</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-32">
                <Select value={task.env} onValueChange={(value) => handleTaskChange(task.id, 'env', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Env" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dev">Dev</SelectItem>
                    <SelectItem value="stage">Stage</SelectItem>
                    <SelectItem value="production">Prod</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-48">
                <Select value={task.status} onValueChange={(value) => handleTaskChange(task.id, 'status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Backlog">Backlog</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Needs Review">Needs Review</SelectItem>
                    <SelectItem value="Needs QA">Needs QA</SelectItem>
                    <SelectItem value="Bugs Reported">Bugs Reported</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Needs Discussion">Needs Discussion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeTask(task.id)}
                className="text-destructive hover:text-destructive/90"
              >
                ✕
              </Button>
            </div>

            {/* Description with Markdown Editor */}
            <div className="flex gap-4">
              <div className="w-6 hidden md:block"></div> {/* Spacer for serial number */}
              <div className="flex-1">
                <Label htmlFor={`desc-${task.id}`}>Description (Markdown supported)</Label>
                <div className="mt-2">
                  <MarkdownEditor
                    value={task.description || ''}
                    onChange={(value) => handleTaskChange(task.id, 'description', value)}
                    placeholder="Add detailed description with markdown formatting..."
                  />
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="flex gap-4 text-xs text-muted-foreground">
              <div className="w-6 hidden md:block"></div>
              <div className="flex gap-4">
                <span>Created {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</span>
                <span>• Edited {formatDistanceToNow(new Date(task.editedAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
        ))}
        
        <div className="flex gap-4 mt-8 pt-4 border-t border-border">
          <Button
            type="button"
            variant="secondary"
            onClick={addTask}
            className="flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Task
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-indigo-600 hover:bg-indigo-700"
          >
            Submit Tasks
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TaskCollectionPage;
