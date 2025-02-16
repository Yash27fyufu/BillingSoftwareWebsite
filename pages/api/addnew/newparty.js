import executeQuery from "../database/executequery";
import { beginTransaction, commitTransaction, parseInteger, rollbackTransaction, verifyUserToken } from "../global/commonserverfunctions";


export default async function Handler(req, res) {
    try {
        var tokenverification = await verifyUserToken(req.body.token)

        if (tokenverification) {
            beginTransaction()
            if (req.method == "POST") {
                var result = await checkForDuplicate(req.body);

                if (result.error) {
                    rollbackTransaction()
                    res.send(result);
                    return;
                }
                commitTransaction()
                return res.status(200).json({ success: true, result: result });
            } else {
                return res.status(404).json({ error: "Not found", notFound: true });
            }
        } else {
            res.status(400).json({ error: "Error in verifying User Token", });

        }

    } catch (err) {
        res.status(400).json({ error: "Invalid User Token "+ err, });

    }
}
async function checkForDuplicate(details) {

    //if its not a cash party then check if that name or gstin exists

    if (!(details.PartyDetails.isCashEntry)) {

        var checkduplicate = await executeQuery({
            query: "SELECT * FROM PARTIES WHERE PARTY_NAME = ?",
            values: [details.PartyDetails.PARTY_NAME]
        });

        if (checkduplicate.length != 0) {





            // if a party is deleted it is deleted no other thing 
            // think what to do with the DISPLAY option



            return { error: "Party already exists with id : " + checkduplicate[0].PARTY_ID };

        }
        else if (details.PartyDetails.PARTY_GST) {

            var checkduplicate = await executeQuery({
                query: "SELECT * FROM PARTIES WHERE PARTY_GST = ?",
                values: [details.PartyDetails.PARTY_GST]
            });
            if (checkduplicate.length != 0) {
                // if gst num is already present but name is diff and display might be false

                return { error: "GSTin already in use with : " + checkduplicate[0].PARTY_NAME, };

            }
        }
    }

    var party_id;

    if (details.PartyDetails.isCashEntry) {
        party_id = await executeQuery({
            query: "SELECT MAX(PARTY_ID) AS MAX FROM CASH_PARTIES ",
        });
    } else {
        party_id = await executeQuery({
            query: "SELECT MAX(PARTY_ID) AS MAX FROM PARTIES ",
        });
    }

    party_id = party_id[0]['MAX'];

    if (party_id == null) {
        party_id = 1;
    } else {
        party_id += 1;
    }

    return await insertDatainTable(details, party_id)


}

async function insertDatainTable(details, party_id) {
    var checking = checkForRequiredDetails(details);

    if (checking.error) {
        return checking
    }
    if (details.PartyDetails.isCashEntry) {
        await executeQuery({
            query: `INSERT INTO CASH_PARTIES(
                PARTY_ID,
                PARTY_ADDRESS,
                PARTY_PINCODE,
                PARTY_MAIL,
                PARTY_GST,
                PARTY_NUMBER_1,
                DISPLAY,
                BILLING_NAME
              )
              VALUES(?,?,?,?,?,?,?,?)
              `,
            values: [
                party_id,
                (details.PartyDetails.PARTY_ADDRESS).trim(),
                parseInteger(details.PartyDetails.PARTY_PINCODE),
                (details.PartyDetails.PARTY_MAIL).trim(),
                details.PartyDetails.PARTY_GST,
                details.PartyDetails.PARTY_NUMBER_1,
                true,
                (details.PartyDetails.BILLING_NAME).trim(),
            ],
        });


        if (details.PartyDetails.NOTE) {
            await executeQuery({
                query: `INSERT INTO CASH_PARTIES_NOTE(
            CASH_PARTY_ID,
            NOTE
          )
          VALUES(?,?)
          `,
                values: [
                    party_id,
                    (details.PartyDetails.NOTE).trim(),
                ],
            });
        }
    } else {
        await executeQuery({
            query: `INSERT INTO PARTIES(
                PARTY_ID,
                PARTY_NAME,
                PARTY_ADDRESS,
                PARTY_PINCODE,
                PARTY_MAIL,
                PARTY_GST,
                PARTY_NUMBER_1,
                PARTY_NUMBER_2,
                PARTY_OPENING_BALANCE,
                PARTY_OPENING_BALANCE_DATE,
                DISPLAY,
                BILLING_NAME,
                TRANSPORT_NAME,
                TO_RECEIVE
              )
              VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)
              `,
            values: [
                party_id,
                (details.PartyDetails.PARTY_NAME).trim(),
                (details.PartyDetails.PARTY_ADDRESS).trim(),
                parseInteger(details.PartyDetails.PARTY_PINCODE),
                (details.PartyDetails.PARTY_MAIL).trim(),
                details.PartyDetails.PARTY_GST,
                details.PartyDetails.PARTY_NUMBER_1,
                details.PartyDetails.PARTY_NUMBER_2,
                parseInteger(details.PartyDetails.PARTY_OPENING_BALANCE),
                details.PartyDetails.PARTY_OPENING_BALANCE_DATE,
                true,
                (details.PartyDetails.BILLING_NAME).trim(),
                (details.PartyDetails.TRANSPORT_NAME).trim(),
                details.toReceive ? details.toReceive : true
            ],
        });

        if (details.PartyDetails.NOTE) {
            await executeQuery({
                query: `INSERT INTO PARTIES_NOTE(
            PARTY_ID,
            NOTE
          )
          VALUES(?,?)
          `,
                values: [
                    party_id,
                    (details.PartyDetails.NOTE).trim(),
                ],
            });
        }
    }

    return { party_id: party_id };


}


function checkForRequiredDetails(details) {

    if (!details) {
        return { error: "Invalid details please check... " }

    } else if (!details.PartyDetails) {
        return { error: "Party details are missing." };

    } else if (!(details.PartyDetails.PARTY_NAME) && !(details.PartyDetails.isCashEntry)) {
        return { error: "Party name required" }

    } else if (!(details.PartyDetails.BILLING_NAME)) {
        return { error: "Billing name required" }

    } else if (details.PartyDetails.PARTY_GST && ((details.PartyDetails.GSTState).toLowerCase() == "state not found")) {
        return { error: "Incomplete GST details" }

    } else {
        return true
    }
}