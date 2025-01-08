import Head from 'next/head';
import UserAuth from '../components/user_auth_login';

export default function Main({ setLoader, data }) {
  
    return (
        <>
            <Head>
                <title>ERP - Authentication</title>
            </Head> 
            <UserAuth
                setLoader={setLoader}
                // data={JSON.parse(data)}
            />
        </>
    );
}

