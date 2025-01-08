




var mysql = require('mysql');
const connectionPool = mysql.createPool(process.env.DATABASE_CREDENTIALS);

export default async function executeQuery({ query, values }) {
  if (query.toString().includes(";")) {
    return { error: "Improper query." }
  }

  return new Promise((resolve, reject) => {
    connectionPool.getConnection((err, connection) => {
      if (err) {
        // Doesn't release the connection back to the pool just destroy
        if (connection)
          connection.destroy();
        return reject(err);
      } else {
        connection.query(query, values, (err, results) => {
          // Doesn't release the connection back to the pool just destroy
          connection.destroy();
          if (err) {
            return reject(err);

          } else {
            resolve(results);

          }
        });
      }

    });
  });
}


// if suppose the above code leads to some error
// even the below code works awesome
// and is more efficient


/*
import mysql from "mysql";

const pool = mysql.createPool(process.env.DATABASE_CREDENTIALS);

// Function to close the connection pool
function closeConnectionPool() {
  pool.end((err) => {
    if (err) {
      console.error("Error closing the connection pool:", err);
    } else {
    }
  });
}

// Add an event listener for the application's shutdown event
process.on('SIGINT', () => {
  closeConnectionPool();
  process.exit(0);
});

export default async function executeQuery({ query, values }) {
  try {
    return new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return;
        }
        // Remove the error listener if connection is successful
        connection.removeAllListeners("error");
        connection.query(query, values, (err, rows) => {
          connection.release();
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
        // Add an error listener to handle connection errors
        connection.on("error", (err) => {
          connection.release();
          reject(err);
        });
      });
    });
  } catch (error) {
  }
}

export function getConnection() {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        if (connection) {
          connection.release();
        }
        reject(err);
      }
      resolve(connection);
      connection.on("error", (err) => {
        if (connection) {
          connection.release();
        }
        reject(err);
      });
    });
  });
}

export async function offAutoCommit(connection) {
  await connection.query('SET autocommit = 0');
}

export async function onAutoCommit(connection) {
  await connection.query('SET autocommit = 1');
}
 */