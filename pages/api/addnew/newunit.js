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
        query: "SELECT * FROM UNIT WHERE UNIT_NAME = ?",
        values: [details.UnitDetails.UNIT_NAME]
    });
    if (checkduplicate.length != 0) {
        if (checkduplicate[0].DISPLAY != 1) {
            // if unit name is already present but display is false
            await executeQuery({
                query: "UPDATE UNIT SET DISPLAY = ? WHERE UNIT_ID = ?",
                values: [true, checkduplicate[0].UNIT_ID]
            });

            return { unit_id: checkduplicate[0].UNIT_ID }
        }
        return { error: "Unit name already exists", };

    }

    checkduplicate = await executeQuery({
        query: "SELECT * FROM UNIT WHERE UNIT_SHORT_FORM = ?",
        values: [details.UnitDetails.UNIT_SHORT_FORM]
    });
    
    if (checkduplicate.length != 0) {
        return { error: "Short form already exists for Unit Name : "+checkduplicate[0].UNIT_NAME};

    } else {

        var unit_id = await executeQuery({
            query: "SELECT MAX(UNIT_ID) AS MAX FROM UNIT ",
        });

        unit_id = unit_id[0]['MAX'];

        if (unit_id == null) {
            unit_id = 1;
        } else {
            unit_id += 1;
        }
        return await insertDatainTable(details, unit_id)
    }
}

async function insertDatainTable(details, unit_id) {

    var checking = checkForRequiredDetails(details);
    if (checking.error) {
        return checking
    }

    await executeQuery({
        query: `INSERT INTO UNIT(
                UNIT_ID,
                UNIT_NAME,
                UNIT_SHORT_FORM,
                DISPLAY
              )
              VALUES(?,?,?,?)
              `,
        values: [
            unit_id,
            (details.UnitDetails.UNIT_NAME).trim(),
            (details.UnitDetails.UNIT_SHORT_FORM).trim(),
            true,
        ],
    });

    return { unit_id: unit_id };
}


function checkForRequiredDetails(details) {
    if (!details) {
        return { error: "Invalid details please check... " }

    } else if (!details.UnitDetails) {
        return { error: "Unit details are missing." };

    } else if (!(details.UnitDetails.UNIT_NAME)) {
        return { error: "Unit Name required" }

    } else if (!(details.UnitDetails.UNIT_SHORT_FORM)) {
        return { error: "Unit short form required" }

    } else {
        return true
    }

}