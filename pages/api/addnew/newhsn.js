import executeQuery from "../database/executequery";
import { beginTransaction, commitTransaction, rollbackTransaction, verifyUserToken } from "../global/commonserverfunctions";

export default async function Handler(req, res) {
    try {
        var tokenverification = await verifyUserToken(req.body.token)

        if (tokenverification) {
            if (req.method == "POST") {
                beginTransaction()
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
        console.error(err);
        res.status(400).json({ error: "Invalid User Token", });

    }
}
async function checkForDuplicate(details) {
    var checkduplicate = await executeQuery({
        query: "SELECT * FROM HSN_DETAILS WHERE HSN_CODE = ? ",
        values: [details.HSNDetails.HSN_CODE]
    });
    if (checkduplicate.length != 0) {
        if (checkduplicate[0].DISPLAY != 1) {
            // if value is already present but display is false
            await executeQuery({
                query: "UPDATE HSN_DETAILS SET DISPLAY = ? WHERE HSN_ID = ?",
                values: [true, checkduplicate[0].HSN_ID]
            });

            return { hsn_id: checkduplicate[0].HSN_ID }
        }
        return { error: "HSN code already exists", };

    } else {
        var hsn_id = await executeQuery({
            query: "SELECT MAX(HSN_ID) AS MAX FROM HSN_DETAILS ",
        });

        hsn_id = hsn_id[0]['MAX'];

        if (hsn_id == null) {
            hsn_id = 1;
        } else {
            hsn_id += 1;
        }
        return await insertDatainTable(details, hsn_id)
    }

}

async function insertDatainTable(details, hsn_id) {
    var checking = checkForRequiredDetails(details);
    if (checking.error) {
        return checking
    }
    var gst_ref_id;
    if (details.GST_REF == "") {
        gst_ref_id = await insertNewGST(details.HSNDetails.GST)
    } else {
        gst_ref_id = details.GST_REF
    }

    try {
        await executeQuery({
            query: `INSERT INTO HSN_DETAILS(
                HSN_ID,
                HSN_CODE,
                GST_REF_ID,
                DISPLAY
              )
              VALUES(?,?,?,?)
              `,
            values: [
                hsn_id,
                (details.HSNDetails.HSN_CODE).trim(),
                gst_ref_id,
                true,
            ],
        });
    } catch (e) {
        return { error: "Could not add HSN details. " + e }
    }

    return { hsn_id: hsn_id };

}

async function insertNewGST(gst_val) {
    try {
        var checkduplicate = await executeQuery({
            query: "SELECT * FROM GST_TYPE WHERE GST_PERCENTAGE = ?",
            values: gst_val
        });
        if (checkduplicate.length != 0) {
            if (checkduplicate[0].DISPLAY != 1) {
                // if value is already present but display is false
                await executeQuery({
                    query: "UPDATE PARTIES SET DISPLAY = ? WHERE GST_ID = ?",
                    values: [true, checkduplicate[0].GST_ID]
                });

                return checkduplicate[0].GST_ID
            }

        }

        else {
            var gst_id = await executeQuery({
                query: "SELECT MAX(GST_ID) AS MAX FROM GST_TYPE ",
            });

            gst_id = gst_id[0]['MAX'];

            if (gst_id == null) {
                gst_id = 1;
            } else {
                gst_id += 1;
            }
            await executeQuery({
                query: `INSERT INTO GST_TYPE(
                GST_ID,
                GST_PERCENTAGE,
                DISPLAY
              )
              VALUES(?,?,?)
              `,
                values: [
                    gst_id,
                    gst_val,
                    true,
                ],
            });

            return gst_id;
        }
    } catch (e) {
        return { error: "Could not add GST slab. " + e }
    }
}

function checkForRequiredDetails(details) {
    if (!details) {
        return { error: "Invalid details please check... " }

    } else if (!details.HSNDetails) {
        return { error: "HSN details are missing." };

    } else if (!(details.HSNDetails.HSN_CODE)) {
        return { error: "HSN code required" }

    } else {
        return true
    }



}