import Head from 'next/head';
import Home from '../../components/parties';

export default function Main() { 
  return (
    <>
      <Head>
        <title>ERP - Parties</title>
      </Head>
      <Home /> 
    </>
  );
}
