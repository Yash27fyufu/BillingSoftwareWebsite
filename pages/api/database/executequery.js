


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



// this is perfectly working for streams (sending data chunks one by one to front end ) :


/*


const mysql = require('mysql');
const connectionPool = mysql.createPool(process.env.DATABASE_CREDENTIALS);

export default async function executeQuery({ query, values, useStream = false }) {
  if (query.toString().includes(";")) {
    return { error: "Improper query." };
  }

  return new Promise((resolve, reject) => {
    connectionPool.getConnection((err, connection) => {
      if (err) {
        if (connection) connection.destroy();
        return reject(err);
      }

      if (useStream) {
        try {
          const stream = connection.query(query, values).stream();
          connection.release(); // Release connection back to the pool
          resolve(stream); // Return the stream for further processing
        } catch (streamErr) {
          connection.destroy();
          reject(streamErr);
        }
      } else {
        connection.query(query, values, (err, results) => {
          connection.destroy(); // Destroy connection for non-streaming queries
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


// if you use streams this is an exapmple api file::::



import executeQuery from "../../database/executequery";



export default async function Handler(req, res) {
    try {

        const { limit, offset } = req.query

        const result = await compute(req.body, limit, offset);

        // If the result is streamHandled, the response is already being handled in the stream handler.
        if (result.streamHandled) {
            return;  // Ensure no further response is sent
        }

        // If no stream was used, return the standard response
        return res.status(200).json({ success: true, autoCompleteResult: result.data });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: "Invalid User Token" });
    }
}

async function compute(details, limit=100, offset=0 ) {
    let result;
    try {







// if you want to fetch all of the data instead of limit and offset use primary keys to handle the same thing









// something like this






// SELECT * FROM table_name WHERE id > last_id LIMIT limit;


//  this will reduce the time to process the request but only if everything is to be fetched














        // Execute query with stream enabled
        result = await executeQuery({
            query: "SELECT * FROM USERS LIMIT " + limit + " OFFSET " + offset,
            values: [limit, offset],
            useStream: true,
        });

        if (isStream(result)) {
            // If result is a stream, handle it and set streamHandled to true
            return handleStream(result, res);
        }
    } catch (e) {
        console.error("Fallback to ITEMS table   " + e);
        // try {
        //     result = await executeQuery({
        //         query: "SELECT * FROM ITEMS",
        //         useStream: true,
        //     });

        //     if (isStream(result)) {
        //         return handleStream(result, res);  // Will send the response stream
        //     }
        // } catch (fallbackError) {
        //     console.error("Error during fallback query:", fallbackError);
        //     return { error: "Failed to execute query." };
        // }
    }

    // Return result for non-streaming queries, streamHandled is false
    return { data: result, streamHandled: false };
}

function handleStream(stream, res) {
    res.setHeader("Content-Type", "application/json");
    res.write('{"success": true, "data": [');

    let firstRow = true;

    return new Promise((resolve, reject) => {
        stream.on("data", (row) => {
            // Send each row as it is received
            if (!firstRow) {
                res.write(",");
            }
            res.write(JSON.stringify(row));
            firstRow = false;

            // Optionally flush after each chunk
            res.flush();
        });

        stream.on("end", () => {
            res.write("]}");
            res.end();
            resolve({ streamHandled: true });
        });

        stream.on("error", (err) => {
            console.error("Stream Error:", err);
            res.status(500).json({ error: "Stream error occurred." });
            reject(err);
        });
    });
}

function isStream(obj) {
    return obj && typeof obj.pipe === "function" && obj.readable !== undefined;
}











*/
















