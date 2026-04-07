// Utility functions for the Google Tasks API
export const getGoogleAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('google_access_token');
};

export const hasGoogleTasksPermission = (): boolean => {
  return getGoogleAccessToken() !== null;
};

// Base URL for the Google Tasks API
export const GOOGLE_TASKS_API_BASE = 'https://www.googleapis.com/tasks/v1';

// Cache created Pomometer lists to avoid duplicate creation
const pomometerListCache = new Map<string, { id: string; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5-minute cache

// Check whether the access token is still valid
export const isGoogleTokenValid = async (): Promise<boolean> => {
  const token = getGoogleAccessToken();
  if (!token) return false;
  
  try {
    const response = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`);
    return response.ok;
  } catch {
    return false;
  }
};

// Fetch Google Task lists
export const getGoogleTaskLists = async () => {
  const token = getGoogleAccessToken();
  if (!token) {
    throw new Error('No Google access token available');
  }
  
  const response = await fetch(`${GOOGLE_TASKS_API_BASE}/users/@me/lists`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch Google Task lists');
  }
  
  return response.json();
};

// Fetch tasks in the specified list
export const getGoogleTasks = async (taskListId: string) => {
  const token = getGoogleAccessToken();
  if (!token) {
    throw new Error('No Google access token available');
  }
  
  const response = await fetch(`${GOOGLE_TASKS_API_BASE}/lists/${taskListId}/tasks`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch Google Tasks');
  }
  
  return response.json();
};

// Create a new Google Task List
export const createGoogleTaskList = async (title: string) => {
  const token = getGoogleAccessToken();
  if (!token) {
    throw new Error('No Google access token available');
  }
  
  const response = await fetch(`${GOOGLE_TASKS_API_BASE}/users/@me/lists`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create Google Task List');
  }
  
  return response.json();
};

// Get or create the dedicated AA Pomometer list
export const getOrCreatePomometerTaskList = async (token?: string) => {
  const POMOMETER_LIST_NAME = 'AA Pomometer';
  const accessToken = token || getGoogleAccessToken();
  if (!accessToken) {
    throw new Error('No Google access token available');
  }
  
  // Check the cache using the token as part of the key
  const cacheKey = `${accessToken.substring(0, 10)}:${POMOMETER_LIST_NAME}`;
  const cached = pomometerListCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`[GoogleTasks] Using cached AA Pomometer list with ID: ${cached.id}`);
    return { id: cached.id, title: POMOMETER_LIST_NAME };
  }
  
  try {
    // Fetch all lists first
    const response = await fetch(`${GOOGLE_TASKS_API_BASE}/users/@me/lists`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch Google Task lists');
    }
    
    const listsData = await response.json() as { items?: Array<{ id: string; title: string }> };
    const lists = listsData.items || [];
    
    // Check if an AA Pomometer list already exists
    const pomometerList = lists.find((list) => list.title === POMOMETER_LIST_NAME);
    
    if (pomometerList) {
      console.log(`[GoogleTasks] Found existing AA Pomometer list with ID: ${pomometerList.id}`);
      // Update the cache
      pomometerListCache.set(cacheKey, { id: pomometerList.id, timestamp: Date.now() });
      return pomometerList;
    }
    
    // If none exists, create a new list
    console.log(`[GoogleTasks] Creating new AA Pomometer list`);
    const createResponse = await fetch(`${GOOGLE_TASKS_API_BASE}/users/@me/lists`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: POMOMETER_LIST_NAME }),
    });
    
    if (!createResponse.ok) {
      throw new Error('Failed to create Google Task List');
    }
    
    const newList = await createResponse.json() as { id: string; title: string };
    console.log(`[GoogleTasks] Successfully created AA Pomometer list with ID: ${newList.id}`);
    
    // Cache the newly created list
    pomometerListCache.set(cacheKey, { id: newList.id, timestamp: Date.now() });
    
    return newList;
  } catch (error) {
    console.error('[GoogleTasks] Failed to get or create AA Pomometer list:', error);
    throw error;
  }
};

// Create a new Google Task
export const createGoogleTask = async (taskListId: string, task: { title: string; notes?: string }) => {
  const token = getGoogleAccessToken();
  if (!token) {
    throw new Error('No Google access token available');
  }
  
  const response = await fetch(`${GOOGLE_TASKS_API_BASE}/lists/${taskListId}/tasks`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create Google Task');
  }
  
  return response.json();
};
