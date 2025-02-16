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
        res.status(400).json({ error: "Invalid User Token "+ err, });

    }
}
async function checkForDuplicate(details) {
    var checkduplicate = await executeQuery({
        query: "SELECT * FROM PAYMENT_MODES WHERE MODE_NAME = ?",
        values: [details.PaymentModeDetails.MODE_NAME]
    });
    if (checkduplicate.length != 0) {
        if (checkduplicate[0].DISPLAY != 1) {
            // if payment mode is already present but display is false
            await executeQuery({
                query: "UPDATE PAYMENT_MODES SET DISPLAY = ? WHERE PAYMENT_MODE_ID = ?",
                values: [true, checkduplicate[0].payment_mode_id]
            });

            return { payment_mode_id: checkduplicate[0].payment_mode_id }
        }
        return { error: "Payment mode already exists", };

    } else {

        var payment_mode_id = await executeQuery({
            query: "SELECT MAX(PAYMENT_MODE_ID) AS MAX FROM PAYMENT_MODES ",
        });

        payment_mode_id = payment_mode_id[0]['MAX'];

        if (payment_mode_id == null) {
            payment_mode_id = 1;
        } else {
            payment_mode_id += 1;
        }
        return await insertDatainTable(details, payment_mode_id)
    }

}

async function insertDatainTable(details, payment_mode_id) {
    var checking = checkForRequiredDetails(details);
    if (checking.error) {
        return checking
    }
    await executeQuery({
        query: `INSERT INTO PAYMENT_MODES(
                PAYMENT_MODE_ID,
                MODE_NAME,
                DISPLAY
              )
              VALUES(?,?,?)
              `,
        values: [
            payment_mode_id,
            (details.PaymentModeDetails.MODE_NAME).trim(),
            true,
        ],
    });

    return { payment_mode_id: payment_mode_id };

}


function checkForRequiredDetails(details) {
    if (!details) {
        return { error: "Invalid details please check... " }

    } else if (!details.PaymentModeDetails) {
        return { error: "Payment mode details are missing." };

    } else if (!(details.PaymentModeDetails.MODE_NAME)) {
        return { error: "Payment mode name required" }

    } else {
        return true
    }

}