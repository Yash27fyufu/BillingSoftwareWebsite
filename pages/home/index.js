import Head from 'next/head';
import Home from '../../components/home';

export default function Main() { 
  return (
    <>
      <Head>
        <title>ERP - Home</title>
      </Head>
      <Home /> 
    </>
  );
}
