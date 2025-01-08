import executeQuery from "../../database/executequery";
import toMysqlDateTime, { beginTransaction, commitTransaction, rollbackTransaction, verifyUserToken } from "../../global/commonserverfunctions";

export default async function Handler(req, res) {
    try {
        var tokenverification = await verifyUserToken(req.body.token)

        if (tokenverification) {
            beginTransaction()
            if (req.method == "POST") {

                var result = await checkAndUpdateDetailsForSalesInvoice(req.body);

                if (result.error) {
                    rollbackTransaction()
                    res.send(result);
                    return;
                }
                commitTransaction()
                return res.status(200).json({ success: true, result: "result" });

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

var oldItems, allItems;

async function checkAndUpdateDetailsForSalesInvoice(details) {
    var checking = checkForRequiredDetails(details);
    if (checking.error) {
        return checking
    }

    let updateFields = [];

    // same bill series and number should not be there in the same bill_year
    var checkduplicate = await executeQuery({
        query: "SELECT * FROM SALES_BILL WHERE BILL_SERIES_ID = ? AND BILL_NUMBER = ? AND BILL_YEAR = ?",
        values:
            [
                details.BillingDetails.BILL_SERIES_ID,
                details.billNumber,
                ((details.billDate).split("-")[1]) - 3 > 0 ?
                    (details.billDate).split("-")[0]
                    :
                    ((details.billDate).split("-")[0]) - 1
            ]
    });

    if (checkduplicate.length != 0) {
        return { error: "Bill number already exists. (with same series)", };
    }

    //no party id but a name so it is supposed to be an unsaved cash entry
    if (!details.PartyDetails.PARTY_ID && details.PartyDetails.PARTY_NAME) {
        var party_id;

        party_id = await executeQuery({
            query: "SELECT MAX(PARTY_ID) AS MAX FROM CASH_PARTIES ",
        });

        party_id = party_id[0]['MAX'];

        if (party_id == null) {
            party_id = 1;
        } else {
            party_id += 1;
        }

        details.PartyDetails.PARTY_ID = party_id
        details.PartyDetails.isCashEntry = true

        await executeQuery({
            query: `INSERT INTO CASH_PARTIES(
                PARTY_ID,
                PARTY_ADDRESS,
                PARTY_NUMBER_1,
                DISPLAY,
                BILLING_NAME
              )
              VALUES(?,?,?,?,?)
              `,
            values: [
                party_id,
                (details.PartyDetails.PARTY_ADDRESS).trim(),
                details.PartyDetails.PARTY_NUMBER_1,
                true,
                (details.PartyDetails.PARTY_NAME).trim(),
            ],
        });

    } else if (details.PartyDetails.isCashEntry) {
        // it is an already saved cash entry 

        if (details.PartyDetails.PARTY_ID) {//cash entry but details are saved 
            checkduplicate = await executeQuery({
                query: "SELECT * FROM CASH_PARTIES WHERE PARTY_ID = ?",
                values:
                    [
                        details.PartyDetails.PARTY_ID,
                    ]
            });

            if (checkduplicate.length == 0) {
                //party does not exist but it still has some party_id so there is some miscrepancy or inconsistency


                return { error: "Party not saved", };

            } else {
                // if party name is different for a party id then either information is wrong or 
                // provided in some other manner (mostly by using api directly)
                if (!checkduplicate[0]["BILLING_NAME"] || details.PartyDetails.PARTY_NAME != checkduplicate[0]["BILLING_NAME"]) {
                    return { error: "Some error in party details", };
                }

                // if any field is different then note it down from here
                if (!checkduplicate[0]["PARTY_ADDRESS"] || details.PartyDetails.PARTY_ADDRESS != checkduplicate[0]["PARTY_ADDRESS"]) {
                    if (details.PartyDetails.PARTY_ADDRESS) {
                        updateFields.push("PARTY_ADDRESS = \"" + details.PartyDetails.PARTY_ADDRESS + "\"");
                    }
                }

                if (!checkduplicate[0]["PARTY_NUMBER_1"] || details.PartyDetails.PARTY_NUMBER_1 != checkduplicate[0]["PARTY_NUMBER_1"]) {
                    if (details.PartyDetails.PARTY_NUMBER_1) {
                        updateFields.push("PARTY_NUMBER_1 = " + details.PartyDetails.PARTY_NUMBER_1);
                    }
                }

                if (updateFields.length > 0) {
                    // if there are any changes in any fields update them in the table
                    let sqlQuery = `UPDATE CASH_PARTIES SET ${updateFields.join(", ")} WHERE PARTY_ID = ${details.PartyDetails.PARTY_ID}`;
                    await executeQuery({
                        query: sqlQuery,
                    });
                }
            }
        }

    } else {
        // it is not a cash entry but has some party details

        // check if the party exists
        checkduplicate = await executeQuery({
            query: "SELECT * FROM PARTIES WHERE PARTY_ID = ?",
            values:
                [
                    details.PartyDetails.PARTY_ID,
                ]
        });

        if (checkduplicate.length == 0) {
            //party does not exist
            return { error: "No such party exists", };

        } else {

            // if party name is different for a party id then either information is wrong or 
            // provided in some other manner (mostly by directly using api)
            if (!checkduplicate[0]["PARTY_NAME"] || details.PartyDetails.PARTY_NAME != checkduplicate[0]["PARTY_NAME"]) {
                return { error: "Some error in retrieving party details", };
            }

            // if any field is different then note it down from here

            if (!checkduplicate[0]["PARTY_ADDRESS"] || details.PartyDetails.PARTY_ADDRESS != checkduplicate[0]["PARTY_ADDRESS"]) {
                if (details.PartyDetails.PARTY_ADDRESS) {
                    updateFields.push("PARTY_ADDRESS = \"" + details.PartyDetails.PARTY_ADDRESS + "\"");
                }
            }

            if (!checkduplicate[0]["PARTY_NUMBER_1"] || details.PartyDetails.PARTY_NUMBER_1 != checkduplicate[0]["PARTY_NUMBER_1"]) {
                if (details.PartyDetails.PARTY_NUMBER_1) {
                    updateFields.push("PARTY_NUMBER_1 = " + details.PartyDetails.PARTY_NUMBER_1);
                }
            }

            if (updateFields.length > 0) {
                // if there are any changes in any fields update them in the table

                let sqlQuery = `UPDATE PARTIES SET ${updateFields.join(", ")} WHERE PARTY_ID = ${details.PartyDetails.PARTY_ID}`;
                await executeQuery({
                    query: sqlQuery,

                });
            }
        }
    }
    var newItemsAdded = await checkForNewItems(details)

    if (newItemsAdded && newItemsAdded.error) {
        return { error: newItemsAdded.error }
    }

    var sales_id = await executeQuery({
        query: "SELECT MAX(SALES_ID) AS MAX FROM SALES_BILL ",
    });

    sales_id = sales_id[0]['MAX'];

    if (sales_id == null) {
        sales_id = 1;
    } else {
        sales_id += 1;
    }
    return await insertIntoSalesInvoice(details, sales_id)

}

async function checkForNewUnit(details) {

    const filteredData = (details.tableData).filter(item =>
        item.UNIT_NAME && (item.UNIT_ID === '' || item.UNIT_ID === null)
    );

    if (filteredData.length > 0) {
        // add that new unit - similar to gst (till then error)

        return { error: "Unit not saved" }
    }

    return { true: true } // if everything is good to go
}

async function checkForNewGstRate(details) {

    const filteredData = (details.tableData).filter(item =>
        item.TAX_PERC && (item.GST_ID === '' || item.GST_ID === null || item.GST_ID === '-1')
    );

    if (filteredData.length > 0) {
        return { error: "GST slab not saved" }


        // // add that gst slab

        // var gst_id = await executeQuery({
        //     query: "SELECT MAX(GST_ID) AS MAX FROM GST_TYPE ",
        // });

        // gst_id = gst_id[0]['MAX'];

        // if (gst_id == null) {
        //     gst_id = 1;
        // } else {
        //     gst_id += 1;
        // }

        // works from here after some changes but for now dont allow any new unsaved values

        //     const filteredData = details.tableData.filter(item =>
        //         item.TAX_PERC && (item.GST_ID === '' || item.GST_ID === null || item.GST_ID === '-1')
        //     );

        //     // Step 1: Create a map for unique GST_IDs
        //     const gstMap = new Map();

        //     const updatedGstData = [];
        //     let gstIdCounter;

        //     // Step 2: Check for duplicates and handle GST logic for each filtered item
        //     for (let item of filteredData) {
        //         const gstPercentage = item.TAX_PERC;

        //         if (!gstMap.has(gstPercentage)) {
        //             // Step 2.1: Check for duplicate GST entries in the database
        //             const checkDuplicate = await executeQuery({
        //                 query: "SELECT * FROM GST_TYPE WHERE GST_PERCENTAGE = ?",
        //                 values: [gstPercentage]
        //             });

        //             if (checkDuplicate.length !== 0) {
        //                 // GST entry exists, check if it's displayed
        //                 if (checkDuplicate[0].DISPLAY !== 1) {
        //                     // Update DISPLAY if the GST exists but is not active
        //                     await executeQuery({
        //                         query: "UPDATE GST_TYPE SET DISPLAY = ? WHERE GST_ID = ?",
        //                         values: [true, checkDuplicate[0].GST_ID]
        //                     });

        //                     // Assign existing GST_ID
        //                     gstMap.set(gstPercentage, checkDuplicate[0].GST_ID);
        //                 } else {
        //                     // Duplicate GST entry already exists and is displayed
        //                     continue;
        //                 }
        //             } else {
        //                 // Step 2.2: If no duplicate, insert a new GST entry
        //                 const gstResult = await executeQuery({
        //                     query: "SELECT MAX(GST_ID) AS MAX FROM GST_TYPE",
        //                 });

        //                 gstIdCounter = gstResult[0]['MAX'] ? gstResult[0]['MAX'] + 1 : 1;

        //                 await executeQuery({
        //                     query: `INSERT INTO GST_TYPE(
        //                         GST_ID,
        //                         GST_PERCENTAGE,
        //                         DISPLAY
        //                     ) VALUES (?, ?, ?)`,
        //                     values: [gstIdCounter, gstPercentage, true]
        //                 });

        //                 // Map the new GST_ID to the GST percentage
        //                 gstMap.set(gstPercentage, gstIdCounter);
        //             }

        //             // Step 3: Update the data with the new or existing GST_ID
        //             const newDict = { ...item };
        //             newDict.GST_ID = gstMap.get(gstPercentage);
        //             newDict.UPDATED = true;  // Mark it as updated

        //             updatedGstData.push(newDict);
        //         }

        //         // Update the original `filteredData` GST_ID based on the map
        //         item.GST_ID = gstMap.get(gstPercentage);
        //     }

        //     // Step 4: Prepare the SQL query for the updated data
        //     const values = updatedGstData.flatMap(obj =>
        //         Object.values(obj).map(value => (value == "" ? null : value))
        //     );


    }

    return { true: true } // if everything is good to go

}

async function checkForNewItems(details) {

    var result = await checkForNewUnit(details)

    if (result.error) {
        return { error: result.error };
    }

    result = await checkForNewGstRate(details)

    if (result.error) {
        return { error: result.error };
    }

    var newItems = details.tableData.filter(row => row.ITEM_ID == "" && row.ITEM_NAME != "")

    oldItems = details.tableData.filter(row => row.ITEM_ID)

    if (newItems.length != 0) {
        // there is some new item
        var item_id = await executeQuery({
            query: "SELECT MAX(ITEM_ID) AS MAX FROM ITEMS ",
        });

        item_id = item_id[0]['MAX'];

        if (item_id == null) {
            item_id = 1;
        } else {
            item_id += 1;
        }

        // handle for cases where an item_name is used and then created so that the one previously used has no item_id
        // consider it a new item by aadjusting some parameters 

        // before creating new items check for all the fields and then proceed

        const itemNameMap = new Map();

        const updatedItemIds = [];

        newItems.forEach(dict => {
            const itemName = (dict.ITEM_NAME).trim();

            // Check if this ITEM_NAME already has an ITEM_ID
            if (!itemNameMap.has(itemName)) {
                // Assign a new ITEM_ID for this unique ITEM_NAME and store it in the map
                itemNameMap.set(itemName, item_id);

                // Create a new dictionary with updated values
                const newDict = { ...dict };
                delete newDict.id;
                delete newDict.UNIT_NAME;
                delete newDict.DIS_AMT;
                delete newDict.TAX_PERC;
                delete newDict.TAX_AMT;
                delete newDict.SUB_TOT;

                newDict.ITEM_ID = item_id;
                newDict.DISPLAY = true;

                // Add to updatedItemIds only if ITEM_NAME is unique
                updatedItemIds.push(newDict);

                item_id += 1; // Increment item_id for the next unique ITEM_NAME
            }

            // Update the original newItems array with the same ITEM_ID from the map
            dict.ITEM_ID = itemNameMap.get(itemName);
        });

        const values = updatedItemIds.flatMap(obj =>
            Object.values(obj).map(value => (value == "" ? null : value))
        );

        const query = `INSERT INTO ITEMS (
                ITEM_NAME,
                ITEM_SALES_QUANTITY,
                ITEM_SALES_PRICE,
                ITEM_SALES_DISCOUNT,
                ITEM_GST_TYPE_ID,
                ITEM_DEFAULT_UNIT_ID,
                ITEM_ID,
                DISPLAY
              )VALUES ${updatedItemIds.map(() => `(?,?,?,?,?,?,?,?)`).join(', ')}`;

        try {
            await executeQuery({
                query: query,
                values: values
            })
        } catch (e) {
            // error occurs mostly if any itemname is repeated else something else
            return { error: e }
        }
    }
    allItems = [...oldItems, ...newItems];
    return { true: true }
}

async function insertBillItems(details, sales_id, bill_details_id) {

    // insert item details for the bil 
    // update the items table for total_sales_qty and othre related details

    const query = `INSERT INTO BILL_ITEMS (
                    BILL_ID,
                    BILL_DETAILS_ID,
                    ITEM_ID,
                    QUANTITY,
                    UNIT_ID,
                    PRICE,
                    DISCOUNT,
                    GST_ID,
                    AMOUNT,
                    BILL_TYPE
                  ) VALUES ${allItems.map(() => `(?,?,?,?,?,?,?,?,?,?)`).join(', ')}`;


    const values = allItems.flatMap(item => [
        sales_id,
        bill_details_id,
        item.ITEM_ID,
        item.QTY ? item.QTY : null, // check if there is not qty then what to do
        item.UNIT_ID ? item.UNIT_ID : null,
        item.PRICE ? item.PRICE : 0,
        item.DIS_PERC ? item.DIS_PERC : null,
        item.GST_ID ? item.GST_ID : null,
        item.SUB_TOT ? item.SUB_TOT : 0,
        "SALES_BILL"
    ]);


    try {
        await executeQuery({
            query: query,
            values: values
        })

    } catch (e) {
        return { error: e }

    }
    return updateItemSalesQty(sales_id)
}

async function updateItemSalesQty(sales_id) {

    try {
        const updatePromises = oldItems.map((element) => {
            return executeQuery({
                query: `
                    UPDATE ITEMS 
                    SET ITEM_SALES_QUANTITY = ITEM_SALES_QUANTITY + ? 
                    WHERE ITEM_ID = ?`,
                values: [element.QTY || 0, element.ITEM_ID],
            });
        });

        // Wait for all updates to complete
        await Promise.all(updatePromises);
    } catch (error) {
        console.error('Error updating items:', error);
    }


    return { sales_id: sales_id }
}

async function insertIntoSalesInvoice(details, sales_id) {

    try {
        await executeQuery({
            query: `INSERT INTO SALES_BILL(
                SALES_ID,
                PARTY_ID,
                BILL_SERIES_ID,
                BILL_NUMBER,
                BILL_DATE,
                BILL_YEAR,
                BILL_CREATED_DATE,
                BILL_LAST_UPDATED,
                CASH_ENTRY
              )
              VALUES(?,?,?,?,?,?,?,?,?)
              `,
            values: [
                sales_id,
                details.PartyDetails.PARTY_ID,
                details.BillingDetails.BILL_SERIES_ID ? details.BillingDetails.BILL_SERIES_ID : null,
                details.billNumber,
                details.billDate,
                ((details.billDate).split("-")[1]) - 3 > 0 ? (details.billDate).split("-")[0] : ((details.billDate).split("-")[0]) - 1,
                await toMysqlDateTime(new Date(new Date().getTime())),
                await toMysqlDateTime(new Date(new Date().getTime())),
                details.PartyDetails.isCashEntry

            ],
        });
        return await insertBillDetails(details, sales_id)

        // TRANSPORT NAME AND OTHER DETAILS IN ONE TABLE AND NOTE IN BILL_DESCRIPTION TABLE


    } catch (e) {

        return { error: e }
    }
}

async function insertBillDetails(details, sales_id) {
    try {
        var bill_details_id = await executeQuery({
            query: "SELECT MAX(BILL_DETAILS_ID) AS MAX FROM BILL_DETAILS ",
        });

        bill_details_id = bill_details_id[0]['MAX'];

        if (bill_details_id == null) {
            bill_details_id = 1;
        } else {
            bill_details_id += 1;
        }

        await executeQuery({
            query: `INSERT INTO BILL_DETAILS(
                BILL_DETAILS_ID,
                BILL_ID,
                BILL_TYPE,
                PACKINGS,
                SHIPPING_ADDRESS,
                TRANSPORT,
                PLUS_TAX,
                SUBTOTAL,
                ROUND_OFF,
                FREIGHT,
                DISCOUNT_PERC,
                TOTAL,
                AMOUNT_SETTLED
              )
              VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)
              `,
            values: [
                bill_details_id,
                sales_id,
                "SALES_BILL",
                details.noOfPackings ? details.noOfPackings : null,
                details.shippingAddress ? details.shippingAddress : null,
                details.transportName ? (details.transportName).trim() : null,
                details.priceWithTax ?? null,
                details.subtotalAmount ? details.subtotalAmount : null,
                details.roundOffValue ? details.roundOffValue : null,
                details.freightCharges ? details.freightCharges : null,
                details.totalDiscount ? details.totalDiscount : null,
                details.totalAmount ? details.totalAmount : null,
                details.received ? details.received : null
            ],
        });

        // if there is some note 
        if (details.billNote) {
            await executeQuery({
                query: `INSERT INTO BILL_NOTE(
                BILL_DETAILS_ID,
            BILL_ID,
            BILL_TYPE,
            BILL_NOTE
          )
          VALUES(?,?,?,?)
          `,
                values: [
                    bill_details_id,
                    sales_id,
                    "SALES_BILL",
                    (details.billNote).trim(),
                ],
            });
        }

        //if there is some payment made
        if (details.received && details.received != 0) {
            if (!(details.PaymentModeDetails.PAYMENT_MODE_ID)) {
                return { error: "Payment mode incorrect or not saved " }
            }

            var payment_id = await executeQuery({
                query: "SELECT MAX(PAYMENT_ID) AS MAX FROM PAYMENTS ",
            });

            payment_id = payment_id[0]['MAX'];

            if (payment_id == null) {
                payment_id = 1;
            } else {
                payment_id += 1;
            }

            await executeQuery({
                query: `INSERT INTO PAYMENTS(
            PAYMENT_ID,
            PAYMENT_MODE_ID,
            AMOUNT,
            PAYMENT_DATE,
            PAYMENT_TYPE
          )
          VALUES(?,?,?,?,?)
          `,
                values: [
                    payment_id,
                    details.PaymentModeDetails.PAYMENT_MODE_ID,
                    details.received,
                    await toMysqlDateTime(new Date(new Date().getTime())),
                    "IN"
                ],
            });

            await executeQuery({
                query: `INSERT INTO PAYMENT_ALLOCATION(
                
            PAYMENT_ID,
            AMOUNT,
            BILL_TYPE,
            BILL_ID,
            BILL_DETAILS_ID
          )
          VALUES(?,?,?,?,?)
          `,
                values: [
                    payment_id,
                    details.received,
                    "SALES_BILL",
                    sales_id,
                    bill_details_id
                ],
            });

        }
        return await insertBillItems(details, sales_id, bill_details_id)

    } catch (e) {
        return { error: e }
    }
}

function checkForRequiredDetails(details) {
    if (!details) {
        return { error: "Invalid details please check..." }

    } else if (!(details.PartyDetails) || !(details.PartyDetails.PARTY_NAME)) {
        return { error: "Party details are missing or not saved." };

    } else if (!(details.BillingDetails)) { // make default none
        return { error: "Billing details are missing." };

    } else if (!(details.tableData)) {
        return { error: "Item details are missing or not saved." };

    } else {
        return true
    }
}

