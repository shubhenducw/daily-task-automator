import n8nConfig from '../config/n8n-config.json';

/**
 * Get n8n configuration from localStorage or fallback to config file
 */
function getN8nConfig() {
  const settings = localStorage.getItem('integration-settings');
  if (settings) {
    const parsed = JSON.parse(settings);
    return {
      webhookUrl: parsed.n8nWebhook || n8nConfig.webhookUrl,
      enabled: parsed.n8nEnabled !== false
    };
  }
  return n8nConfig;
}

/**
 * Send tasks to n8n webhook
 * @param {Array} tasks - Array of task objects
 * @returns {Promise<Object>} Response from n8n
 */
export async function sendTasksToN8n(tasks) {
  const config = getN8nConfig();
  
  if (!config.enabled) {
    console.log('n8n integration is disabled');
    return { success: false, message: 'n8n integration is disabled' };
  }

  try {
    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tasks,
        timestamp: new Date().toISOString(),
        source: 'daily-task-automator'
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send tasks to n8n:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Test n8n webhook connection
 * @returns {Promise<boolean>} True if connection successful
 */
export async function testN8nConnection() {
  const config = getN8nConfig();
  
  try {
    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        test: true,
        timestamp: new Date().toISOString()
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('n8n connection test failed:', error);
    return false;
  }
}
