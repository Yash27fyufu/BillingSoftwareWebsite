import Head from 'next/head';
import Home from '../../../components/sales/view';
import cookie from 'cookie';
import Axios from 'axios';
import { domain_name } from '../../api/global/commonserverfunctions';

export default function Main({ setLoader, data, error }) {
    return (
        <>
            <Head>
                <title>ERP - Sales Invoice</title>
            </Head>
            {/* If there is an error, handle it */}
            {error ? (
                <div>
                    <h1>{error+"Check pages/sales/invoice/view.js"}</h1>
                    {/* Optionally, show an error message */}
                </div>
            ) : (
                <Home setLoader={setLoader} data={JSON.parse(data)} />
            )}
        </>
    );
}

export async function getServerSideProps(context) {
    try {
        // Parse cookies from the request
        const cookies = await context.req.headers.cookie
            ? cookie.parse(context.req.headers.cookie)
            : {};

        // Check for the existence of the user token (or any specific cookie you need)
        if (!cookies.userToken) {
            // If no valid cookie, send an error to the frontend
            return {
                props: {
                    data: null,
                    error: "Authentication required. You will be redirected to the homepage.",
                },
            };
        }

        const resp = await Axios.post(domain_name + '/api/sales/invoice/view', {
            token: cookies.userToken,
            billType: "SALES_BILL", // sales,purchase,sales_estimate,purchase_estimate,expenses


        });

        if(resp.data.error){
            
            return {
                props: {
                    error: 'An error occurred. Please try again.'+resp.data.error,
                },
            };
        }

        var json = await resp.data.result.salesBillData;

        return {
            props: {
                data: JSON.stringify(json),
            },
        };

    } catch (error) {
        
        return {
            props: {
                data: null,
                error: 'An error occurred. Please try again.'+error,
            },
        };
    }
}
