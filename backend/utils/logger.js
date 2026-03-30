import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.join(__dirname, '..', 'logs');

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const getLogFilePath = (type) => {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return path.join(logsDir, `${type}-${date}.log`);
};

// Format timestamp for logs
const getTimestamp = () => {
  return new Date().toISOString();
};

// Log to both console and file
const writeLog = (type, level, message, data = null) => {
  const timestamp = getTimestamp();
  const logEntry = {
    timestamp,
    level,
    type,
    message,
    ...(data && { data }),
  };
  
  const logLine = JSON.stringify(logEntry) + '\n';
  
  // Write to console for development
  if (process.env.NODE_ENV !== 'production' || level === 'error') {
    console.log(logLine);
  }
  
  // Write to file for all environments
  try {
    const logFile = getLogFilePath(type);
    fs.appendFileSync(logFile, logLine, 'utf8');
  } catch (err) {
    console.error('Failed to write log:', err.message);
  }
};

export const logger = {
  // Auth logs
  auth: (message, level = 'info', data) => {
    writeLog('auth', level, message, data);
  },
  
  // SMS/Phone logs
  sms: (message, level = 'info', data) => {
    writeLog('sms', level, message, data);
  },
  
  // Email logs
  email: (message, level = 'info', data) => {
    writeLog('email', level, message, data);
  },
  
  // API/Request logs
  api: (message, level = 'info', data) => {
    writeLog('api', level, message, data);
  },
  
  // Database logs
  db: (message, level = 'info', data) => {
    writeLog('db', level, message, data);
  },
  
  // Generic
  log: (type, message, level = 'info', data) => {
    writeLog(type, level, message, data);
  },
};

// Also export old console methods for backward compatibility in critical paths
export const createRequestId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
