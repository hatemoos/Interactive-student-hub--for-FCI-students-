const { Pool } = require('pg');
const pool = new Pool({
    user: 'postgres',     
    host: 'localhost',      
    database: 'postgres',
    password: '25357684951', 
    port: 5432,             
  });
  pool.connect((err, client, done) => {
    if (err) {
      console.error('Connection error', err.stack);
    } else {
      console.log('Connected to PostgreSQL');
      done();
    }
  });

module.exports = pool;
