if (!process.env.DB_URL) {
  // Fail fast if misconfigured; keeps downstream errors clearer
  throw new Error('DB_URL environment variable is required for PocketBase connection');
}

exports.BASE_URL = process.env.DB_URL;
