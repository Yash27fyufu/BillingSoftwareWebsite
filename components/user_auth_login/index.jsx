import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useRef, useState } from 'react';
import { makeApiCall } from '../utils/functions/ApiCallGateway';
import CustomTextBox from '../utils/inputs/CustomTextBox';
import CustomSnackbar from '../utils/widgets/Snackbar/CustomSnackBar';
import Cookies from 'js-cookie';


function UserAuth ()  {
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [password, setPassword] = useState('');   
    const [username, setUsername] = useState('');
    const [errormsg, seterrormsg] = useState('');
    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);


    const usernameRef = useRef(null);
    const passwordRef = useRef(null);

    const handlePasswordToggle = () => {
        setShowPassword(!showPassword);
    };

    const handleCheckboxChange = () => {
        setRememberMe(!rememberMe);

    };

    const handleUsernameChange = (value) => {
        setUsername(value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleSnackbarClose = () => {
        setIsSnackbarOpen(false);
    };





    const handleSubmit = async () => {

        if (!username || !password) {
            seterrormsg('Username and password fields are required.');
            setIsSnackbarOpen(true);
            if (!username) {
                changeFocusTo(usernameRef);
            }
            return;
        }

        try {
            const response = await makeApiCall('/api/user_auth/verifyuser', {
                username: username,
                password: password,
                rememberMe: rememberMe,
            });

            const data = response;
            if (data.success) {
                localStorage.setItem('usertoken', data.data.token);
                Cookies.set('userToken',data.data.token,{path:'/',expires: 100 * 24 * 60 * 60})
                window.location.href = "/home";// this adds the mentioned part in domain route 
            } else {
                seterrormsg('Error: ' + data.error);
                setIsSnackbarOpen(true);
            }
        } catch (error) {
            console.error('Error:', error);
            seterrormsg('An error occurred. Please try again.');
            setIsSnackbarOpen(true);
        }
    };

    // const handleKeyPress = (e) => {
    //     if (!e.ctrlKey && !e.altKey && !e.shiftKey) {
    //         if (e.key === 'Enter') {
    //             if (e.target.id === 'logusername') {
    //                 changeFocusTo(passwordRef)
    //             } else if (e.target.id === 'logpass') {
    //                 handleSubmit(); // Assuming handleSubmit is defined somewhere in your component
    //             }
    //         }
    //     }
    // };

    function changeFocusTo(referenceToFocus) {
        setTimeout(() => {
            // try catch inside timeout along with check condition ensures no crash
            try {
                if (referenceToFocus && referenceToFocus.current) {
                    referenceToFocus.current.focus();
                }
            } catch (error) {
                console.error("Error focusing the element:", error);
            }
        }, 20);
    }


    function handlenextComponentFocus(name) {
        if (name == "UserName") {
            changeFocusTo(passwordRef)
        }
    }


    return (
        <div className="loginpage-body no_select_text">
            <label htmlFor="reg_log"></label>
            <div className="loginpage-card_3d_wrap">
                <div className="loginpage-card_3d_wrapper">
                    <div className="loginpage-card_front" >
                        <div className="loginpage-center_wrap">
                            <h1 className="loginpage-h1style">Log In</h1>
                            <div className="loginpage-form_group">
                                {/* <input
                                    ref={usernameRef}

                                    type="username"
                                    name="logusername"
                                    className="loginpage-form_style"
                                    placeholder="Username"
                                    id="logusername"
                                    onChange={handleUsernameChange}
                                    autoComplete="off"
                                    onKeyDown={handleKeyPress}

                                /> */}

                                <CustomTextBox
                                    // diffClassForInput={'loginpage-form_style'}
                                    inputRef={usernameRef}
                                    placeholderText="User Name"
                                    textType="text"
                                    onTextBoxValueChange={handleUsernameChange}
                                    onlyCaps={false}
                                    TextBoxValue={username}
                                    inputBoxWidth={"20vw"}
                                    nextComponentFocus={() => handlenextComponentFocus("UserName")}
                                />


                                <i className="loginpage-input_icon"></i>
                            </div>
                            <div className="loginpage-form_group">
                                <input
                                    ref={passwordRef}
                                    type={showPassword ? 'text' : 'password'}
                                    name="logpass"
                                    className="loginpage-form_style"
                                    placeholder="Password"
                                    id="logpass"
                                    autoComplete='off'
                                    onChange={handlePasswordChange}
                                // onKeyDown={handleKeyPress}

                                />

                                <i className="loginpage-input_icon"></i>
                                <FontAwesomeIcon
                                    className="loginpage-eye_icon"
                                    icon={showPassword ? faEyeSlash : faEye}
                                    onClick={handlePasswordToggle}
                                />
                            </div>

                            <div >
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                    className='loginpage-rememberMecontainer'>
                                    <input
                                        className="loginpage-rememberMecheckbox "
                                        type="checkbox"
                                        onChange={handleCheckboxChange}
                                        checked={rememberMe}

                                    />
                                    <label
                                        className='loginpage-rememberMetext'
                                        onClick={handleCheckboxChange}
                                    >
                                        Remember Me
                                    </label>
                                </div>
                            </div>
                            <br />
                            <div >
                                <a
                                    className="loginpage-btn loginpage-a"
                                    onClick={handleSubmit}
                                    tabIndex="0"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            if (!event.ctrlKey && !event.altKey && !event.shiftKey) {
                                                handleSubmit();
                                            }
                                        }
                                    }}>
                                    Submit
                                </a>
                            </div>
                            <p className="loginpage-text_center loginpage-stylep">
                                <a
                                    href="/a"
                                    className="loginpage-link loginpage-a"
                                >
                                    Forgot your password?
                                </a>
                            </p>

                        </div>
                    </div>
                </div>
            </div>
            {/* <Snackbar
                open={isSnackbarOpen}
                autoHideDuration={2000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>

                <Box sx={{ width: '38vw' }}>
                    <Alert
                        severity="error"
                        onClose={handleSnackbarClose}
                        sx={{ backgroundColor: '#f44336', color: '#fff' }}>
                        {errormsg}
                    </Alert>
                </Box>
            </Snackbar> */}

<CustomSnackbar
        isOpen={isSnackbarOpen}
        message={errormsg}
        severity="error"
        onClose={handleSnackbarClose}
        duration={2000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        alertStyles={{ backgroundColor: '#ff5252', color: '#fff' }}
        boxStyles={{ width: '40vw' }}
      />
            <style>

            </style>
        </div>

    );
};

export default UserAuth;
