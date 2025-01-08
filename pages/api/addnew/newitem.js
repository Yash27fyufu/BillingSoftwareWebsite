import executeQuery from "../database/executequery";
import { beginTransaction, commitTransaction, rollbackTransaction, stringHasValue, verifyUserToken } from "../global/commonserverfunctions"

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
        console.error(err);
        res.status(400).json({ error: "Invalid User Token", });

    }
}
async function checkForDuplicate(details) {
    //if just the name is same and brand and code is diff then no prob it could exist
    var checkduplicate = await executeQuery({
        query: "SELECT * FROM ITEMS WHERE ITEM_NAME = ? AND ITEM_BRAND = ? AND ITEM_CODE = ? ",
        values: [
            details.ItemDetails.ITEMS,
            details.ItemDetails.ITEM_BRAND,
            details.ItemDetails.ITEM_CODE]
    });
    if (checkduplicate.length != 0) {
        if (checkduplicate[0].DISPLAY != 1) {
            // if item is already present but display is false update all the values

            await executeQuery({
                query: `UPDATE ITEMS SET 
                DISPLAY = ?, 
                ITEM_HSN_ID = ?, 
                ITEM_GST_TYPE_ID = ?, 
                ITEM_PURCHASE_PRICE = ?, 
                ITEM_PURCHASE_DISCOUNT = ?, 
                ITEM_SALES_PRICE = ?, 
                ITEM_SALES_DISCOUNT = ?, 
                ITEM_DEFAULT_UNIT_ID = ?, 
                ITEM_OPENING_QTY = ?   
                WHERE ITEM_ID = ?`,
                values: [
                    true,
                    details.ItemDetails.ITEM_HSN_ID == "" ? null : details.ItemDetails.ITEM_HSN_ID,
                    details.ItemDetails.ITEM_GST_TYPE_ID == "" ? null : details.ItemDetails.ITEM_GST_TYPE_ID,
                    details.ItemDetails.ITEM_PURCHASE_PRICE == "" ? null : details.ItemDetails.ITEM_PURCHASE_PRICE,
                    details.ItemDetails.ITEM_PURCHASE_DISCOUNT == "" ? null : details.ItemDetails.ITEM_PURCHASE_DISCOUNT,
                    details.ItemDetails.ITEM_SALES_PRICE == "" ? null : details.ItemDetails.ITEM_SALES_PRICE,
                    details.ItemDetails.ITEM_SALES_DISCOUNT == "" ? null : details.ItemDetails.ITEM_SALES_DISCOUNT,
                    details.ItemDetails.ITEM_DEFAULT_UNIT_ID == "" ? null : details.ItemDetails.ITEM_DEFAULT_UNIT_ID,
                    details.ItemDetails.ITEM_OPENING_QTY == "" ? null : details.ItemDetails.ITEM_OPENING_QTY,
                    checkduplicate[0].ITEM_ID
                ]
            });

            if (details.ItemDetails.ITEM_DESCRIPTION) {
                await executeQuery({
                    query: `INSERT INTO ITEM_DESCRIPTIONS(
                ITEM_ID,
                ITEM_DESCRIPTION
              )
              VALUES(?,?)
              `,
                    values: [
                        checkduplicate[0].ITEM_ID,
                        details.ItemDetails.ITEM_DESCRIPTION == "" ? null : details.ItemDetails.ITEM_DESCRIPTION,
                    ],
                });
            }

            return { item_id: checkduplicate[0].ITEM_ID }
        } else {
            return { error: "Item already exists", };

        }

    } else {
        var item_id = await executeQuery({
            query: "SELECT MAX(ITEM_ID) AS MAX FROM ITEMS ",
        });

        item_id = item_id[0]['MAX'];

        if (item_id == null) {
            item_id = 1;
        } else {
            item_id += 1;
        }
        return await insertDatainTable(details, item_id)
    }

}

async function insertDatainTable(details, item_id) {
    var checking = checkForRequiredDetails(details);
    if (checking.error) {
        return checking
    }
    await executeQuery({
        query: `INSERT INTO ITEMS(
                ITEM_ID,
                ITEM_NAME,
                ITEM_CODE,
                ITEM_HSN_ID,
                ITEM_GST_TYPE_ID,
                ITEM_BRAND,
                ITEM_PURCHASE_PRICE,
                ITEM_PURCHASE_DISCOUNT,
                ITEM_PURCHASE_QUANTITY,
                ITEM_SALES_PRICE,
                ITEM_SALES_DISCOUNT,
                ITEM_SALES_QUANTITY,
                ITEM_DEFAULT_UNIT_ID,
                DISPLAY,
                ITEM_OPENING_QTY
              )
              VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
              `,
        values: [
            item_id,
            (details.ItemDetails.ITEM_NAME).trim(),
            details.ItemDetails.ITEM_CODE == "" ? null : details.ItemDetails.ITEM_CODE,
            details.ItemDetails.ITEM_HSN_ID == "" ? null : details.ItemDetails.ITEM_HSN_ID,
            details.ItemDetails.ITEM_GST_TYPE_ID == "" ? null : details.ItemDetails.ITEM_GST_TYPE_ID,
            details.ItemDetails.ITEM_BRAND == "" ? null : (details.ItemDetails.ITEM_BRAND).trim(),
            details.ItemDetails.ITEM_PURCHASE_PRICE == "" ? null : details.ItemDetails.ITEM_PURCHASE_PRICE,
            details.ItemDetails.ITEM_PURCHASE_DISCOUNT == "" ? null : details.ItemDetails.ITEM_PURCHASE_DISCOUNT,
            0,
            details.ItemDetails.ITEM_SALES_PRICE == "" ? null : details.ItemDetails.ITEM_SALES_PRICE,
            details.ItemDetails.ITEM_SALES_DISCOUNT == "" ? null : details.ItemDetails.ITEM_SALES_DISCOUNT,
            0,
            details.ItemDetails.ITEM_DEFAULT_UNIT_ID == "" ? null : details.ItemDetails.ITEM_DEFAULT_UNIT_ID,
            true,
            details.ItemDetails.ITEM_OPENING_QTY == "" ? null : details.ItemDetails.ITEM_OPENING_QTY,
        ],
    });

    if (details.ItemDetails.ITEM_DESCRIPTION) {
        await executeQuery({
            query: `INSERT INTO ITEM_DESCRIPTIONS(
        ITEM_ID,
        ITEM_DESCRIPTION
      )
      VALUES(?,?)
      `,
            values: [
                item_id,
                details.ItemDetails.ITEM_DESCRIPTION == "" ? null : (details.ItemDetails.ITEM_DESCRIPTION).trim(),
            ],
        });
    }

    return { item_id: item_id };

}

function checkForRequiredDetails(details) {
    if (!details) {
        return { error: "Invalid details please check... " }

    } else if (!details.ItemDetails) {
        return { error: "Billing details are missing." };

    } else if (!(details.ItemDetails.ITEM_NAME)) {
        return { error: "Item name required" }

    } else if ((details.ItemDetails.ITEM_GST_TYPE) && !(details.ItemDetails.ITEM_GST_TYPE_ID)) {
        return { error: "GST percentage error" }

    } else if ((details.ItemDetails.ITEM_HSN) && !(details.ItemDetails.ITEM_HSN_ID)) {
        return { error: "HSN error" }

    } else if ((details.ItemDetails.ITEM_DEFAULT_UNIT) && !(details.ItemDetails.ITEM_DEFAULT_UNIT_ID)) {
        return { error: "Unit details error" }

    } else {
        return true

    }

}