import executeQuery from "../database/executequery";
import { verifyUserToken } from "../global/commonserverfunctions";

export default async function Handler(req, res) {
    try {
        var tokenverification = await verifyUserToken(req.body.token)
        
        if (tokenverification) {
            
            if (req.method == "POST") {
                var result = await checkDetails(req.body);

                if (result.error) {
                    res.send(result);
                    return;
                }
                return res.status(200).json({ success: true, result: result });
            } else {
                return res.status(404).json({ error: "Not found", notFound: true });
            }
        }else {
            res.status(400).json({ error: "Error in verifying User Token", });

        }

    } catch (err) {
        res.status(400).json({ error: "Invalid User Token "+ err, });

    }
}

async function getbillnum(details) {
    var checkduplicate = await executeQuery({
        query: "SELECT BILL_NUMBER FROM " + details.tableName +" WHERE BILL_SERIES_ID = ? AND BILL_YEAR = ? AND CAST(BILL_NUMBER AS UNSIGNED) = (SELECT MAX(CAST(BILL_NUMBER AS UNSIGNED)) AS LAST_BILL_NUM FROM " + details.tableName +" WHERE BILL_SERIES_ID = ? AND BILL_YEAR = ?)",
        values: [
            details.billSeriesId,
            details.billYear,
            details.billSeriesId,
            details.billYear,
        ]
    });
    
    if (checkduplicate.length == 0) {
        // no bill is already made
        return 1
    } else {

        return incrementBillNumber(checkduplicate[0].BILL_NUMBER)
    }

}
function incrementBillNumber(billNumber) {
    // Convert the string to a number and increment it
    let incrementedNumber = (parseInt(billNumber, 10) + 1).toString();
    
    // Pad the incremented number with leading zeroes to match the original length
    return incrementedNumber.padStart(billNumber.length, '0');
}

async function checkDetails(details) {
    // check for the possible tables likes sales, purchase, expense etc... to avoid possible errors

    if (details.tableName == "SALES_BILL" || details.tableName == "PURCHASE_BILL") {
        if (!(isNaN(details.billYear))) {
            if ((details.billSeriesId)=="" || isNaN(details.billSeriesId)) {
                return { error: "Some error in bill series", };

            }else{
                return getbillnum(details)
            }
        }else{
            return { error: "Some error in bill year", };

        }
    }else{
        return { error: "Some error in table details", };

    }
}