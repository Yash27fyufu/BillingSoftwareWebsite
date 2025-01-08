import { Button } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import FocusLock from 'react-focus-lock';
import { makeApiCall } from '../../functions/ApiCallGateway';
import CustomTextBox from '../../inputs/CustomTextBox';
import CustomSnackbar from '../Snackbar/CustomSnackBar';
import ConfirmationDialog from './ConfirmationDialog';


function AddGSTDialogBox({ open, onClose, onSubmit, dialogData, setDialogData }) {

    const dialogGSTPercentageInputRef = useRef(null);

    const dialogSubmitButtonRef = useRef(null);

    const isFirstRender = useRef(true);

    const [openYesNoDialog, setopenYesNoDialog] = useState(false);
    const [confirmationDialogMsg, setconfirmationDialogMsg] = useState("");

    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
    const [errormsg, seterrormsg] = useState('');

    const [tempdialogData, settempdialogData] = useState({
        GST_ID: "",
        GST_PERCENTAGE: "",
    });

    const handleSnackbarClose = () => {
        setIsSnackbarOpen(false);
        changeFocusTo(dialogGSTPercentageInputRef)
    };

    function handleSubmit() {
        setconfirmationDialogMsg("Add tax slab ?")
        setopenYesNoDialog(true)
    }

    function handleClose() {
        setconfirmationDialogMsg("Are you sure you want to go back ?")
        setopenYesNoDialog(true)
    }

    async function handleConfirmYesNo() {
        if (confirmationDialogMsg == "Add tax slab ?") {

            const response = await makeApiCall('/api/addnew/newgst', {
                GSTDetails: tempdialogData,
            });
            if (response.success) {
                setDialogData(tempdialogData, response.result.gst_id);
                onSubmit(tempdialogData, tempdialogData.GST_PERCENTAGE, response.result.gst_id)

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
        if (confirmationDialogMsg == "Add tax slab ?") {

        } else if (confirmationDialogMsg == "Are you sure you want to go back ?") {
            changeFocusTo(dialogGSTPercentageInputRef)
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
        if (name == "GSTPercentage") {
            changeFocusTo(dialogSubmitButtonRef)
        }
    }

    function handledialogGSTPercentageUpdate(value) {
        settempdialogData(prevData => ({
            ...prevData,
            GST_PERCENTAGE: value
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
                GST_PERCENTAGE: dialogData.GST_PERCENTAGE || "",
                GST_ID: "",
            }));
            changeFocusTo(dialogGSTPercentageInputRef)
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
                                <h5 className="modal-title">New Tax Slab</h5>
                                <button type="button" className="btn-close" onClick={handleClose}> X</button>
                            </div>
                            <div className="modal-body">

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                }}>
                                    <p>
                                        GST Percentage
                                    </p>

                                    <span style={{ width: '30px' }} />

                                    <CustomTextBox
                                        inputRef={dialogGSTPercentageInputRef}
                                        placeholderText="GST Percentage"
                                        textType="number"
                                        allowDecimal={true}
                                        maxValueforNumber={100}
                                        onTextBoxValueChange={handledialogGSTPercentageUpdate}
                                        TextBoxValue={tempdialogData.GST_PERCENTAGE}
                                        defaultValue={tempdialogData.GST_PERCENTAGE}
                                        inputBoxWidth={"20vw"}
                                        nextComponentFocus={() => handlenextComponentFocus("GSTPercentage")}
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
                        duration={2000}
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

export default AddGSTDialogBox;

