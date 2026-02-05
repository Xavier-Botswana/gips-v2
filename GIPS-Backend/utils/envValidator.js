/**
 * Environment Variable Validator
 * Validates all environment variables on application startup
 * Fails fast with clear error messages if configuration is invalid
 */

const { 
  envConfig, 
  allVariables, 
  getVariablesByCategory,
  isRequired,
  isDev,
  isTest,
} = require('../config/envValidation');
const appLogger = require('./appLogger');

// Validation functions for different formats
const validators = {
  // URL format validation
  url: (value, name) => {
    try {
      new URL(value);
      return null;
    } catch {
      return `${name} must be a valid URL (e.g., http://localhost:8090)`;
    }
  },
  
  // Email format validation
  email: (value, name) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return `${name} must be a valid email address`;
    }
    return null;
  },
  
  // Phone number validation (E.164 format)
  phone: (value, name) => {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(value)) {
      return `${name} must be a valid phone number in E.164 format (e.g., +1234567890)`;
    }
    return null;
  },
  
  // Number validation
  number: (value, name) => {
    if (isNaN(parseFloat(value))) {
      return `${name} must be a valid number`;
    }
    return null;
  },
  
  // Regex pattern validation
  regex: (value, name, pattern) => {
    if (pattern && !pattern.test(value)) {
      return `${name} format is invalid`;
    }
    return null;
  },
  
  // List validation (comma-separated)
  list: (value, name) => {
    // Lists are valid as long as they're strings
    return null;
  },
};

// Validate a single environment variable
const validateVariable = (name, config, value) => {
  const errors = [];
  
  // Check if required but missing
  if (config.required && !value) {
    errors.push({
      variable: name,
      error: 'Required environment variable is missing',
      description: config.description,
      example: config.example,
    });
    return errors;
  }
  
  // If not required and not present, skip validation
  if (!config.required && !value) {
    return errors;
  }
  
  // Check minimum length
  if (config.minLength && value.length < config.minLength) {
    errors.push({
      variable: name,
      error: `Must be at least ${config.minLength} characters`,
      current: `${value.length} characters`,
      description: config.description,
    });
  }
  
  // Check allowed values
  if (config.allowedValues && !config.allowedValues.includes(value)) {
    errors.push({
      variable: name,
      error: `Must be one of: ${config.allowedValues.join(', ')}`,
      current: value,
      description: config.description,
    });
  }
  
  // Check format
  if (config.format && validators[config.format]) {
    const formatError = validators[config.format](value, name, config.pattern);
    if (formatError) {
      errors.push({
        variable: name,
        error: formatError,
        description: config.description,
      });
    }
  }
  
  // Run custom validation if provided
  if (config.validate) {
    const customError = config.validate(value);
    if (customError) {
      errors.push({
        variable: name,
        error: customError,
        description: config.description,
      });
    }
  }
  
  return errors;
};

// Main validation function
const validateEnvironment = () => {
  appLogger.info('Validating environment variables...');
  appLogger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  const errors = [];
  const warnings = [];
  
  // Validate required variables
  const requiredVars = getVariablesByCategory('required');
  for (const config of requiredVars) {
    const value = process.env[config.name];
    const variableErrors = validateVariable(config.name, config, value);
    errors.push(...variableErrors);
  }
  
  // Validate production-required variables
  const productionVars = getVariablesByCategory('requiredInProduction');
  for (const config of productionVars) {
    const value = process.env[config.name];
    const variableErrors = validateVariable(config.name, config, value);
    
    // If in dev and missing, treat as warning instead of error
    if (isDev && variableErrors.length > 0) {
      warnings.push({
        variable: config.name,
        warning: 'Missing in development mode',
        description: config.description,
        note: 'This will be required in production',
      });
    } else {
      errors.push(...variableErrors);
    }
  }
  
  // Validate optional variables (only if present)
  const optionalVars = getVariablesByCategory('optional');
  for (const config of optionalVars) {
    const value = process.env[config.name];
    if (value) {
      const variableErrors = validateVariable(config.name, config, value);
      errors.push(...variableErrors);
    }
  }
  
  return { errors, warnings };
};

// Format and display validation results
const displayValidationResults = (errors, warnings) => {
  const requiredVars = getVariablesByCategory('required');
  // Display warnings
  if (warnings.length > 0) {
    appLogger.warn('Warnings:');
    warnings.forEach((warning, index) => {
      appLogger.warn(`${index + 1}. ${warning.variable}`);
      appLogger.warn(`Warning: ${warning.warning}`);
      appLogger.warn(`Description: ${warning.description}`);
      if (warning.note) {
        appLogger.warn(`Note: ${warning.note}`);
      }
    });
  }
  
  // Display errors
  if (errors.length > 0) {
    appLogger.error('Validation Errors:');
    errors.forEach((error, index) => {
      appLogger.error(`${index + 1}. ${error.variable}`);
      appLogger.error(`Error: ${error.error}`);
      appLogger.error(`Description: ${error.description}`);
      if (error.current) {
        appLogger.error(`Current value: ${error.current}`);
      }
      if (error.example) {
        appLogger.error(`Example: ${error.example}`);
      }
    });
    
    appLogger.error('Environment validation failed!');
    appLogger.error('To fix these issues:');
    appLogger.error('1. Copy .env.example to .env');
    appLogger.error('2. Fill in all required variables');
    appLogger.error('3. Ensure values meet the format requirements');
    appLogger.error('Required environment variables:');
    
    const required = getVariablesByCategory('required');
    required.forEach(config => {
      appLogger.error(`- ${config.name}: ${config.description}`);
    });
    
    if (!isDev && !isTest) {
      appLogger.error('Required in production:');
      const prodRequired = getVariablesByCategory('requiredInProduction');
      prodRequired.forEach(config => {
        appLogger.error(`- ${config.name}: ${config.description}`);
      });
    }
    
    return false;
  }
  
  // Success
  const totalVars = Object.keys(allVariables).length;
  appLogger.info('Environment validation passed');
  appLogger.info(`${requiredVars.length} required variables configured`);
  appLogger.info(`${Object.keys(process.env).filter(key => allVariables[key]).length}/${totalVars} environment variables set`);
  
  return true;
};

// Main validation function to be called on startup
const validateEnvOnStartup = () => {
  const { errors, warnings } = validateEnvironment();
  const isValid = displayValidationResults(errors, warnings);
  
  if (!isValid) {
    process.exit(1);
  }
  
  return true;
};

// Get sanitized environment variables with defaults
const getEnv = (name, defaultValue = null) => {
  const config = allVariables[name];
  const value = process.env[name];
  
  if (value !== undefined) {
    return value;
  }
  
  if (config && config.default !== undefined) {
    return config.default;
  }
  
  return defaultValue;
};

module.exports = {
  validateEnvironment,
  validateEnvOnStartup,
  getEnv,
  displayValidationResults,
};
