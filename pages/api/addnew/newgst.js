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
        query: "SELECT * FROM GST_TYPE WHERE GST_PERCENTAGE = ?",
        values: [details.GSTDetails.GST_PERCENTAGE]
    });
    if (checkduplicate.length != 0) {
        if (checkduplicate[0].DISPLAY != 1) {
            // if value is already present but display is false
            await executeQuery({
                query: "UPDATE GST_TYPE SET DISPLAY = ? WHERE GST_ID = ?",
                values: [true, checkduplicate[0].GST_ID]
            });

            return { gst_id: checkduplicate[0].GST_ID }
        }
        return { error: "GST slab already exists", };

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
        return await insertDatainTable(details, gst_id)
    }

}

async function insertDatainTable(details, gst_id) {
    var checking = checkForRequiredDetails(details);
    if (checking.error) {
        return checking
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
            details.GSTDetails.GST_PERCENTAGE,
            true,
        ],
    });

    return { gst_id: gst_id };

}


function checkForRequiredDetails(details) {
    if (!details) {
        return { error: "Invalid details please check... " }

    } else if (!details.GSTDetails) {
        return { error: "GST details are missing." };

    } else if (!(details.GSTDetails.GST_PERCENTAGE)) {
        return { error: "GST percentage required" }
        
    } else {
        return true
    }

}