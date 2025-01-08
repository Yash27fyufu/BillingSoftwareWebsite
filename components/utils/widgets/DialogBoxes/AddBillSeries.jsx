import { Button } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import FocusLock from 'react-focus-lock';
import { makeApiCall } from '../../functions/ApiCallGateway';
import CustomRadioButton from '../../inputs/CustomRadioButton';
import CustomTextBox from '../../inputs/CustomTextBox';
import CustomSnackbar from '../Snackbar/CustomSnackBar';
import ConfirmationDialog from './ConfirmationDialog';


function AddBillSeriesDialogBox({ open, onClose, onSubmit, dialogData, setDialogData }) {

    const [tempdialogData, settempdialogData] = useState(dialogData);

    const dialogBillSeriesNameInputRef = useRef(null);

    const dialogSubmitButtonRef = useRef(null);

    const isFirstRender = useRef(true);

    const [openYesNoDialog, setopenYesNoDialog] = useState(false);
    const [confirmationDialogMsg, setconfirmationDialogMsg] = useState("");

    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
    const [errormsg, seterrormsg] = useState('');

    const [isPrefix, setisPrefix] = useState(["Prefix"]);

    const handleSnackbarClose = () => {
        setIsSnackbarOpen(false);
        changeFocusTo(dialogBillSeriesNameInputRef)
    };

    function handledialogBillSeriesNameUpdate(value) {
        settempdialogData(prevData => ({
            ...prevData,
            BILL_SERIES: value
        }));
    }

    function handleSubmit(value) {

        setconfirmationDialogMsg("Add Series ?")
        setopenYesNoDialog(true)
    }

    function handleClose(value) {

        setconfirmationDialogMsg("Are you sure you want to go back ?")
        setopenYesNoDialog(true)
    }

    async function handleConfirmYesNo() {
        if (confirmationDialogMsg == "Add Series ?") {

            const response = await makeApiCall('/api/addnew/newbillseries', {
                BillingDetails: tempdialogData,
                isPrefix: isPrefix[0] == "Prefix",
            });
            if (response.success) {
                setDialogData(tempdialogData);
                onSubmit(tempdialogData, tempdialogData.BILL_SERIES, response.result.bill_series_id)
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

        changeFocusTo(dialogBillSeriesNameInputRef)

    }


    const handleClickDialog = (event) => {
        if (event.target.tagName == "INPUT" || event.target.tagName == "TEXTAREA" || event.target.tagName == "SPAN") {
            return
        }

        if (tempdialogData.BILL_SERIES.trim() == "") {
            changeFocusTo(dialogBillSeriesNameInputRef)
        } else {
            changeFocusTo(dialogSubmitButtonRef)
        }
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

        if (name == "BILL_SERIES") {
            changeFocusTo(dialogSubmitButtonRef)
        }
    }


    const handleKeyDown = (event) => {
        if (!open) {
            return
        }
        if (event.key === "Backspace") {
            changeFocusTo(dialogBillSeriesNameInputRef)
        } else
            if (event.ctrlKey && event.key == "Enter") {
                handleSubmit()
            } else if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight') && (document.activeElement === dialogSubmitButtonRef.current)) {
                event.preventDefault(); // Prevent scrolling when arrow keys are pressed
                if (event.key === 'ArrowLeft') {
                    changeFocusTo(dialogSubmitButtonRef)
                }
                else if (event.key === 'ArrowRight') {
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
                BILL_SERIES: dialogData.BILL_SERIES || ""
            }));
            changeFocusTo(dialogBillSeriesNameInputRef)
        }
    }, [dialogData, open]);


    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [openYesNoDialog, open])

    useEffect(() => {
        settempdialogData(prevData => ({
            ...prevData,
            PREFIX: isPrefix[0] == "Prefix"
        }));
    }, [isPrefix])

    return (

        <div>
            <FocusLock>
                <div className={`modal ${open ? 'open' : ''}`}>
                    <div className="modal-dialog">
                        <div onClick={handleClickDialog} className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">New Bill Series</h5>
                                <button type="button" className="btn-close" onClick={handleClose}> X</button>
                            </div>
                            <div className="modal-body">

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                }}>
                                    <p>
                                        Bill Series Name
                                    </p>

                                    <span style={{ width: '30px' }} />
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        width: '40vw',
                                        overflow: 'hidden',
                                    }}>
                                        <CustomTextBox
                                            inputRef={dialogBillSeriesNameInputRef}
                                            placeholderText="Bill Series"
                                            textType="text"
                                            onTextBoxValueChange={handledialogBillSeriesNameUpdate}
                                            TextBoxValue={tempdialogData.BILL_SERIES}
                                            defaultValue={tempdialogData.BILL_SERIES}
                                            inputBoxWidth={"20vw"}
                                            nextComponentFocus={() => handlenextComponentFocus("BILL_SERIES")}
                                        />

                                        <CustomRadioButton
                                            maxDisplayWidth='150px'
                                            options={["Prefix", "Suffix"]}
                                            setSelectedValues={setisPrefix}
                                            selectedValues={isPrefix}
                                            noOfChoices={1}
                                        />
                                    </div>
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

export default AddBillSeriesDialogBox;

