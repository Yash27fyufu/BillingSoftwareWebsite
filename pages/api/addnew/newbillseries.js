import executeQuery from "../database/executequery";
import { verifyUserToken } from "../global/commonserverfunctions";

export default async function Handler(req, res) {
    try {
        var tokenverification = await verifyUserToken(req.body.token)

        if (tokenverification) {

            if (req.method == "POST") {
                var result = await checkForDuplicate(req.body);
                if (result.error) {
                    res.send(result);
                    return;
                }
                return res.status(200).json({ success: true, result: result });
            } else {
                return res.status(404).json({ error: "Not found", notFound: true });
            }
        } else {
            res.status(400).json({ error: "Error in verifying User Token", });

        }

    } catch (err) {
        console.error(err);
        res.status(400).json({ error: "Invalid User Token", });

    }
}
async function checkForDuplicate(details) {
    var checkduplicate = await executeQuery({
        query: "SELECT * FROM BILL_SERIES WHERE BILL_SERIES = ? AND PREFIX = ?",
        values: [details.BillingDetails.BILL_SERIES, details.isPrefix]
    });
    if (checkduplicate.length != 0) {
        if (checkduplicate[0].DISPLAY != 1) {
            // if value is already present but display is false
            await executeQuery({
                query: "UPDATE BILL_SERIES SET DISPLAY = ? WHERE BILL_SERIES_ID = ?",
                values: [true, checkduplicate[0].BILL_SERIES_ID]
            });

            return { bill_series_id: checkduplicate[0].BILL_SERIES_ID }
        } else {
            return { error: "Bill series already exists", };

        }

    } else {
        var bill_series_id = await executeQuery({
            query: "SELECT MAX(BILL_SERIES_ID) AS MAX FROM BILL_SERIES ",
        });

        bill_series_id = bill_series_id[0]['MAX'];

        if (bill_series_id == null) {
            bill_series_id = 1;
        } else {
            bill_series_id += 1;
        }
        return await insertDatainTable(details, bill_series_id)
    }

}

async function insertDatainTable(details, bill_series_id) {
    var checking = checkForRequiredDetails(details);
    if (checking.error) {
        return checking
    }
    await executeQuery({
        query: `INSERT INTO BILL_SERIES(
                BILL_SERIES_ID,
                BILL_SERIES,
                DISPLAY,
                PREFIX
              )
              VALUES(?,?,?,?)
              `,
        values: [
            bill_series_id,
            (details.BillingDetails.BILL_SERIES).trim(),
            true,
            details.isPrefix
        ],
    });

    return { bill_series_id: bill_series_id };

}

function checkForRequiredDetails(details) {
    if (!details) {
        return { error: "Invalid details please check... " }

    } else if (!details.BillingDetails) {
        return { error: "Billing details are missing." };

    } else if (!(details.BillingDetails.BILL_SERIES)) {
        return { error: "Bill series name required" }

    } else {
        return true
    }

}