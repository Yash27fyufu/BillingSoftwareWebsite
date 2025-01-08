import React, { useState } from 'react';

import Sidebar from '../utils/widgets/SideBar/SideNavBar';

function Parties() {
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);

    const handlePasswordToggle = () => {
        setShowPassword(!showPassword);
    };

    const handleCheckboxChange = () => {
        setRememberMe(!rememberMe);
    };

    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleSnackbarClose = () => {
        setIsSnackbarOpen(false);
    };


    return (
        <div className="section bodys" style={{ display: "grid", gridTemplateColumns: "1fr" }}>

            <div style={{ display: "flex" }}>
                <Sidebar />
                <div className="divstyle" >Box 1</div>
                <h6>Box 11</h6>
                <h6>Box 11</h6>
                <h6>Box 11</h6>
                <h6>Box 11</h6>
                <h6>Box 11</h6>
                <h6>Box 11</h6>
                <div className="divstyle" >Box 1</div>
                <div className="divstyle" >Box 1</div>
                <h6>Box 11</h6>
            </div>

        </div>
    );
};

export default Parties;
