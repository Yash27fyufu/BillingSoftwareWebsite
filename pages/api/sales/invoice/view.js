import executeQuery from "../../database/executequery";
import { verifyUserToken } from "../../global/commonserverfunctions";

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
        } else {
            res.status(400).json({ error: "Error in verifying User Token", });

        }

    } catch (err) {
        console.error(err);
        res.status(400).json({ error: "Invalid User Token", });

    }
}

async function getTableDetails(details) {

    try {
        var salesBillData = await executeQuery({
            query: ` SELECT 
    COALESCE(CP.BILLING_NAME, P.BILLING_NAME) AS BILLING_NAME, 
    COALESCE(CP.BILLING_NAME, P.PARTY_NAME) AS PARTY_NAME, 
    BS.BILL_SERIES,
    SB.BILL_NUMBER, 
    SB.BILL_DATE,
    BD.TOTAL,
    BD.AMOUNT_SETTLED,
    BD.PLUS_TAX
FROM 
    SALES_BILL SB
JOIN 
    BILL_DETAILS BD ON SB.SALES_ID = BD.BILL_ID
JOIN 
    BILL_SERIES BS ON SB.BILL_SERIES_ID = BS.BILL_SERIES_ID
LEFT JOIN 
    PARTIES P ON SB.PARTY_ID = P.PARTY_ID
LEFT JOIN 
    CASH_PARTIES CP ON SB.PARTY_ID = CP.PARTY_ID AND SB.CASH_ENTRY = 1 
`,
            values: [
                details.offset,
                details.pageNumber * details.offset
            ]
        });

        return { salesBillData: salesBillData }
    } catch (error) {
        return { error: error }
    }

}

async function checkDetails(details) {

    // if there is no value or something wrong
    details.offset = (details.offset || 50)
    details.pageNumber = (details.pageNumber || 0)


    return getTableDetails(details)

}




// sb.SALES_ID,
// sb.PARTY_ID,
// COALESCE(cp.BILLING_NAME, p.BILLING_NAME) AS BILLING_NAME,
// COALESCE(cp.BILLING_NAME, p.PARTY_NAME) AS PARTY_NAME,
// bs.BILL_SERIES,
// sb.BILL_NUMBER,
// sb.BILL_DATE,
// sb.BILL_CREATED_DATE,
// sb.BILL_LAST_UPDATED,
// sb.BILL_YEAR,
// bd.BILL_TYPE,
// bd.PACKINGS,
// bd.SHIPPING_ADDRESS,
// bd.TRANSPORT,
// bd.SUBTOTAL,
// bd.ROUND_OFF,
// bd.FREIGHT,
// bd.DISCOUNT_PERC,
// bd.TOTAL,
// bd.AMOUNT_SETTLED,
// bd.PLUS_TAX