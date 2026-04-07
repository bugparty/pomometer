// Google Service Account authentication and Tasks API client
// This module provides Service Account-based access to Google Tasks API

import { existsSync } from 'node:fs';

export interface GoogleTask {
  id?: string;
  title: string;
  notes?: string;
  updated?: string;
  status?: string;
  due?: string;
  completed?: string;
  deleted?: boolean;
  hidden?: boolean;
}

export interface GoogleServiceAccountList {
  id: string;
  title: string;
  updated?: string;
}

export interface ServiceAccountConfig {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

export interface ApiResultData {
  success: boolean;
  error?: string;
}

export interface ApiResultWithData<T = unknown> extends ApiResultData {
  data?: T;
}

export function loadServiceAccountFromEnv(): ServiceAccountConfig | null {
  try {
    const saType = process.env.SA_TYPE;
    const saProjectId = process.env.SA_PROJECT_ID;
    const saPrivateKeyId = process.env.SA_PRIVATE_KEY_ID;
    const saPrivateKey = process.env.SA_PRIVATE_KEY;
    const saClientEmail = process.env.SA_CLIENT_EMAIL;
    const saClientId = process.env.SA_CLIENT_ID;
    const saAuthUri = process.env.SA_AUTH_URI;
    const saTokenUri = process.env.SA_TOKEN_URI;
    const saAuthProviderCertUrl = process.env.SA_AUTH_PROVIDER_X509_CERT_URL;
    const saClientCertUrl = process.env.SA_CLIENT_X509_CERT_URL;

    if (!saType || !saProjectId || !saPrivateKey || !saClientEmail) {
      console.warn('[GoogleServiceAccount] Incomplete Service Account configuration from environment variables');
      return null;
    }

    return {
      type: saType,
      project_id: saProjectId,
      private_key_id: saPrivateKeyId || '',
      private_key: saPrivateKey,
      client_email: saClientEmail,
      client_id: saClientId || '',
      auth_uri: saAuthUri || 'https://oauth2.googleapis.com/token',
      token_uri: saTokenUri || 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: saAuthProviderCertUrl || 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: saClientCertUrl || '',
    };
  } catch (error) {
    console.error('[GoogleServiceAccount] Failed to load Service Account config from env:', error);
    return null;
  }
}

export async function loadServiceAccountFromFile(filePath: string = './google-service-account-key.json'): Promise<ServiceAccountConfig | null> {
  try {
    if (typeof window !== 'undefined') {
      return null;
    }

    const fs = await import('fs');
    const file = fs.readFileSync(filePath, 'utf-8');
    const config = JSON.parse(file) as ServiceAccountConfig;
    
    console.log('[GoogleServiceAccount] Successfully loaded Service Account config from file:', filePath);
    return config;
  } catch (error) {
    console.error(`[GoogleServiceAccount] Failed to load Service Account config from file ${filePath}:`, error);
    return null;
  }
}

export async function loadServiceAccountConfig(options?: {
  filePath?: string;
  preferFile?: boolean;
}): Promise<ServiceAccountConfig | null> {
  const { filePath = './google-service-account-key.json', preferFile = false } = options || {};

  if (preferFile) {
    const fileConfig = await loadServiceAccountFromFile(filePath);
    if (fileConfig) return fileConfig;
    return loadServiceAccountFromEnv();
  } else {
    const envConfig = loadServiceAccountFromEnv();
    if (envConfig) return envConfig;
    return await loadServiceAccountFromFile(filePath);
  }
}

export function isServiceAccountConfigured(): boolean {
  const envConfig = loadServiceAccountFromEnv();
  if (envConfig) return true;
  try {
    if (typeof window === 'undefined') {
      return existsSync('./google-service-account-key.json');
    }
  } catch {
    // fs may be unavailable in some runtimes
  }

  return false;
}

async function createServiceAccountJWT(config: ServiceAccountConfig): Promise<string> {
  try {
    const crypto = await import('crypto');

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: config.client_email,
      scope: 'https://www.googleapis.com/auth/tasks',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    };

    const header = { alg: 'RS256', typ: 'JWT' };
    
    const base64UrlEncode = (str: string) => {
      return Buffer.from(str)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    };

    // Fix private key format - replace literal \n with actual newlines
    let privateKey = config.private_key;
    if (privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }
    
    const jwtHeader = base64UrlEncode(JSON.stringify(header));
    const jwtPayload = base64UrlEncode(JSON.stringify(payload));
    const jwtData = jwtHeader + '.' + jwtPayload;
    
    // Use crypto.sign() directly instead of createSign() to avoid OpenSSL issues
    const signature = crypto.sign(
      'RSA-SHA256',
      Buffer.from(jwtData),
      privateKey
    );
    
    const jwtSignature = base64UrlEncode(signature.toString('base64'));

    return jwtData + '.' + jwtSignature;
  } catch (error) {
    console.error('[GoogleServiceAccount] Failed to create JWT:', error);
    throw error;
  }
}

async function exchangeJWTForAccessToken(jwt: string, config: ServiceAccountConfig): Promise<string> {
  try {
    const response = await fetch(config.token_uri, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }).toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('Failed to exchange JWT for access token: ' + response.status + ' ' + errorText);
    }

    const data = await response.json() as { access_token: string };
    return data.access_token;
  } catch (error) {
    console.error('[GoogleServiceAccount] Failed to exchange JWT for access token:', error);
    throw error;
  }
}

export async function getServiceAccountAccessToken(config?: ServiceAccountConfig): Promise<string | null> {
  try {
    const saConfig = config || await loadServiceAccountConfig();
    
    if (!saConfig) {
      console.error('[GoogleServiceAccount] No Service Account configuration available');
      return null;
    }

    console.log('[GoogleServiceAccount] Creating access token for:', saConfig.client_email);

    const jwt = await createServiceAccountJWT(saConfig);
    const accessToken = await exchangeJWTForAccessToken(jwt, saConfig);
    
    console.log('[GoogleServiceAccount] Access token created successfully');
    return accessToken;
  } catch (error) {
    console.error('[GoogleServiceAccount] Failed to get access token:', error);
    return null;
  }
}

const GOOGLE_TASKS_API_BASE = 'https://www.googleapis.com/tasks/v1';

export async function getServiceAccountTaskLists(
  accessToken: string
): Promise<ApiResultWithData<GoogleServiceAccountList[]>> {
  try {
    const response = await fetch(GOOGLE_TASKS_API_BASE + '/users/@me/lists', {
      headers: {
        'Authorization': 'Bearer ' + accessToken,
      },
    });
    
    if (!response.ok) {
      return { success: false, error: 'Failed to get task lists: ' + response.status };
    }
    
    const data = await response.json() as { items?: GoogleServiceAccountList[] };
    const items = data.items || [];
    
    console.log('[GoogleServiceAccount] Retrieved ' + items.length + ' task lists');
    return { success: true, data: items };
  } catch (error) {
    console.error('[GoogleServiceAccount] Failed to get task lists:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getServiceAccountTasks(
  accessToken: string,
  tasklistariId: string = '@default'
): Promise<ApiResultWithData<GoogleTask[]>> {
  try {
    const response = await fetch(GOOGLE_TASKS_API_BASE + '/lists/' + tasklistariId + '/tasks', {
      headers: {
        'Authorization': 'Bearer ' + accessToken,
      },
    });
    
    if (!response.ok) {
      return { success: false, error: 'Failed to get tasks: ' + response.status };
    }
    
    const data = await response.json() as { items?: GoogleTask[] };
    const items = data.items || [];
    
    console.log('[GoogleServiceAccount] Retrieved ' + items.length + ' tasks from list ' + tasklistariId);
    return { success: true, data: items };
  } catch (error) {
    console.error('[GoogleServiceAccount] Failed to get tasks:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function createServiceAccountTask(
  accessToken: string,
  tasklistariId: string,
  task: { title: string; notes?: string }
): Promise<ApiResultWithData<GoogleTask>> {
  try {
    const response = await fetch(GOOGLE_TASKS_API_BASE + '/lists/' + tasklistariId + '/tasks', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: task.title,
        notes: task.notes,
        status: 'needsAction',
      }),
    });
    
    if (!response.ok) {
      return { success: false, error: 'Failed to create task: ' + response.status };
    }
    
    const data = await response.json() as GoogleTask;
    console.log('[GoogleServiceAccount] Created task: ' + task.title);
    return { success: true, data };
  } catch (error) {
    console.error('[GoogleServiceAccount] Failed to create task:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateServiceAccountTask(
  accessToken: string,
  tasklistariId: string,
  taskId: string,
  updates: Partial<GoogleTask>
): Promise<ApiResultWithData<GoogleTask>> {
  try {
    const response = await fetch(GOOGLE_TASKS_API_BASE + '/lists/' + tasklistariId + '/tasks/' + taskId, {
      method: 'PATCH',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      return { success: false, error: 'Failed to update task: ' + response.status };
    }
    
    const data = await response.json() as GoogleTask;
    console.log('[GoogleServiceAccount] Updated task: ' + taskId);
    return { success: true, data };
  } catch (error) {
    console.error('[GoogleServiceAccount] Failed to update task:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteServiceAccountTask(
  accessToken: string,
  tasklistariId: string,
  taskId: string
): Promise<ApiResultData> {
  try {
    const response = await fetch(GOOGLE_TASKS_API_BASE + '/lists/' + tasklistariId + '/tasks/' + taskId, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
      },
    });
    
    if (!response.ok) {
      return { success: false, error: 'Failed to delete task: ' + response.status };
    }
    
    console.log('[GoogleServiceAccount] Deleted task: ' + taskId);
    return { success: true };
  } catch (error) {
    console.error('[GoogleServiceAccount] Failed to delete task:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function createServiceAccountTaskList(
  accessToken: string,
  title: string
): Promise<ApiResultWithData<GoogleServiceAccountList>> {
  try {
    const response = await fetch(GOOGLE_TASKS_API_BASE + '/users/@me/lists', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });
    
    if (!response.ok) {
      return { success: false, error: 'Failed to create task list: ' + response.status };
    }
    
    const data = await response.json() as GoogleServiceAccountList;
    console.log('[GoogleServiceAccount] Created task list: ' + title);
    return { success: true, data };
  } catch (error) {
    console.error('[GoogleServiceAccount] Failed to create task list:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getTaskListsWithServiceAccount(): Promise<GoogleServiceAccountList[]> {
  const accessToken = await getServiceAccountAccessToken();
  if (!accessToken) {
    throw new Error('Failed to create Service Account access token');
  }
  const result = await getServiceAccountTaskLists(accessToken);
  if (!result.success) {
    throw new Error(result.error || 'Unknown error');
  }
  return result.data || [];
}

export async function getTasksWithServiceAccount(tasklistariId: string = '@default'): Promise<GoogleTask[]> {
  const accessToken = await getServiceAccountAccessToken();
  if (!accessToken) {
    throw new Error('Failed to create Service Account access token');
  }
  const result = await getServiceAccountTasks(accessToken, tasklistariId);
  if (!result.success) {
    throw new Error(result.error || 'Unknown error');
  }
  return result.data || [];
}

export async function createTaskWithServiceAccount(
  tasklistariId: string,
  task: { title: string; notes?: string }
): Promise<GoogleTask> {
  const accessToken = await getServiceAccountAccessToken();
  if (!accessToken) {
    throw new Error('Failed to create Service Account access token');
  }
  const result = await createServiceAccountTask(accessToken, tasklistariId, task);
  if (!result.success) {
    throw new Error(result.error || 'Unknown error');
  }
  if (result.data === undefined) {
    throw new Error('Task creation returned no data');
  }
  return result.data;
}

export async function getOrCreateServiceAccountTaskList(listName: string): Promise<GoogleServiceAccountList> {
  const accessToken = await getServiceAccountAccessToken();
  if (!accessToken) {
    throw new Error('Failed to create Service Account access token');
  }

  const lists = await getServiceAccountTaskLists(accessToken);
  if (!lists.success || !lists.data) {
    throw new Error(lists.error || 'Failed to get task lists');
  }

  const existingList = lists.data.find((list) => list.title === listName);
  
  if (existingList) {
    console.log('[GoogleServiceAccount] Found existing list: ' + listName);
    return existingList;
  }

  console.log('[GoogleServiceAccount] Creating new list: ' + listName);
  const result = await createServiceAccountTaskList(accessToken, listName);
  if (!result.success) {
    throw new Error(result.error || 'Failed to create task list');
  }
  if (result.data === undefined) {
    throw new Error('Task list creation returned no data');
  }
  return result.data;
}

const googleServiceAccountModule = {
  getServiceAccountAccessToken,
  getServiceAccountTaskLists,
  getServiceAccountTasks,
  createServiceAccountTask,
  updateServiceAccountTask,
  deleteServiceAccountTask,
  createServiceAccountTaskList,
  getTaskListsWithServiceAccount,
  getTasksWithServiceAccount,
  createTaskWithServiceAccount,
  getOrCreateServiceAccountTaskList,
  isServiceAccountConfigured,
  loadServiceAccountConfig,
};

export default googleServiceAccountModule;
