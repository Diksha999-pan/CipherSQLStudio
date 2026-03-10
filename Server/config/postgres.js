const { Pool } = require("pg");

// Pool maintains multiple connections — more efficient than single Client
// for a web server handling concurrent requests
const pool = new Pool({
  connectionString: process.env.POSTGRES_URI,
  // Safety limits: prevents runaway queries from blocking the DB
  statement_timeout: 5000,     // 5s max per query
  query_timeout: 5000,
});

const connectPostgres = async () => {
  try {
    const client = await pool.connect();
    console.log("PostgreSQL connected");
    client.release(); // release back to pool immediately after test
  } catch (err) {
    console.error("PostgreSQL connection failed:", err.message);
    process.exit(1);
  }
};

module.exports = connectPostgres;
module.exports.pool = pool;