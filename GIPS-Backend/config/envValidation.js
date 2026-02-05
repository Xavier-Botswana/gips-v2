/**
 * Environment Variable Validation Configuration
 * Defines all required and optional environment variables
 * with their validation rules and requirements
 */

const isDev = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

// Environment variable definitions
const envConfig = {
  // Critical - Application won't start without these
  required: {
    // Database
    DB_URL: {
      required: true,
      description: 'PocketBase database URL',
      format: 'url',
      example: 'http://localhost:8090',
    },
    
    // Security
    JWT_SECRET: {
      required: true,
      description: 'JWT signing secret',
      minLength: 32,
      validate: (value) => {
        if (value && value.length < 32) {
          return 'JWT_SECRET must be at least 32 characters for security';
        }
        return null;
      },
    },
    
    // Application
    NODE_ENV: {
      required: true,
      description: 'Application environment',
      allowedValues: ['development', 'production', 'test'],
      default: 'development',
    },
  },
  
  // Required in production only
  requiredInProduction: {
    // Email Configuration
    GIPS_SMTP_USER: {
      required: !isDev && !isTest,
      description: 'SMTP username for sending emails',
      format: 'email',
    },
    GIPS_SMTP_PASSWORD: {
      required: !isDev && !isTest,
      description: 'SMTP password',
      minLength: 1,
    },
    
    // SMS Configuration (Twilio)
    TWILIO_ACCOUNT_SID: {
      required: !isDev && !isTest,
      description: 'Twilio Account SID',
      format: 'regex',
      pattern: /^AC[a-f0-9]{32}$/i,
      example: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    },
    TWILIO_AUTH_TOKEN: {
      required: !isDev && !isTest,
      description: 'Twilio Auth Token',
      minLength: 32,
    },
    TWILIO_PHONE_NUMBER: {
      required: !isDev && !isTest,
      description: 'Twilio phone number for sending SMS',
      format: 'phone',
      example: '+1234567890',
    },
    
    // External Services
    DTEF_USERNAME: {
      required: !isDev && !isTest,
      description: 'DTEF API username',
    },
    DTEF_PASSWORD: {
      required: !isDev && !isTest,
      description: 'DTEF API password',
    },
  },
  
  // Optional but recommended
  optional: {
    PORT: {
      required: false,
      description: 'Server port',
      format: 'number',
      default: 8000,
      validate: (value) => {
        const port = parseInt(value, 10);
        if (isNaN(port) || port < 1 || port > 65535) {
          return 'PORT must be a valid port number (1-65535)';
        }
        return null;
      },
    },
    
    // Logging
    LOG_LEVEL: {
      required: false,
      description: 'Winston log level',
      allowedValues: ['error', 'warn', 'info', 'verbose', 'debug', 'silly'],
      default: isDev ? 'debug' : 'info',
    },
    
    // Rate Limiting
    RATE_LIMIT_WHITELIST: {
      required: false,
      description: 'Comma-separated list of IPs to exempt from rate limiting',
      format: 'list',
      example: '192.168.1.1,10.0.0.1',
    },
    
    // Monitoring
    MONITORING_TOKEN: {
      required: false,
      description: 'Token for monitoring service health checks',
    },
    
    // CORS
    CORS_ORIGINS: {
      required: false,
      description: 'Additional allowed CORS origins (comma-separated)',
      format: 'list',
      example: 'https://example.com,https://app.example.com',
    },
    
    // File Uploads
    MAX_FILE_SIZE: {
      required: false,
      description: 'Maximum file upload size in MB',
      format: 'number',
      default: 10,
    },
  },
};

// Group all variables for easy iteration
const allVariables = {
  ...envConfig.required,
  ...envConfig.requiredInProduction,
  ...envConfig.optional,
};

// Get variables by category
const getVariablesByCategory = (category) => {
  return Object.entries(envConfig[category] || {}).map(([name, config]) => ({
    name,
    ...config,
  }));
};

// Check if a variable is required in current environment
const isRequired = (variableName) => {
  const config = allVariables[variableName];
  if (!config) return false;
  
  if (typeof config.required === 'function') {
    return config.required();
  }
  
  return config.required;
};

module.exports = {
  envConfig,
  allVariables,
  getVariablesByCategory,
  isRequired,
  isDev,
  isTest,
};
