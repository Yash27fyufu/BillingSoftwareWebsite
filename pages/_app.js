// import { useEffect, useState } from "react";
// /* css import */
// import { createTheme, ThemeProvider } from '@mui/material/styles';
// import Axios from "axios";
// import "../styles/main.scss";
// /* nprogress */
// import Nprogress from "nprogress";
// import "nprogress/nprogress.css";

// /* ui import */
// import CircularProgress from "@mui/material/CircularProgress";
// /* component import */
// import Head from "next/head";
// import Router, { useRouter } from "next/router";
// function MyApp({ Component, pageProps }) {

//   const [loader, setLoader] = useState(true);
//   const router = useRouter();

//   //this part handles smaller window size
//   const [windowDimensions, setWindowDimensions] = useState({
//     width: 0,
//     height: 0,
//   });


//   useEffect(() => {

//     function handleResize() {
//       setWindowDimensions({
//         width: window.innerWidth,
//         height: window.innerHeight,
//       });
//     }

//     handleResize(); // Get initial dimensions
//     window.addEventListener('resize', handleResize);

//     return () => {
//       window.removeEventListener('resize', handleResize);
//     };


//   }, []);

//   const isCompatible = windowDimensions.width >= 500 && windowDimensions.height >= 500;


//   //this part handles smaller window size - till here



//   useEffect(() => {
//     setLoader(false);
//     checkJwt();
//   }, [router.asPath]);

//   function start() {
//     setLoader(true);
//     Nprogress.start();
//   }
//   function stop() {
//     setLoader(false);
//     Nprogress.done();
//   }


//   // function checkJwt() {

//   //   if (localStorage.getItem("usertoken") != null) {
//   //     var token = localStorage.getItem("usertoken");
//   //     Axios.post("/api/user_auth/verifytoken", {
//   //       token: token
//   //     }).then(async response => {
//   //       if (response.data.success) { // the user token is correct
//   //         var promise = new Promise(async (res, rej) => {
//   //           const isValidRoute = router.route !== '/_error';
//   //           const routes = router.asPath.split("/");
//   //           if (routes[1] == '' || !isValidRoute) { //  if user is authenticated but trying to go to login page or if the route is invalid
//   //             Router.push("/home");
//   //           }
//   //         });
//   //       }

//   //       if (response.data.error) {
//   //         localStorage.clear();
//   //         var promise = new Promise(async (res, rej) => {
//   //           {
//   //             localStorage.clear();
//   //             Router.push("/");

//   //           }

//   //         });
//   //       }

//   //     })
//   //       .catch(error => {
//   //         localStorage.clear();
//   //         console.error(error);

//   //       });

//   //   } else { // if there is no usertoken in the local storage
//   //     Router.push("/");
//   //   }


//   // }

//   async function checkJwt() {
//     const token = localStorage.getItem('usertoken');
//     if (!token) {
//       return router.push('/'); // No token, redirect to home
//     }

//     try {
//       const response = await axios.post('/api/user_auth/verifytoken', { token });
//       if (response.data.success) {
//         // Handle successful token verification (e.g., display welcome message)
//       } else {
//         localStorage.clear();
//         router.push('/'); // Invalid token, redirect to home
//       }
//     } catch (error) {
//       console.error('Error verifying token:', error);
//       // Handle errors appropriately (e.g., display error message)
//     } finally {
//       stopLoading(); // Ensure loading stops regardless of outcome
//     }
//   }
//   useEffect(() => {
// checkJwt()
//   }, [router.asPath]);

//   Router.events.on("routeChangeStart", start);
//   Router.events.on("routeChangeComplete", stop);
//   Router.events.on("routeChangeError", stop);

//   const theme = createTheme({
//     components: {
//       // Name of the component ⚛️
//       MuiButtonBase: {
//         defaultProps: {
//           disableRipple: false, 
//         },
//       },
//       MuiButton: {
//         variants: [
//           {
//             props: { variant: 'dashed' },
//             style: {
//               textTransform: 'lowercase',
//               color: 'yellow',
//               border: '2px dashed blue',
//             },
//           },
//           {
//             props: { variant: 'dashedmmmm' },
//             style: {
//               border: '4px dashed yellow',
//               color: 'yellow',

//             },
//           },
//         ],
//       },
//     },
//   });
//   if (isCompatible) {
//     return (

//       <>
//         <Head>
//           <meta httpEquiv="x-ua-compatible" content="ie=edge" />
//           <meta
//             name="viewport"
//             content="width=device-width, initial-scale=1, shrink-to-fit=no"
//           />
//           <title>ERP</title>
//         </Head>
//         {loader ? (
//           <CircularProgress
//             sx={{ color: "var(--dblue)" }}
//           />
//         ) : (
//           <ThemeProvider theme={theme}>

//             <Component {...pageProps}  setLoader={setLoader} />
//           </ThemeProvider>
//         )}
//       </>
//     );
//   }
//   else {
//     return (
//       <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//         <p style={{ fontSize: '1.5rem', textAlign: 'center' }}>
//           This website is not compatible with devices smaller than 500x500 pixels.
//         </p>
//       </div>
//     );
//   }
// }

// export default MyApp;




// // ths is tnhe new code 1


// import { useEffect, useState } from "react";
// import { createTheme, ThemeProvider } from '@mui/material/styles';
// import Axios from "axios";
// import "../styles/main.scss";
// /* nprogress */
// import Nprogress from "nprogress";
// import "nprogress/nprogress.css";

// /* ui import */
// import CircularProgress from "@mui/material/CircularProgress";
// /* component import */
// import Head from "next/head";
// import Router, { useRouter } from "next/router";

// function MyApp({ Component, pageProps }) {
//   const [loader, setLoader] = useState(true);
//   const router = useRouter();

//   // Window size management
//   const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

//   useEffect(() => {
//     const handleResize = () => {
//       setWindowSize({ width: window.innerWidth, height: window.innerHeight });
//     };

//     handleResize(); // Get initial dimensions
//     window.addEventListener('resize', handleResize);

//     return () => {
//       window.removeEventListener('resize', handleResize);
//     };
//   }, []);

//   const isWindowCompatible = windowSize.width >= 500 && windowSize.height >= 500;

//   // Authentication handling
//   async function checkJwt() {
//     const token = localStorage.getItem('usertoken');
//     if (!token) {
//       return router.push('/'); // No token, redirect to home
//     }

//     try {
//       const response = await Axios.post('/api/user_auth/verifytoken', { token });
//       if (response.data.success) {
//         // Handle successful token verification (e.g., display welcome message)
//       } else {
//         localStorage.clear();
//         router.push('/'); // Invalid token, redirect to home
//       }
//     } catch (error) {
//       console.error('Error verifying token:', error);
//       // Handle errors appropriately (e.g., display error message)
//     } finally {
//       setLoader(false); // Ensure loading stops regardless of outcome
//     }
//   }

//   useEffect(() => {
//     checkJwt();
//   }, [router.asPath]); // Call checkJwt on route changes

//   // Router events for loading indicator
//   Router.events.on("routeChangeStart", () => setLoader(true));
//   Router.events.on("routeChangeComplete", () => setLoader(false));
//   Router.events.on("routeChangeError", () => setLoader(false));

//   const theme = createTheme({
//     components: {
//       // ... your MUI theme customization
//     },
//   });

//   return (
//     <>
//       <Head>
//         <meta httpEquiv="x-ua-compatible" content="ie=edge" />
//         <meta
//           name="viewport"
//           content="width=device-width, initial-scale=1, shrink-to-fit=no"
//         />
//         <title>ERP</title>
//       </Head>
//       {loader ? (
//         <CircularProgress sx={{ color: "var(--dblue)" }} />
//       ) :  isWindowCompatible &&(
//         <ThemeProvider theme={theme}>
//           <Component {...pageProps} setLoader={setLoader} />
//         </ThemeProvider>
//       )}
//       {!isWindowCompatible && (
//         <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//           <p style={{ fontSize: '1.5rem', textAlign: 'center' }}>
//             This website is not compatible with devices smaller than 500x500 pixels.
//           </p>
//         </div>
//       )}
//     </>
//   );
// }

// export default MyApp;



// this is new code - 2


import { createTheme, ThemeProvider } from '@mui/material/styles';
import Axios from "axios";
import { useEffect, useState } from "react";
import "../styles/main.scss";
/* nprogress */
import "nprogress/nprogress.css";

/* ui import */
import CircularProgress from "@mui/material/CircularProgress";
/* component import */
import Head from "next/head";
import Router, { useRouter } from "next/router";

function MyApp({ Component, pageProps }) {
  const [loader, setLoader] = useState(true);
  const router = useRouter();

  // Window size management
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    handleResize(); // Get initial dimensions
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const isWindowCompatible = windowSize.width >= 500 && windowSize.height >= 500;

  // Authentication handling with error handling
  async function checkJwt() {

    const token = localStorage.getItem('usertoken');
    if (!token) {
      return router.push('/'); // No token, redirect to home
    }

    try {
      const response = await Axios.post('/api/user_auth/verifytoken', { token });
      // Handle successful token verification

      if (response.data.success) {
        const validPaths = [
          '/home',
          '/sales/invoice/add',
          '/sales/invoice/view',
          '/sales/invoice/edit',
        ];

        if (!validPaths.includes(router.pathname)) {
          console.error("Change the file _app.js and add this path if required : " + router.pathname);
          
          router.push('/home'); // Redirect to the home page if invalid
        }

      } else { // Invalid token, redirect to home
        localStorage.clear();
        router.push('/');
      }
    } catch (error) {
      console.error('Error verifying token:', error);
    } finally {
      setLoader(false); // Ensure loading stops regardless of outcome
    }
  }

  useEffect(() => {
    checkJwt();
  }, [router.asPath]);

  Router.events.on("routeChangeStart", () => setLoader(true));
  Router.events.on("routeChangeComplete", () => setLoader(false));
  Router.events.on("routeChangeError", () => {
    setLoader(false);
    console.error('Error during route change!');
  });

  const theme = createTheme({
    components: {
    },
  });

  return (
    <>
      <Head>
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <title>ERP</title>
      </Head>
      {loader ? (
        <CircularProgress sx={{ color: "var(--dblue)" }} />
      ) : isWindowCompatible && (
        <ThemeProvider theme={theme}>
          <Component {...pageProps} setLoader={setLoader} />
        </ThemeProvider>
      )}
      {!isWindowCompatible && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <p style={{ fontSize: '1.5rem', textAlign: 'center' }}>
            This website is not compatible with devices smaller than 500x500 pixels.
          </p>
        </div>
      )}
    </>
  );
}

export default MyApp;


