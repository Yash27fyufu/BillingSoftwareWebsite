import { Button } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import FocusLock from 'react-focus-lock';
import { makeApiCall } from '../../functions/ApiCallGateway';
import CustomTextBox from '../../inputs/CustomTextBox';
import CustomSnackbar from '../Snackbar/CustomSnackBar';
import ConfirmationDialog from './ConfirmationDialog';


function AddPaymentModeDialogBox({ open, onClose, onSubmit, dialogData, setDialogData }) {

    const dialogPaymentModeInputRef = useRef(null);

    const dialogSubmitButtonRef = useRef(null);

    const isFirstRender = useRef(true);

    const [openYesNoDialog, setopenYesNoDialog] = useState(false);
    const [confirmationDialogMsg, setconfirmationDialogMsg] = useState("");

    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
    const [errormsg, seterrormsg] = useState('');

    const [tempdialogData, settempdialogData] = useState({
        MODE_NAME: "",
        PAYMENT_MODE_ID: "",
    });

    const handleSnackbarClose = () => {
        setIsSnackbarOpen(false);
        changeFocusTo(dialogPaymentModeInputRef)
    };

    function handleSubmit() {
        setconfirmationDialogMsg("Add payment mode ?")
        setopenYesNoDialog(true)
    }

    function handleClose() {
        setconfirmationDialogMsg("Are you sure you want to go back ?")
        setopenYesNoDialog(true)
    }

    async function handleConfirmYesNo() {
        if (confirmationDialogMsg == "Add payment mode ?") {

            const response = await makeApiCall('/api/addnew/newpaymentmode', {
                PaymentModeDetails: tempdialogData,
            });
            if (response.success) {
                setDialogData(tempdialogData, response.result.payment_mode_id);
                onSubmit(tempdialogData, tempdialogData.MODE_NAME, response.result.payment_mode_id)

            } else {
                seterrormsg('Error: ' + response.error);
                setIsSnackbarOpen(true);
            }

        } else if (confirmationDialogMsg == "Are you sure you want to go back ?") {
            isFirstRender.current = true;
            onClose()
        }
        setopenYesNoDialog(false)
    }

    function handleCancelYesNo() {
        setopenYesNoDialog(false)
        if (confirmationDialogMsg == "Add payment mode ?") {

        } else if (confirmationDialogMsg == "Are you sure you want to go back ?") {
            changeFocusTo(dialogPaymentModeInputRef)
        }
    }


    const handleClickDialog = (event) => {
        if (event.target.tagName == "INPUT" || event.target.tagName == "TEXTAREA" || event.target.tagName == "SPAN") {
            return
        }
        changeFocusTo(dialogSubmitButtonRef)

    }

    function handleClickOutside(event) {
        if (openYesNoDialog) {  // if this dialog is not open or yesno dialog is open ignore
            return
        }
        if (!open) {
            return
        }
        if (!event.target.closest('.modal-content')) {
            if (isFirstRender.current) {
                isFirstRender.current = false;
                return;
            }
            handleClose();
        }
    }

    function handlenextComponentFocus(name) {
        if (name == "PaymentMode") {
            changeFocusTo(dialogSubmitButtonRef)
        }
    }

    function handledialogPaymentModeUpdate(value) {
        settempdialogData(prevData => ({
            ...prevData,
            MODE_NAME: value
        }));
    }

    const handleKeyDown = (event) => {
        if (!open) {
            return
        }
        if (event.ctrlKey && event.key == "Enter") {
            handleSubmit()
        } else if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight') && (document.activeElement === dialogSubmitButtonRef.current)) {
            event.preventDefault(); // Prevent scrolling when arrow keys are pressed
            if (event.key === 'ArrowLeft') {
                changeFocusTo(dialogSubmitButtonRef)
            } else if (event.key === 'ArrowRight') {
                changeFocusTo(dialogSubmitButtonRef)
            }
        } else if (event.key == "Escape" && !openYesNoDialog) {
            handleClose()
        }
    };
    function changeFocusTo(referenceToFocus) {
        setTimeout(() => {
                        try {
                if (referenceToFocus && referenceToFocus.current) {
                    referenceToFocus.current.focus();
                }
            } catch (error) {
                console.error("Error focusing the element:", error);
            }
        }, 20);
    }

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [dialogSubmitButtonRef, openYesNoDialog, open]);

    useEffect(() => {
        if (open) {
            settempdialogData(prevData => ({
                ...prevData,
                MODE_NAME: dialogData.MODE_NAME || "",
                PAYMENT_MODE_ID: "",
            }));
            changeFocusTo(dialogPaymentModeInputRef)
        }
    }, [dialogData, open])

    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [openYesNoDialog, open])

    return (
        <div>
            <FocusLock>
                <div className={`modal ${open ? 'open' : ''}`}>
                    <div className="modal-dialog">
                        <div onClick={handleClickDialog} className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">New Payment Mode</h5>
                                <button type="button" className="btn-close" onClick={handleClose}> X</button>
                            </div>
                            <div className="modal-body">

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                }}>
                                    <p>
                                        Payment Mode
                                    </p>

                                    <span style={{ width: '30px' }} />

                                    <CustomTextBox
                                        inputRef={dialogPaymentModeInputRef}
                                        placeholderText="Payment Mode"
                                        textType="text"
                                        onTextBoxValueChange={handledialogPaymentModeUpdate}
                                        TextBoxValue={tempdialogData.MODE_NAME}
                                        defaultValue={tempdialogData.MODE_NAME}
                                        inputBoxWidth={"20vw"}
                                        nextComponentFocus={() => handlenextComponentFocus("PaymentMode")}
                                    />

                                </div>

                            </div>
                            <div className="modal-footer">

                                <Button
                                    ref={dialogSubmitButtonRef}
                                    onClick={handleSubmit}
                                    color="primary">
                                    Submit
                                </Button>
                            </div>
                        </div>
                    </div>

                    <CustomSnackbar
                        isOpen={isSnackbarOpen}
                        message={errormsg}
                        severity="error"
                        onClose={handleSnackbarClose}
                        duration={1000}
                        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                        alertStyles={{ backgroundColor: '#ff5252', color: '#fff' }}
                        boxStyles={{ width: '40vw' }}
                    />

                    {openYesNoDialog
                        &&
                        <ConfirmationDialog
                            open={openYesNoDialog}
                            message={confirmationDialogMsg}
                            onConfirm={handleConfirmYesNo}
                            onClose={handleCancelYesNo}
                        />}
                </div>
            </FocusLock>
        </div>
    );
}

export default AddPaymentModeDialogBox;
