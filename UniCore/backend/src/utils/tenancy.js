const mongoose = require('mongoose');
const University = require('../models/University');

const connectionCache = {};

/**
 * Get or create a connection to a specific university database
 */
const getUniversityConnection = async (dbName) => {
  if (!dbName) return mongoose.connection; // Fallback to main connection

  if (connectionCache[dbName]) {
    const conn = connectionCache[dbName];
    // Check if connection is still alive
    if (conn.readyState === 1) return conn;
    // If not alive, delete from cache and recreate
    delete connectionCache[dbName];
  }

  const baseUri = process.env.MONGO_URI || 'mongodb://localhost:27017/edubridge';
  // Replace the database part of the URI
  const uriParts = baseUri.split('/');
  const dbPart = uriParts.pop();
  const uri = `${uriParts.join('/')}/${dbName}`;

  console.log(`Connecting to tenant DB: ${dbName}...`);
  const conn = mongoose.createConnection(uri);

  connectionCache[dbName] = conn;
  return conn;
};

/**
 * Get a model for a specific connection
 * This helper ensures schemas are correctly attached to the tenant connection
 */
const getModel = (connection, modelName) => {
  // We need to import the original model to get its schema
  // Note: Using dynamic require inside here might be slow, but it's a way to ensure we have the schema
  let schema;
  try {
    const originalModel = mongoose.model(modelName);
    schema = originalModel.schema;
  } catch (e) {
    // If model isn't registered on main connection, we might need to load it
    // This part depends on how models are structured
    console.error(`Model ${modelName} not found on main connection.`);
    return null;
  }

  // Avoid "OverwriteModelError" on the tenant connection
  if (connection.models[modelName]) {
    return connection.models[modelName];
  }

  return connection.model(modelName, schema);
};

module.exports = {
  getUniversityConnection,
  getModel
};
