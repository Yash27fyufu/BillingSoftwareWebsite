const mysql = require("mysql");
const mode = "development";
const db =
  mode == "development"
    ? mysql.createPool({
      host: "localhost",
      user: "root",
      password: "mysql",
      connectionLimit: 100,
      port: 3306,
    })
    : mysql.createPool({
      host: "localhost",
      user: "thegaadi_root",
      password: "85gQiGq1DqY6",
      connectionLimit: 100,
      port: 3306,
    });

const delete_query = `
DROP DATABASE erp_software_db;
`;
const create_query = `
CREATE DATABASE erp_software_db;
`;
db.query(delete_query, function (err) {
  if (err) {
    console.error(err);
  } else {
    db.query(create_query, function (err) {
      if (err) {
        console.error(err);
      } else {
        console.warn("Done")
      }
    });
  }
});
