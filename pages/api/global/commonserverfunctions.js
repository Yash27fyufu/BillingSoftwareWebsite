import executeQuery from "../database/executequery";

export var domain_name = 'http://localhost:3030';

// export var domain_name = 'http://everystint.com';


export default async function toMysqlDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function parseInteger(stringvalue, prefixZeroAllowed = true) {
  if (isNaN(stringvalue)) {
    if (stringvalue == "-" || stringvalue == "0-") {
      return null
    }
    return 0;
  }
  if (stringvalue == null) {
    return 0;
  } else if (stringvalue == "") {
    return 0;
  }
  else {
    if (stringvalue[stringvalue.length - 1] == ".") {//decimal point is typed
      return stringvalue;
    } else {
      if (prefixZeroAllowed) {
        return stringvalue
      } else {
        return parseFloat(stringvalue);
      }
    }
  }
}

export async function verifyUserToken(token) {
  if (token) {
    var tokenverification = await executeQuery({
      query: "SELECT * FROM USER_TOKENS WHERE USER_TOKEN = ?",
      values: [token]
    });
    if (tokenverification.length == 0) {
      return res.status(400).json({ error: "Invalid User token", });

    } else if (new Date(tokenverification[0].TOKEN_EXPIRY_TIME) < new Date()) {
      return res.status(400).json({ error: "User token expired", });

    } else {
      return true
    }
  } else {
    return res.status(400).json({ error: "User token not found", });
  }
}

export async function beginTransaction() {
  await executeQuery({
    query: "START TRANSACTION",
  });
}

export async function commitTransaction() {
  await executeQuery({
    query: "COMMIT",
  });
}

export async function rollbackTransaction() {
  await executeQuery({
    query: "ROLLBACK",
  });
}











