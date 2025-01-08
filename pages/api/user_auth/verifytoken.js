import executeQuery from "../database/executequery";
import moment from "moment";


export default async function Handler(req, res) {
  try {
    if (req.method == "POST") {
      var result = await compute(req);
      if (result.error) {
        res.send(result);
        return;
      }
      res.status(200).json({ success: true });
    } else {
      res.status(404).json({ error: "Not found", notFound: true });
    }
  } catch (err) {
    console.error(err);

    res.status(400).end();

  }
}
async function compute(details) {
  const clientIp = details.headers['x-forwarded-for'] || details.connection.remoteAddress;

  var result = await executeQuery({
    query: "SELECT USER_ID,TOKEN_EXPIRY_TIME FROM USER_TOKENS WHERE BINARY USER_TOKEN=? AND DEVICE_IP=?",
    values: [details.body.token, clientIp],
  });
  if (result.length == 0) {
    return { error: "Invalid Token " };
  } else {

    if (new Date() < moment(result[0].TOKEN_EXPIRY_TIME).toDate()) {

      return result[0].USER_ID;

    } else {
      return { error: "Token Expired" };
    }


  }
}