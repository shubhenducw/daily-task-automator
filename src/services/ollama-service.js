import ollamaConfig from '../config/ollama-config.json';

/**
 * Get Ollama configuration from localStorage or fallback to config file
 */
function getOllamaConfig() {
  const settings = localStorage.getItem('integration-settings');
  if (settings) {
    const parsed = JSON.parse(settings);
    return {
      apiEndpoint: parsed.ollamaEndpoint || ollamaConfig.apiEndpoint,
      model: parsed.ollamaModel || ollamaConfig.model,
      enabled: parsed.ollamaEnabled !== false
    };
  }
  return ollamaConfig;
}

/**
 * Generate AI suggestions for tasks
 * @param {Array} existingTasks - Current task list
 * @returns {Promise<Array>} Array of suggested tasks
 */
export async function generateTaskSuggestions(existingTasks) {
  const config = getOllamaConfig();
  
  if (!config.enabled) {
    console.log('Ollama integration is disabled');
    return [];
  }

  if (existingTasks.length === 0) {
    return [
      'Review and update documentation',
      'Write unit tests for recent changes',
      'Refactor code for better maintainability'
    ];
  }

  try {
    const taskContext = existingTasks
      .map(t => {
        const desc = t.description ? ` - ${t.description}` : '';
        return `${t.text}${desc}`;
      })
      .join('; ');
    const prompt = `Based on these existing tasks: "${taskContext}". Suggest 3 short, actionable follow-up tasks. Return ONLY a simple list, one task per line, no numbering, no JSON, no extra text.`;

    console.log('Calling Ollama API at:', config.apiEndpoint);
    const response = await fetch(`${config.apiEndpoint}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      console.error('Ollama API error:', response.status);
      return [];
    }

    const data = await response.json();
    console.log('Ollama response:', data);
    
    // Parse the response - it should be plain text with one task per line
    const suggestions = data.response
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.match(/^[\d\.\-\*]+\s/)) // Remove numbering
      .map(line => line.replace(/^[\d\.\-\*]+\s*/, '').trim()) // Clean up any remaining markers
      .slice(0, 3); // Take only first 3
    
    return suggestions.length > 0 ? suggestions : [];
  } catch (error) {
    console.error('Failed to generate task suggestions:', error);
    return [];
  }
}

/**
 * Summarize task list
 * @param {Array} tasks - Array of task objects
 * @returns {Promise<string>} Summary text
 */
export async function summarizeTasks(tasks) {
  const config = getOllamaConfig();
  
  if (!config.enabled) {
    console.log('Ollama integration is disabled');
    return '';
  }

  try {
    const taskList = tasks.map((t, i) => {
      const desc = t.description ? `\n   ${t.description}` : '';
      return `${i + 1}. ${t.text} (${t.status})${desc}`;
    }).join('\n');
    const prompt = `Summarize these tasks in 2-3 sentences:\n${taskList}`;

    console.log('Calling Ollama API at:', config.apiEndpoint);
    const response = await fetch(`${config.apiEndpoint}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Ollama summary response:', data);
    return data.response || '';
  } catch (error) {
    console.error('Failed to summarize tasks:', error);
    throw error;
  }
}

/**
 * Test Ollama connection
 * @returns {Promise<boolean>} True if connection successful
 */
export async function testOllamaConnection() {
  const config = getOllamaConfig();
  
  try {
    console.log('Testing Ollama connection at:', config.apiEndpoint);
    const response = await fetch(`${config.apiEndpoint}/api/tags`);
    return response.ok;
  } catch (error) {
    console.error('Ollama connection test failed:', error);
    return false;
  }
}
