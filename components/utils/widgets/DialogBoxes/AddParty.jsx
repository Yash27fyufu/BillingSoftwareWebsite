import { Button } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import FocusLock from 'react-focus-lock';
import { makeApiCall } from '../../functions/ApiCallGateway';
import { getGSTinfromState, getStateNamefromGST, gst_states_data } from "../../global/StateCodesGST";
import AutoCompleteInputBox from '../../inputs/AutoComplete/AutoCompleteInputBox';
import CustomDatePicker from '../../inputs/CustomDatePicker';
import CustomRadioButton from '../../inputs/CustomRadioButton';
import CustomTextAreaBox from '../../inputs/CustomTextAreaBox';
import CustomTextBox from '../../inputs/CustomTextBox';
import CustomToggle from '../../inputs/CustomToggle';
import CustomSnackbar from '../Snackbar/CustomSnackBar';
import ConfirmationDialog from './ConfirmationDialog';
{/* this focus lock is best to have to avoid any focus on components behind it */ }


function AddPartyDialogBox({ open, onClose, onSubmit, dialogData, setDialogData }) {

    const [tempdialogData, settempdialogData] = useState({
        PARTY_NAME: "",
        BILLING_NAME: "",
        PARTY_ADDRESS: "",
        TRANSPORT_NAME: "",
        PARTY_PINCODE: "",
        PARTY_GST: "",
        GSTState: "",
        PARTY_MAIL: "",
        PARTY_NUMBER_1: "",
        PARTY_NUMBER_2: "",
        PARTY_OPENING_BALANCE: "",
        PARTY_OPENING_BALANCE_DATE: new Date().toLocaleDateString('en-CA').slice(0, 10),
        NOTE: "",
        PARTY_ID: "",
        isCashEntry: false,
    });
    const toggleDivRef = useRef(null);

    const dialogPartyNameInputRef = useRef(null);
    const dialogBillingNameInputRef = useRef(null);
    const dialogAddressInputRef = useRef(null);
    const dialogTransportNameInputRef = useRef(null);
    const dialogPincodeInputRef = useRef(null);
    const dialogGSTInputRef = useRef(null);
    const dialogMailInputRef = useRef(null);
    const dialogContactInputRef = useRef(null);
    const dialogAdditionalContactInputRef = useRef(null);
    const dialogOpeningBalanceInputRef = useRef(null);
    const dialogOpeningDateInputRef = useRef(null);
    const dialogNoteRef = useRef(null);
    const dialogSubmitButtonRef = useRef(null);

    const isFirstRender = useRef(true);

    const [openYesNoDialog, setopenYesNoDialog] = useState(false);
    const [confirmationDialogMsg, setconfirmationDialogMsg] = useState("");

    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
    const [errormsg, seterrormsg] = useState('');

    const [toReceive, settoReceive] = useState(["To Receive"]);

    const [tempForBillingNameUpdate, settempForBillingNameUpdate] = useState("");

    const handleToggle = () => {
        settempdialogData(prevData => ({
            ...prevData,
            isCashEntry: !prevData.isCashEntry
        }));

        settempForBillingNameUpdate(tempdialogData.PARTY_NAME)

    };

    const handleSnackbarClose = () => {
        setIsSnackbarOpen(false);
        changeFocusTo(toggleDivRef)
    };

    function handledialogPartyNameUpdate(value) {
        settempdialogData(prevData => ({
            ...prevData,
            PARTY_NAME: value
        }));
    }

    function handledialogBillingNameUpdate(value) {
        settempdialogData(prevData => ({
            ...prevData,
            BILLING_NAME: value,
            ...(prevData.isCashEntry ? { PARTY_NAME: value } : {})  // this will update party name as billing name if cash entry
        }));
    }

    function handledialogAddressUpdate(value) {
        settempdialogData(prevData => ({
            ...prevData,
            PARTY_ADDRESS: value
        }));
    }

    function handledialogTransportNameUpdate(value) {
        settempdialogData(prevData => ({
            ...prevData,
            TRANSPORT_NAME: value
        }));
    }

    function handledialogPincodeUpdate(value) {
        settempdialogData(prevData => ({
            ...prevData,
            PARTY_PINCODE: value
        }));
    }

    function handledialogGSTUpdate(value) {
        settempdialogData(prevData => {
            const newState = { ...prevData, PARTY_GST: value };
            if (value) {
                var temp = getStateNamefromGST(value.slice(0, 2))
                if (newState.GSTState == temp) {

                } else {
                    newState.GSTState = temp;
                }
            } else if (value.length < 2) {
                newState.GSTState = "";
            }
            return newState;
        });
    }

    function handledialogGSTStateUpdate(value) {

        settempdialogData(prevData => {
            const newState = { ...prevData, GSTState: value };
            if (value) {
                var temp = getGSTinfromState(value)
                if (newState.PARTY_GST == temp) {

                } else if (temp) {
                    newState.PARTY_GST = temp;
                    changeFocusTo(dialogGSTInputRef)
                }
            } else {
                newState.PARTY_GST = "";
            }
            return newState;
        });
    }


    function handledialogMailUpdate(value) {
        settempdialogData(prevData => ({
            ...prevData,
            PARTY_MAIL: value
        }));
    }

    function handledialogContactUpdate(value) {
        settempdialogData(prevData => ({
            ...prevData,
            PARTY_NUMBER_1: value
        }));
    }

    function handledialogAdditionalContactUpdate(value) {
        settempdialogData(prevData => ({
            ...prevData,
            PARTY_NUMBER_2: value
        }));
    }

    function handledialogOpeningBalanceUpdate(value) {
        settempdialogData(prevData => ({
            ...prevData,
            PARTY_OPENING_BALANCE: value
        }));
    }

    function handledialogOpeningDateUpdate(value) {
        settempdialogData(prevData => ({
            ...prevData,
            PARTY_OPENING_BALANCE_DATE: value
        }));
    }

    function handledialogNoteUpdate(value) {
        settempdialogData(prevData => ({
            ...prevData,
            NOTE: value
        }));
    }

    function handleSubmit(value) {
        setconfirmationDialogMsg("Create Party ?")
        setopenYesNoDialog(true)
    }


    function handleClose(value) {
        setconfirmationDialogMsg("Are you sure you want to go back ?")
        setopenYesNoDialog(true)
    }

    async function handleConfirmYesNo() {
        if (confirmationDialogMsg == "Create Party ?") {
            const response = await makeApiCall('/api/addnew/newparty', {
                PartyDetails: tempdialogData,
                toReceive: toReceive[0] == "To Receive",
                isCashEntry: tempdialogData.isCashEntry,
            });
            if (response.success) {
                setDialogData(tempdialogData);
                onSubmit(
                    tempdialogData,
                    tempdialogData.isCashEntry ? tempdialogData.BILLING_NAME : tempdialogData.PARTY_NAME,
                    response.result.party_id)
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
        if (confirmationDialogMsg == "Create Party ?") {
            changeFocusTo(dialogBillingNameInputRef)
        } else if (confirmationDialogMsg == "Are you sure you want to go back ?") {
            changeFocusTo(toggleDivRef)
        }
    }

    const handleClickDialog = (event) => {
        if (event.target.tagName == "INPUT" || event.target.tagName == "TEXTAREA" || event.target.className == "toggle-text-on" || event.target.tagName == "SPAN") {
            return
        }
        if (event.target.className == "container") {
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
        if (!event.target.closest('.modal-content') && !((event.target.className).includes('autocomplete'))) {
            if (isFirstRender.current) {
                isFirstRender.current = false;
                return;
            }
            handleClose();
        }
    }

    function handlenextComponentFocus(name) {

        if (name == "CashEntryToggle") {
            if (tempdialogData.isCashEntry) {
                settempForBillingNameUpdate(tempdialogData.PARTY_NAME)
                changeFocusTo(dialogBillingNameInputRef);
            } else {
                changeFocusTo(dialogPartyNameInputRef);
            }
        } else if (name == "PartyName") {
            settempForBillingNameUpdate(tempdialogData.PARTY_NAME)
            changeFocusTo(dialogBillingNameInputRef);
        } else if (name == "BillingName") {
            changeFocusTo(dialogAddressInputRef)
        } else if (name == "Address") {
            if (tempdialogData.isCashEntry) {
                changeFocusTo(dialogPincodeInputRef)
            } else {
                changeFocusTo(dialogTransportNameInputRef)
            }
        } else if (name == "Transport") {
            changeFocusTo(dialogPincodeInputRef)
        } else if (name == "Pincode") {
            changeFocusTo(dialogGSTInputRef)
        } else if (name == "GST") {
            changeFocusTo(dialogMailInputRef)
        } else if (name == "GSTState") {
            changeFocusTo(dialogMailInputRef)
        } else if (name == "Mailid") {
            changeFocusTo(dialogContactInputRef)
        } else if (name == "ContactNumber") {
            if (tempdialogData.isCashEntry) {
                changeFocusTo(dialogNoteRef)
            } else {
                changeFocusTo(dialogAdditionalContactInputRef)
            }
        } else if (name == "AdditionalContact") {
            changeFocusTo(dialogOpeningBalanceInputRef)
        } else if (name == "OpeningBalance") {
            changeFocusTo(dialogOpeningDateInputRef)
        } else if (name == "OpeningDate") {
            changeFocusTo(dialogNoteRef)
        } else if (name == "Note") {
            changeFocusTo(dialogSubmitButtonRef)
        }
    }

    function handlePreviousComponentFocus(name) {

        if (name == "BillingName") {
            changeFocusTo(dialogPartyNameInputRef)
        } else if (name == "Address") {
            changeFocusTo(dialogBillingNameInputRef)
        } else if (name == "Transport") {
            changeFocusTo(dialogAddressInputRef)
        } else if (name == "Pincode") {
            changeFocusTo(dialogTransportNameInputRef)
        } else if (name == "GST") {
            changeFocusTo(dialogPincodeInputRef)
        } else if (name == "GSTState") {
            changeFocusTo(dialogGSTInputRef)
        } else if (name == "Mailid") {
            changeFocusTo(dialogGSTInputRef)
        } else if (name == "ContactNumber") {
            changeFocusTo(dialogMailInputRef)
        } else if (name == "AdditionalContact") {
            changeFocusTo(dialogContactInputRef)
        } else if (name == "OpeningBalance") {
            changeFocusTo(dialogAdditionalContactInputRef)
        } else if (name == "OpeningDate") {
            changeFocusTo(dialogOpeningBalanceInputRef)
        }
    }
    const handleKeyDown = (event) => {
        if (!open) {
            return
        }
        else if (event.ctrlKey && event.key == "Enter") {
            handleSubmit()
        } else if ((event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
            event.preventDefault();
        }
        else if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight') && (document.activeElement === dialogSubmitButtonRef.current)) {
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
                PARTY_ID: "",
                PARTY_NAME: dialogData.PARTY_NAME || "",
                BILLING_NAME: "",
                PARTY_ADDRESS: "",
                TRANSPORT_NAME: "",
                PARTY_PINCODE: "",
                PARTY_GST: "",
                GSTState: "",
                PARTY_MAIL: "",
                PARTY_NUMBER_1: "",
                PARTY_NUMBER_2: "",
                PARTY_OPENING_BALANCE: "",
                PARTY_OPENING_BALANCE_DATE: new Date().toLocaleDateString('en-CA').slice(0, 10),
                NOTE: "",
                isCashEntry: false,

            }));
            changeFocusTo(toggleDivRef)
        }
    }, [open, dialogData])

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

                    <div className="modal-dialog" style={{ width: '60vw' }}>
                        <div onClick={handleClickDialog} className="modal-content">
                            <div className="modal-header">
                                <div style={{
                                    marginRight: "auto"
                                }}>
                                    <CustomToggle
                                        toggleRef={toggleDivRef}
                                        toggleWidth={"40px"}
                                        toggleText='Cash Entry'
                                        setopenYesNoDialog={setopenYesNoDialog}
                                        setconfirmationDialogMsg={setconfirmationDialogMsg}
                                        isOn={tempdialogData.isCashEntry}
                                        handleToggle={handleToggle}
                                        nextComponentFocus={() => handlenextComponentFocus("CashEntryToggle")} />
                                </div>

                                <h5 className="modal-title">New Party Details</h5>

                                <button tabIndex={-1} type="button" className="btn-close" onClick={handleClose}> X </button>
                            </div>

                            <div className="modal-body">

                                {!(tempdialogData.isCashEntry) && <div style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                }}>
                                    <p>
                                        Party Name
                                    </p>

                                    <span style={{ width: '10px' }} />

                                    <CustomTextBox
                                        inputRef={dialogPartyNameInputRef}
                                        placeholderText="Party Name"
                                        textType="text"
                                        texteditable={!tempdialogData.isCashEntry}
                                        onTextBoxValueChange={handledialogPartyNameUpdate}
                                        TextBoxValue={tempdialogData.PARTY_NAME}
                                        defaultValue={!tempdialogData.isCashEntry ? tempdialogData.PARTY_NAME : 'CASH'}
                                        inputBoxWidth={"40vw"}
                                        nextComponentFocus={() => handlenextComponentFocus("PartyName")}
                                        previousComponentFocus={() => handlePreviousComponentFocus("PartyName")}
                                    />

                                </div>}

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                }}>
                                    <p>
                                        Billing Name
                                    </p>

                                    <span style={{ width: '10px' }} />

                                    <CustomTextBox
                                        inputRef={dialogBillingNameInputRef}
                                        placeholderText="Billing Name"
                                        textType="text"
                                        defaultValue={tempForBillingNameUpdate}
                                        onTextBoxValueChange={handledialogBillingNameUpdate}
                                        TextBoxValue={tempdialogData.BILLING_NAME}
                                        inputBoxWidth={"40vw"}
                                        nextComponentFocus={() => handlenextComponentFocus("BillingName")}
                                        previousComponentFocus={() => handlePreviousComponentFocus("BillingName")}
                                    />

                                </div>

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                }}>
                                    <p>
                                        Address
                                    </p>

                                    <span style={{ width: '10px' }} />

                                    <CustomTextBox
                                        inputRef={dialogAddressInputRef}
                                        placeholderText="Address"
                                        textType="text"
                                        onTextBoxValueChange={handledialogAddressUpdate}
                                        TextBoxValue={tempdialogData.PARTY_ADDRESS}
                                        inputBoxWidth={"40vw"}
                                        nextComponentFocus={() => handlenextComponentFocus("Address")}
                                        previousComponentFocus={() => handlePreviousComponentFocus("Address")}
                                    />

                                </div>

                                {!(tempdialogData.isCashEntry) && <div style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                }}>
                                    <p>
                                        Transport
                                    </p>

                                    <span style={{ width: '10px' }} />

                                    <CustomTextBox
                                        inputRef={dialogTransportNameInputRef}
                                        placeholderText="Transport"
                                        texteditable={!tempdialogData.isCashEntry}
                                        textType="text"
                                        onTextBoxValueChange={handledialogTransportNameUpdate}
                                        TextBoxValue={tempdialogData.TRANSPORT_NAME}
                                        inputBoxWidth={"40vw"}
                                        nextComponentFocus={() => handlenextComponentFocus("Transport")}
                                        previousComponentFocus={() => handlePreviousComponentFocus("Transport")}
                                    />

                                </div>}

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                }}>
                                    <p>
                                        Pincode
                                    </p>

                                    <span style={{ width: '10px' }} />

                                    <CustomTextBox
                                        inputRef={dialogPincodeInputRef}
                                        placeholderText="Pincode"
                                        textType="number"
                                        onTextBoxValueChange={handledialogPincodeUpdate}
                                        TextBoxValue={tempdialogData.PARTY_PINCODE}
                                        inputBoxWidth={"40vw"}
                                        nextComponentFocus={() => handlenextComponentFocus("Pincode")}
                                        previousComponentFocus={() => handlePreviousComponentFocus("Pincode")}
                                    />

                                </div>

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                }}>
                                    <p>
                                        GST
                                    </p>

                                    <span style={{ width: '10px' }} />

                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        width: '40vw'
                                    }}>
                                        <CustomTextBox
                                            inputRef={dialogGSTInputRef}
                                            placeholderText="GST"
                                            textType="text"
                                            onTextBoxValueChange={handledialogGSTUpdate}
                                            TextBoxValue={tempdialogData.PARTY_GST}
                                            defaultValue={tempdialogData.PARTY_GST}
                                            textPattern='nnaaaaannnnana*'
                                            inputBoxWidth={"19vw"}
                                            nextComponentFocus={() => handlenextComponentFocus("GST")}
                                            previousComponentFocus={() => handlePreviousComponentFocus("GST")}
                                        />
                                        <span style={{ width: '2vw' }} />
                                        <p>
                                            State
                                        </p>

                                        <span style={{ width: '10px' }} />
                                        <AutoCompleteInputBox


                                            placeholderText="State"
                                            textType="text"
                                            texteditable={tempdialogData.PARTY_GST ? false : true}
                                            defaultValue={tempdialogData.GSTState}
                                            inputBoxWidth={"16vw"}
                                            isSnackbarOpen={isSnackbarOpen}
                                            setIsSnackbarOpen={setIsSnackbarOpen}
                                            seterrormsg={seterrormsg}
                                            nextComponentFocus={() => handlenextComponentFocus("GSTState")}

                                            onTextBoxValueChange={handledialogGSTStateUpdate}
                                            TextBoxValue={tempdialogData.GSTState}
                                            valuesFetched={gst_states_data}
                                            keytoChooseinList={"STATE"}
                                            keystoSearchinList={["STATE", "STATECODE", "TIN"]}
                                            showClearButton={false}
                                            listDivWidth={"15vw"}
                                            listDivHeight={"15vw"}
                                            strictlyselectfromlist={true}
                                        />
                                        {/* <CustomTextBox
                                    placeholderText="State"
                                    textType="text"
                                    texteditable={tempdialogData.PARTY_GST && (tempdialogData.PARTY_GST).length>2 ? false : true}
                                    defaultValue={tempdialogData.GSTState}
                                    inputBoxWidth={"16vw"}
                                    isSnackbarOpen={isSnackbarOpen}
                                    setIsSnackbarOpen={setIsSnackbarOpen}
                                    seterrormsg={seterrormsg}
                                    nextComponentFocus={() => handlenextComponentFocus("GSTState")}

                                /> */}
                                    </div>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',

                                }}>
                                    <p>
                                        Mail id
                                    </p>

                                    <span style={{ width: '10px' }} />

                                    <CustomTextBox
                                        inputRef={dialogMailInputRef}
                                        placeholderText="Mail id"
                                        textType="text"
                                        onTextBoxValueChange={handledialogMailUpdate}
                                        TextBoxValue={tempdialogData.PARTY_MAIL}
                                        inputBoxWidth={"40vw"}
                                        nextComponentFocus={() => handlenextComponentFocus("Mailid")}
                                        previousComponentFocus={() => handlePreviousComponentFocus("Mailid")}
                                    />
                                </div>

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                }}>
                                    <p>
                                        Contact Number
                                    </p>

                                    <span style={{ width: '10px' }} />

                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        width: '40vw',

                                    }}>

                                        <CustomTextBox
                                            inputRef={dialogContactInputRef}
                                            placeholderText="Contact Number"
                                            textType="number"
                                            onTextBoxValueChange={handledialogContactUpdate}
                                            TextBoxValue={tempdialogData.PARTY_NUMBER_1}
                                            inputBoxWidth={"19vw"}
                                            nextComponentFocus={() => handlenextComponentFocus("ContactNumber")}
                                            previousComponentFocus={() => handlePreviousComponentFocus("ContactNumber")}
                                        />

                                        <span style={{ width: '2vw' }} />

                                        {!(tempdialogData.isCashEntry) && <CustomTextBox
                                            inputRef={dialogAdditionalContactInputRef}
                                            placeholderText="Additional Number"
                                            textType="number"
                                            onTextBoxValueChange={handledialogAdditionalContactUpdate}
                                            TextBoxValue={tempdialogData.PARTY_NUMBER_2}
                                            inputBoxWidth={"19vw"}
                                            nextComponentFocus={() => handlenextComponentFocus("AdditionalContact")}
                                            previousComponentFocus={() => handlePreviousComponentFocus("AdditionalContact")}
                                        />

                                        }
                                    </div>
                                </div>

                                {!(tempdialogData.isCashEntry) && <div style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                }}>
                                    <p>
                                        Opening Balance
                                    </p>

                                    <span style={{ width: '10px' }} />
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        width: '40vw',
                                        overflow: 'hidden',
                                    }}>
                                        <CustomTextBox
                                            inputRef={dialogOpeningBalanceInputRef}
                                            placeholderText="Opening Balance"
                                            textType="text"
                                            texteditable={!tempdialogData.isCashEntry}
                                            onTextBoxValueChange={handledialogOpeningBalanceUpdate}
                                            TextBoxValue={tempdialogData.PARTY_OPENING_BALANCE}
                                            inputBoxWidth={"18vw"}
                                            nextComponentFocus={() => handlenextComponentFocus("OpeningBalance")}
                                            previousComponentFocus={() => handlePreviousComponentFocus("OpeningBalance")}
                                        />

                                        <CustomRadioButton
                                            maxDisplayWidth='150px'
                                            options={["To Pay", "To Receive"]}
                                            setSelectedValues={settoReceive}
                                            selectedValues={toReceive}
                                            noOfChoices={1}
                                            enableCheckBox={!tempdialogData.isCashEntry}
                                        />

                                    </div>
                                </div>}

                                {!(tempdialogData.isCashEntry) && <div style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                }}>
                                    <p>
                                        Opening Date
                                    </p>

                                    <span style={{ width: '10px' }} />

                                    <div style={{
                                        marginTop: "-10px",
                                        marginBottom: "10px"
                                    }}>
                                        <CustomDatePicker
                                            dateeditable={!tempdialogData.isCashEntry}
                                            inputRef={dialogOpeningDateInputRef}
                                            inputBoxWidth={"40vw"}
                                            billDateValue={tempdialogData.PARTY_OPENING_BALANCE_DATE}
                                            onDateChange={handledialogOpeningDateUpdate}
                                            nextComponentFocus={() => handlenextComponentFocus("OpeningDate")}
                                            previousComponentFocus={() => handlePreviousComponentFocus("OpeningDate")}


                                        />
                                    </div>

                                </div>}

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                }}>
                                    <p>
                                        Note
                                    </p>

                                    <span style={{ width: '10px' }} />

                                    <CustomTextAreaBox
                                        inputId='Note'
                                        inputRef={dialogNoteRef}
                                        placeholderText="Note..."
                                        textType="text"
                                        onTextBoxValueChange={handledialogNoteUpdate}
                                        TextBoxValue={tempdialogData.NOTE}
                                        inputBoxWidth={"40vw"}
                                        inputBoxHeight={"7vw"}
                                        nextComponentFocus={() => handlenextComponentFocus("Note")}
                                        previousComponentFocus={() => handlePreviousComponentFocus("Note")}
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
                        />
                    }
                </div>

            </FocusLock>
        </div>
    );
}

export default AddPartyDialogBox;
