import { Button } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import FocusLock from 'react-focus-lock';
import { makeApiCall } from '../../functions/ApiCallGateway';
import { findIndexUsingItemName } from '../../global/commonfrontendfuncs';
import CustomTextBox from '../../inputs/CustomTextBox';
import CustomSnackbar from '../Snackbar/CustomSnackBar';
import ConfirmationDialog from './ConfirmationDialog';


function AddHSNDialogBox({ open, onClose, onSubmit, dialogData, setDialogData, gstList, setgstList }) {

    const dialogGSTNameInputRef = useRef(null);
    const dialogGSTPercentageInputRef = useRef(null);

    const dialogSubmitButtonRef = useRef(null);

    const isFirstRender = useRef(true);

    const [openYesNoDialog, setopenYesNoDialog] = useState(false);
    const [confirmationDialogMsg, setconfirmationDialogMsg] = useState("");

    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
    const [errormsg, seterrormsg] = useState('');

    const [tempdialogData, settempdialogData] = useState({
        HSN_CODE: "",
        HSN_ID: "",
        GST_REF_ID: "",

    });

    const handleSnackbarClose = () => {
        setIsSnackbarOpen(false);
        changeFocusTo(dialogGSTNameInputRef)
    };

    function handleSubmit() {
        setconfirmationDialogMsg("Add HSN code ?")
        setopenYesNoDialog(true)
    }

    function handleClose() {
        setconfirmationDialogMsg("Are you sure you want to go back ?")
        setopenYesNoDialog(true)
    }

    async function handleConfirmYesNo() {
        if (confirmationDialogMsg == "Add HSN code ?") {
            var tempgstid = findIndexUsingItemName(gstList, tempdialogData.GST_REF_ID, "GST_PERCENTAGE")

            if (tempgstid.length == 0) {
                const response = await makeApiCall('/api/addnew/newgst', {
                    GSTDetails: { GST_PERCENTAGE: tempdialogData.GST_REF_ID },
                });
                tempgstid = [{ GST_ID: response.result.gst_id }]
                setgstList(prevList => [
                    ...prevList,
                    {
                        GST_ID: response.result.gst_id,
                        GST_PERCENTAGE: tempdialogData.GST_REF_ID,
                        DISPLAY: 1
                    }]);
            }

            const response = await makeApiCall('/api/addnew/newhsn', {
                HSNDetails: tempdialogData,
                GST_REF: tempgstid[0].GST_ID
            });
            if (response.success) {
                setDialogData(tempdialogData, tempgstid[0].GST_ID, tempdialogData.GST_REF_ID);
                onSubmit(tempdialogData, tempgstid[0].GST_ID, response.result.hsn_id)
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
        if (confirmationDialogMsg == "Add HSN code ?") {

        } else if (confirmationDialogMsg == "Are you sure you want to go back ?") {
            changeFocusTo(dialogGSTNameInputRef)
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
        if (name == "GSTName") {
            changeFocusTo(dialogGSTPercentageInputRef);
        } else if (name == "GSTPercentage") {
            changeFocusTo(dialogSubmitButtonRef)
        }
    }

    function handlepreviousComponentFocus(name) {
        changeFocusTo(dialogGSTNameInputRef)
    }

    function handledialogGSTPercentageUpdate(value) {
        settempdialogData(prevData => ({
            ...prevData,
            GST_REF_ID: value
        }));
    }

    function handledialogGSTNameUpdate(value) {
        settempdialogData(prevData => ({
            ...prevData,
            HSN_CODE: value
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
                changeFocusTo(dialogSubmitButtonRef);
            } else if (event.key === 'ArrowRight') {
                changeFocusTo(dialogSubmitButtonRef);
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
                HSN_CODE: dialogData.HSN_CODE || "",
                GST_REF_ID: "",
                HSN_ID: "",

            }));
            changeFocusTo(dialogGSTNameInputRef)
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
                                <h5 className="modal-title">New HSN Code</h5>
                                <button type="button" className="btn-close" onClick={handleClose}> X</button>
                            </div>
                            <div className="modal-body">

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                }}>
                                    <p>
                                        HSN Code
                                    </p>

                                    <span style={{ width: '30px' }} />

                                    <CustomTextBox
                                        inputRef={dialogGSTNameInputRef}
                                        placeholderText="HSN Code"
                                        textType="text"
                                        textPattern='nnnnnnnn'
                                        onTextBoxValueChange={handledialogGSTNameUpdate}
                                        TextBoxValue={tempdialogData.HSN_CODE}
                                        defaultValue={tempdialogData.HSN_CODE}
                                        inputBoxWidth={"20vw"}
                                        nextComponentFocus={() => handlenextComponentFocus("GSTName")}
                                    />

                                </div>

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
                                        TextBoxValue={tempdialogData.GST_REF_ID}
                                        defaultValue={tempdialogData.GST_REF_ID}
                                        inputBoxWidth={"20vw"}
                                        nextComponentFocus={() => handlenextComponentFocus("GSTPercentage")}
                                        previousComponentFocus={() => handlepreviousComponentFocus("GSTPercentage")}
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

export default AddHSNDialogBox;

