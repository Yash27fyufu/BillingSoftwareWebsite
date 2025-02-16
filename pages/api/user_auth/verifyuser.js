import executeQuery from "../database/executequery";
import toMysqlDateTime from "../global/commonserverfunctions";

export default async function Handler(req, res) {
  try {
    if (req.method == "POST") {

      var result = await compute(req);

      if (result.error) {
        res.send(result);
        return;
      }
      res.status(200).json({ success: true, data: result });

    } else {
      res.status(404).json({ error: "Not found", notFound: true });
    }
  } catch (err) {
        res.status(400).json({ error: "Invalid User Token "+err, });
    
  }
}
async function compute(details) {

  const clientIp = details.headers['x-forwarded-for'] || details.connection.remoteAddress;

  //to check data is proper
  const check = checkInput(details.body);

  if (!check) {
    return check;
  }

  //to check if user exists
  const db_check = await checkDB(details.body);

  if (!db_check) {
    return { error: "Invalid User Credentials ", input: true };
  }

  //to check if token for that user already exists
  const token_check = await checkToken(details, clientIp, db_check);

  if (!token_check) {

    var token_hash = await gettokenhash(details.body.username, details.body.password)

    var encryptedtoken = encryptWithKey(clientIp, token_hash);
    await executeQuery({
      query: `INSERT INTO USER_TOKENS(
        USER_ID,
        USER_TOKEN,
        TOKEN_EXPIRY_TIME,
        DEVICE_IP
        )
        VALUES(?,?,?,?)
        `,
      values: [
        db_check,
        encryptedtoken,
        details.body.rememberMe ? //if rememberme then 30 days else 1 day
          await toMysqlDateTime(new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000)) :
          await toMysqlDateTime(new Date(new Date().getTime() + 1 * 2 * 60 * 60 * 1000)),
        clientIp
      ],
    });
  
    return { token: encryptedtoken };
  
  } else {
    return { token: token_check };

  }

}

async function checkDB(details) {






  // add some kind of encryption here for the password and ig encrypt it from the clientside itself then it would be more good so no
  // packets could be traced down to ge the password and we dont want the actual password 











  var result_username = await executeQuery({
    query: "SELECT USER_ID FROM USERS WHERE BINARY USER_NAME=? AND USER_PASSWORD=?",
    values: [details.username, details.password],
  });

  if (result_username.length == 0) {
    // no such user exists
    return false;
  } else {

    return result_username[0].USER_ID;
  }

}

async function checkToken(details, clientIp, user_company_id) {

  var result_username = await executeQuery({
    query: "SELECT USER_TOKEN , TOKEN_EXPIRY_TIME FROM USER_TOKENS WHERE USER_ID=? AND DEVICE_IP=?",
    values: [user_company_id, clientIp],
  });
  if (result_username.length == 0) {
    // no token for the device exists
    return false;
  } else {
    // a token is available so updating its validity
    await executeQuery({
      query: "UPDATE USER_TOKENS SET TOKEN_EXPIRY_TIME=? WHERE USER_TOKEN=?",
      values: [
        details.body.rememberMe ? //if rememberMe then 30 days else 1 day
          await toMysqlDateTime(new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000)) :
          await toMysqlDateTime(new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000)),
        result_username[0].USER_TOKEN],
    });

    return result_username[0].USER_TOKEN;
  }

}

async function gettokenhash(username, password) {
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256').update(username + password + new Date()).digest('hex');
  return hash;
}

function checkInput(details) {
  if (!(details.username && details.username != "")) {
    return { error: "Username is not given", input: true };
  }
  if (!(details.password && details.password != "")) {
    return { error: "Password is not given", input: true };
  }

  return true;
}




const crypto = require('crypto');

function encryptWithKey(key, data) {
  const cipher = crypto.createCipher('aes-256-cbc', key);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}


// const crypto = require('crypto');

// function decryptWithKey(key, ciphertext) {
//   const decipher = crypto.createDecipher('aes-256-cbc', key);
//   let decrypted = decipher.update("1e0e555b08a870ba31c758ac7d2091106dad9ad87c518b217eebb45af146ab3d610e92d1e620c0cb805fd03ecfca1bab8279a63d8ed06c0dffb1a017cde24e925a136b2a04e6a61e71edf0312c14addd", 'hex', 'utf8');
//   decrypted += decipher.final('utf8');
//   return decrypted;
// }

