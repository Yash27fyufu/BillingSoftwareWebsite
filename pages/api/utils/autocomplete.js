import executeQuery from "../database/executequery";
import { verifyUserToken } from "../global/commonserverfunctions";


export default async function Handler(req, res) {
    try {
        var tokenverification = await verifyUserToken(req.body.token)

        if (tokenverification) {

            if (req.method == "POST") {
                var result = await compute(req.body);

                if (result.error) {
                    res.send(result);
                    return;
                }
                return res.status(200).json({ success: true, autoCompleteResult: result });
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
async function compute(details) {
    var result;
    try {
        result = await executeQuery({
            query: "SELECT " + (details.SearchValues.toString().length > 2 ? details.SearchValues.toString() : "*") + " FROM " + details.SearchTable + " WHERE DISPLAY=1",
        });
    } catch (e) {
        // if the table doesn't have display column
        result = await executeQuery({
            query: "SELECT " + (details.SearchValues.toString().length > 2 ? details.SearchValues.toString() : "*") + " FROM " + details.SearchTable,
        });
    }

    return result;

}