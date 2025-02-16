import { Button } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import FocusLock from 'react-focus-lock';
import { makeApiCall } from '../../functions/ApiCallGateway';
import { findIndexUsingItemName, parseString } from '../../global/commonfrontendfuncs';
import AutoCompleteInputBox from '../../inputs/AutoComplete/AutoCompleteInputBox';
import CustomTextAreaBox from '../../inputs/CustomTextAreaBox';
import CustomTextBox from '../../inputs/CustomTextBox';
import CustomSnackbar from '../Snackbar/CustomSnackBar';
import AddGSTDialogBox from './AddGST';
import AddHSNDialogBox from './AddHSN';
import AddUnitDialogBox from './AddUnit';
import ConfirmationDialog from './ConfirmationDialog';


function AddItemsDialogBox({ open, onClose, onSubmit, dialogData, setDialogData, gstList, setgstList, unitList, setunitList, HSNList, setHSNList }) {

    const dialogItemNameInputRef = useRef(null);
    const dialogItemCodeInputRef = useRef(null);
    const dialogHSNInputRef = useRef(null);
    const dialogGSTPercentageInputRef = useRef(null);
    const dialogItemBrandInputRef = useRef(null);
    const dialogPurchasePriceInputRef = useRef(null);
    const dialogPurchaseDiscountInputRef = useRef(null);
    const dialogSalesPriceInputRef = useRef(null);
    const dialogSalesDiscountInputRef = useRef(null);
    const dialogItemUnitInputRef = useRef(null);
    const dialogItemOpeningQuantityInputRef = useRef(null);
    const dialogItemNoteInputRef = useRef(null);

    const dialogSubmitButtonRef = useRef(null);
    // const dialogCancelButtonRef = useRef(null);

    const isFirstRender = useRef(true);

    const [openHSNDialog, setopenHSNDialog] = useState(false);


    const [openUnitDialog, setopenUnitDialog] = useState(false);
    const [openGSTDialog, setopenGSTDialog] = useState(false);


    const [openYesNoDialog, setopenYesNoDialog] = useState(false);
    const [confirmationDialogMsg, setconfirmationDialogMsg] = useState("");

    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
    const [errormsg, seterrormsg] = useState('');

    const [changeGSTFromHSN, setchangeGSTFromHSN] = useState("");


    const [tempdialogData, settempdialogData] = useState({
        ITEM_ID: "",
        ITEM_NAME: "",
        ITEM_CODE: "",
        ITEM_HSN: "",
        ITEM_HSN_ID: "",
        ITEM_GST_TYPE_ID: "",
        ITEM_GST_TYPE: "",
        ITEM_BRAND: "",
        ITEM_PURCHASE_PRICE: "",
        ITEM_PURCHASE_DISCOUNT: "",
        ITEM_SALES_PRICE: "",
        ITEM_SALES_DISCOUNT: "",
        ITEM_DEFAULT_UNIT_ID: "",
        ITEM_DEFAULT_UNIT: "",
        ITEM_OPENING_QTY: "",
        ITEM_DESCRIPTION: "",

    });


    const [HSNDetails, setHSNDetails] = useState({
        HSN_CODE: "",
        HSN_ID: "",
        GST_REF_ID: "",

    });


    const [UnitDetails, setUnitDetails] = useState({
        UNIT_ID: "",
        UNIT_NAME: "",
        UNIT_SHORT_FORM: "",
    });


    const [GSTDetails, setGSTDetails] = useState({
        GST_ID: "",
        // GST_NAME: "",
        GST_PERCENTAGE: "",
    });

    const handleSnackbarClose = () => {
        setIsSnackbarOpen(false);
        if (errormsg != "Value not in db")
            changeFocusTo(dialogItemNameInputRef)
    };

    function handledialogItemNameUpdate(value) {
        settempdialogData(prevData => ({
            ...prevData,
            ITEM_NAME: value
        }));
    }

    function handledialogItemCodeUpdate(value) {
        settempdialogData(prevData => ({
            ...prevData,
            ITEM_CODE: value
        }));
    }

    function handledialogHSNUpdate(value) {
        setchangeGSTFromHSN("")
        //this will remove any gst written but later it will auto apply using useeffect if already set 
        handledialogGSTPercentageNameUpdate("")
        settempdialogData(prevData => ({
            ...prevData,
            ITEM_HSN: value
        }));

    }

    function handledialogGSTPercentageNameUpdate(value) {
        settempdialogData(prevData => ({
            ...prevData,
            ITEM_GST_TYPE: value
        }));
    }

    function handledialogItemBrandUpdate(value) {
        settempdialogData(prevData => ({
            ...prevData,
            ITEM_BRAND: value
        }));
    }

    function handlePurchasePriceUpdate(value) {
        settempdialogData(prevData => ({
            ...prevData,
            ITEM_PURCHASE_PRICE: value
        }));
    }

    function handlePurchaseDiscountUpdate(value) {
        settempdialogData(prevData => ({
            ...prevData,
            ITEM_PURCHASE_DISCOUNT: value
        }));
    }

    function handleSalesPriceUpdate(value) {
        settempdialogData(prevData => ({
            ...prevData,
            ITEM_SALES_PRICE: value
        }));
    }

    function handleSalesDiscountUpdate(value) {
        settempdialogData(prevData => ({
            ...prevData,
            ITEM_SALES_DISCOUNT: value
        }));
    }

    function handleItemUnitUpdate(value) {
        settempdialogData(prevData => ({
            ...prevData,
            ITEM_DEFAULT_UNIT: value
        }));
    }

    function handleItemOpeningQuantityUpdate(value) {
        settempdialogData(prevData => ({
            ...prevData,
            ITEM_OPENING_QTY: value
        }));
    }

    function handledialogItemDescriptionUpdate(value) {
        settempdialogData(prevData => ({
            ...prevData,
            ITEM_DESCRIPTION: value
        }));
    }

    function handleSubmit(value) {
        setconfirmationDialogMsg("Create Item ?")
        setopenYesNoDialog(true)
    }

    function clearAllValues(value = "") {
        settempdialogData(prevData => ({
            ...prevData,
            ITEM_OPENING_QTY: value,
            ITEM_DESCRIPTION: value,
            ITEM_DEFAULT_UNIT: value,
            ITEM_SALES_DISCOUNT: value,
            ITEM_SALES_PRICE: value,
            ITEM_PURCHASE_DISCOUNT: value,
            ITEM_PURCHASE_PRICE: value,
            ITEM_BRAND: value,
            ITEM_HSN: value,
            ITEM_CODE: value,
            ITEM_NAME: value
        }));
    }

    function handleClose(value) {
        setconfirmationDialogMsg("Are you sure you want to go back ?")

        setopenYesNoDialog(true)
    }

    async function handleConfirmYesNo() {
        if (confirmationDialogMsg == "Create Item ?") {

            const response = await makeApiCall('/api/addnew/newitem', {
                ItemDetails: tempdialogData,
            });
            if (response.success) {
                setDialogData(tempdialogData, response.result.item_id);
                onSubmit(tempdialogData.ITEM_NAME)
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
        if (confirmationDialogMsg == "Create Item ?") {

        } else if (confirmationDialogMsg == "Are you sure you want to go back ?") {
            changeFocusTo(dialogItemNameInputRef)

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

            if (!event.target.closest('.autocomplete-list_div')) {
                if (isFirstRender.current) {
                    isFirstRender.current = false;
                    return;
                }
                handleClose();
            }
        }
    }

    function handlesetHSNDetails(new_dictionary, gst_ref_id, gstValue) {
        handledialogHSNUpdate(new_dictionary.HSN_CODE)
        handledialogGSTPercentageNameUpdate(gstValue)
        setchangeGSTFromHSN(gst_ref_id)

    }

    function handlesetUnitDetails(new_dictionary, unit_id) {
        new_dictionary.UNIT_ID = unit_id;
        handleItemUnitUpdate(new_dictionary.UNIT_SHORT_FORM)
        setunitList(prevList => [...prevList, new_dictionary]);
    }

    function handlesetGSTDetails(new_dictionary, gst_id) {
        new_dictionary.GST_ID = gst_id;
        handledialogGSTPercentageNameUpdate(new_dictionary.GST_PERCENTAGE)
        setgstList(prevList => [...prevList, new_dictionary]);
    }

    function handleSubmitAddUnitDialog(new_dictionary, unit_short_form, unit_id) {
        new_dictionary.UNIT_ID = unit_id;
        setopenUnitDialog(false);
        changeFocusTo(dialogItemUnitInputRef)
        settempdialogData(prevData => ({
            ...prevData,
            ITEM_DEFAULT_UNIT_ID: unit_id,
        }));
    }
    function handleCloseAddUnitDialog() {
        setopenUnitDialog(false);
        changeFocusTo(dialogItemUnitInputRef)
    }

    function handleSubmitAddGSTDialog(new_dictionary, unit_short_form, gst_id) {
        new_dictionary.GST_ID = gst_id;
        setopenGSTDialog(false);
        changeFocusTo(dialogGSTPercentageInputRef)
        settempdialogData(prevData => ({
            ...prevData,
            ITEM_GST_TYPE_ID: gst_id,
        }));
    }

    function handleCloseAddGSTDialog() {
        setopenGSTDialog(false);
        changeFocusTo(dialogGSTPercentageInputRef)
    }

    function handleSubmitAddHSNDialog(new_dictionary, gst_ref_id, hsn_id) {
        new_dictionary.HSN_ID = hsn_id; // this could be skipped ig
        new_dictionary.GST_REF_ID = gst_ref_id; // this couldn't be skipped ig
        setopenHSNDialog(false);
        setHSNList(prevList => {
            const updatedList = [...prevList, new_dictionary];

            const sortedList = updatedList.sort((a, b) => {
                return parseString(a.HSN_CODE).localeCompare(parseString(b.HSN_CODE));
            });

            return sortedList;
        });
        changeFocusTo(dialogHSNInputRef)
        setchangeGSTFromHSN(gst_ref_id)

        settempdialogData(prevData => ({
            ...prevData,
            ITEM_GST_TYPE_ID: gst_ref_id,
            ITEM_HSN_ID: hsn_id
        }));

    }

    function handleCloseAddHSNDialog() {
        setopenHSNDialog(false);
        changeFocusTo(dialogHSNInputRef)

    }

    // function HSNListUpdate(selectedValue) {
    //     setHSNList(selectedValue.sort((a, b) => {
    //         return parseString(a.HSN_CODE).localeCompare(parseString(b.HSN_CODE));
    //     }));
    // }

    function handleOpenDialogBox(whichDialog, Textvalue, rowNumber) {

        if (whichDialog == "Item Unit") {
            setUnitDetails(prevData => ({
                ...prevData,
                UNIT_NAME: Textvalue
            }));
            setopenUnitDialog(true)
        } else if (whichDialog == "GST Percentage") {
            setGSTDetails(prevData => ({
                ...prevData,
                GST_PERCENTAGE: Textvalue
            }));
            setopenGSTDialog(true)
        } else if (whichDialog == "HSN Code") {
            setHSNDetails(prevData => ({
                ...prevData,
                HSN_CODE: Textvalue
            }));
            setopenHSNDialog(true)

        }
    }

    function handlenextComponentFocus(name) {

        if (name == "ItemName") {
            changeFocusTo(dialogItemCodeInputRef);
        } else if (name == "ITEM_CODE") {
            changeFocusTo(dialogHSNInputRef)
        } else if (name == "ITEM_HSN") {
            if (tempdialogData.ITEM_HSN.trim() != "") {
                changeFocusTo(dialogItemBrandInputRef)
            } else {
                changeFocusTo(dialogGSTPercentageInputRef)
            }
        } else if (name == "GSTPercentage") {
            changeFocusTo(dialogItemBrandInputRef)
        } else if (name == "ITEM_BRAND") {
            changeFocusTo(dialogPurchasePriceInputRef)
        } else if (name == "ITEM_PURCHASE_PRICE") {
            changeFocusTo(dialogPurchaseDiscountInputRef)
        } else if (name == "PurchaseDiscount") {
            changeFocusTo(dialogSalesPriceInputRef)
        } else if (name == "SalesPrice") {
            changeFocusTo(dialogSalesDiscountInputRef)
        } else if (name == "SalesDiscount") {
            changeFocusTo(dialogItemUnitInputRef)
        } else if (name == "ItemUnit") {
            changeFocusTo(dialogItemOpeningQuantityInputRef)
        } else if (name == "ItemOpeningQuantity") {
            changeFocusTo(dialogItemNoteInputRef)
        } else if (name == "ItemDescription") {
            changeFocusTo(dialogSubmitButtonRef)
        }
    }

    function handlepreviousComponentFocus(name) {

        if (name == "ITEM_CODE") {
            changeFocusTo(dialogItemNameInputRef)
        } else if (name == "ITEM_HSN") {
            changeFocusTo(dialogItemCodeInputRef)
        } else if (name == "GSTPercentage") {
            changeFocusTo(dialogHSNInputRef)
        } else if (name == "ITEM_BRAND") {
            if (tempdialogData.ITEM_HSN.trim() != "") {
                changeFocusTo(dialogHSNInputRef)
            } else {
                changeFocusTo(dialogGSTPercentageInputRef)
            }
        } else if (name == "ITEM_PURCHASE_PRICE") {
            changeFocusTo(dialogItemBrandInputRef)
        } else if (name == "PurchaseDiscount") {
            changeFocusTo(dialogPurchasePriceInputRef)
        } else if (name == "SalesPrice") {
            changeFocusTo(dialogPurchaseDiscountInputRef)
        } else if (name == "SalesDiscount") {
            changeFocusTo(dialogSalesPriceInputRef)
        } else if (name == "ItemUnit") {
            changeFocusTo(dialogSalesDiscountInputRef)
        } else if (name == "ItemOpeningQuantity") {
            changeFocusTo(dialogItemUnitInputRef)
        } else if (name == "ItemDescription") {
            changeFocusTo(dialogItemOpeningQuantityInputRef)
        }
    }

    const handleKeyDown = (event) => {
        if (!open) {
            return
        }
        if (event.ctrlKey && event.key == "Enter") {
            handleSubmit()
        } else if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight') && (/** document.activeElement === dialogCancelButtonRef.current || */ document.activeElement === dialogSubmitButtonRef.current)) {
            event.preventDefault(); // Prevent scrolling when arrow keys are pressed
            if (event.key === 'ArrowLeft') {
                changeFocusTo(dialogCancelButtonRef);
            } else if (event.key === 'ArrowRight') {
                changeFocusTo(dialogSubmitButtonRef);
            }
        } else if (event.key == "Escape" && !parseString(event.target.className).includes("autocomplete")) {
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
        if (changeGSTFromHSN != "") {
            var temp = findIndexUsingItemName(gstList, changeGSTFromHSN, "GST_ID")
            if (temp.length == 0) {
            } else {
                handledialogGSTPercentageNameUpdate(temp[0].GST_PERCENTAGE)

            }
        } else {

        }
    }, [changeGSTFromHSN, gstList]);

    useEffect(() => {

        var temp = findIndexUsingItemName(HSNList, tempdialogData.ITEM_HSN, "HSN_CODE")

        if (temp.length == 0) {
            setchangeGSTFromHSN("")
            settempdialogData(prevData => ({
                ...prevData,
                ITEM_HSN_ID: ""
            }))
        } else {
            setchangeGSTFromHSN(temp[0].GST_REF_ID)
            settempdialogData(prevData => ({
                ...prevData,
                ITEM_HSN_ID: temp[0].HSN_ID
            }))
        }
    }, [tempdialogData.ITEM_HSN, HSNList])

    useEffect(() => {
        var temp = findIndexUsingItemName(unitList, tempdialogData.ITEM_DEFAULT_UNIT, "UNIT_SHORT_FORM")
        if (temp.length == 0) {
            settempdialogData(prevData => ({
                ...prevData,
                ITEM_DEFAULT_UNIT_ID: ""
            }))
        } else {
            settempdialogData(prevData => ({
                ...prevData,
                ITEM_DEFAULT_UNIT_ID: temp[0].UNIT_ID
            }));
        }
    }, [tempdialogData.ITEM_DEFAULT_UNIT, unitList])

    useEffect(() => {
        var temp = findIndexUsingItemName(gstList, tempdialogData.ITEM_GST_TYPE, "GST_PERCENTAGE")
        if (temp.length == 0) {
            settempdialogData(prevData => ({
                ...prevData,
                ITEM_GST_TYPE_ID: ""
            }))
        } else {
            settempdialogData(prevData => ({
                ...prevData,
                ITEM_GST_TYPE_ID: temp[0].GST_ID
            }));
        }
    }, [tempdialogData.ITEM_GST_TYPE, gstList])


    useEffect(() => {
        if (openHSNDialog || openGSTDialog || openUnitDialog) {
            return
        }
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [/*dialogCancelButtonRef,*/ dialogSubmitButtonRef, openYesNoDialog, openHSNDialog, openGSTDialog, openUnitDialog, open]);

    useEffect(() => {
        if (open) {
            settempdialogData(prevData => ({
                ...prevData,

                ITEM_NAME: dialogData.ITEM_NAME || "",
                ITEM_CODE: "",
                ITEM_HSN: "",
                ITEM_BRAND: "",
                ITEM_PURCHASE_PRICE: "",
                ITEM_PURCHASE_DISCOUNT: "",
                ITEM_SALES_PRICE: "",
                ITEM_SALES_DISCOUNT: "",
                ITEM_DEFAULT_UNIT: "",
                ITEM_DESCRIPTION: ""

            }));
            changeFocusTo(dialogItemNameInputRef)
        } else {

            clearAllValues()
        }
    }, [dialogData.ITEM_NAME, open])

    useEffect(() => {
        if (openHSNDialog || openGSTDialog || openUnitDialog) {
            return
        }
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [openYesNoDialog, openHSNDialog, openGSTDialog, openUnitDialog, open])



    return (

        <div>
            <FocusLock>
                <div className={`modal ${open ? 'open' : ''}`}>
                    <div className="modal-dialog" style={{}}>
                        <div onClick={handleClickDialog} className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">New Item Details</h5>
                                <button type="button" className="btn-close" onClick={handleClose}> X</button>
                            </div>
                            <div className="modal-body">

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                }}>
                                    <p>
                                        Item Name
                                    </p>

                                    <span style={{ width: '10px' }} />
                                    <div style={{ alignContent: 'center' }}>
                                        <CustomTextBox
                                            inputRef={dialogItemNameInputRef}
                                            placeholderText="Item Name"
                                            textType="text"
                                            onTextBoxValueChange={handledialogItemNameUpdate}
                                            TextBoxValue={tempdialogData.ITEM_NAME}
                                            defaultValue={tempdialogData.ITEM_NAME}
                                            inputBoxWidth={"40vw"}
                                            nextComponentFocus={() => handlenextComponentFocus("ItemName")}
                                            previousComponentFocus={() => handlepreviousComponentFocus("ItemName")}
                                        />
                                    </div>

                                </div>

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                }}>
                                    <p>
                                        Item Code
                                    </p>

                                    <span style={{ width: '10px' }} />
                                    <div style={{ alignContent: 'center' }}>
                                        <CustomTextBox
                                            inputRef={dialogItemCodeInputRef}
                                            placeholderText="Item Code"
                                            textType="text"
                                            onTextBoxValueChange={handledialogItemCodeUpdate}
                                            TextBoxValue={tempdialogData.ITEM_CODE}
                                            inputBoxWidth={"40vw"}
                                            nextComponentFocus={() => handlenextComponentFocus("ITEM_CODE")}
                                            previousComponentFocus={() => handlepreviousComponentFocus("ITEM_CODE")}
                                        />
                                    </div>

                                </div>

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                }}>
                                    <p>
                                        HSN
                                    </p>

                                    <span style={{ width: '10px' }} />
                                    <div style={{ alignContent: 'center' }}>

                                        <AutoCompleteInputBox
                                            inputRef={dialogHSNInputRef}
                                            fieldCompulsory={false}
                                            placeholderText="HSN Code"
                                            textType="text"
                                            addWhatText={"HSN Code"}
                                            onTextBoxValueChange={handledialogHSNUpdate}
                                            TextBoxValue={tempdialogData.ITEM_HSN}
                                            defaultValue={tempdialogData.ITEM_HSN}
                                            SearchTable={"HSN_DETAILS"}
                                            SearchValues={[]}
                                            textPattern='nnnnnnnn'
                                            keytoChooseinList={"HSN_CODE"}
                                            keystoSearchinList={["HSN_CODE", "GST_REF_ID"]}
                                            valuesFetched={HSNList}
                                            valuesUpdate={setHSNList}
                                            inputBoxWidth={"40vw"}
                                            showClearButton={false}
                                            listDivWidth={"15vw"}
                                            strictlyselectfromlist={true}
                                            nextComponentFocus={() => handlenextComponentFocus("ITEM_HSN")}
                                            previousComponentFocus={() => handlepreviousComponentFocus("ITEM_HSN")}
                                            openDialogBox={handleOpenDialogBox}
                                            isSnackbarOpen={isSnackbarOpen}
                                            setIsSnackbarOpen={setIsSnackbarOpen}
                                            seterrormsg={seterrormsg}
                                        />
                                    </div>

                                </div>

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                }}>
                                    <p>
                                        GST Percentage
                                    </p>

                                    <span style={{ width: '10px' }} />
                                    <div style={{ alignContent: 'center' }}>

                                        <AutoCompleteInputBox
                                            inputRef={dialogGSTPercentageInputRef}
                                            fieldCompulsory={false}
                                            texteditable={tempdialogData.ITEM_HSN.trim() === "" ? true : false}
                                            placeholderText="GST Percentage"
                                            textType="number"
                                            allowDecimal="true"
                                            addWhatText={"Tax Slab"}
                                            onTextBoxValueChange={handledialogGSTPercentageNameUpdate}
                                            TextBoxValue={tempdialogData.ITEM_GST_TYPE}
                                            defaultValue={tempdialogData.ITEM_GST_TYPE}
                                            maxValueforNumber={100}
                                            SearchTable={"GST_TYPE"}
                                            SearchValues={[]}
                                            prefixZeroAllowed={false}
                                            keytoChooseinList={"GST_PERCENTAGE"}
                                            valuesFetched={gstList}
                                            valuesUpdate={setgstList}
                                            inputBoxWidth={"40vw"}
                                            showClearButton={false}
                                            listDivWidth={"15vw"}
                                            strictlyselectfromlist={true}
                                            previousComponentFocus={() => handlepreviousComponentFocus("GSTPercentage")}
                                            nextComponentFocus={() => handlenextComponentFocus("GSTPercentage")}
                                            openDialogBox={handleOpenDialogBox}
                                            isSnackbarOpen={isSnackbarOpen}
                                            setIsSnackbarOpen={setIsSnackbarOpen}
                                            seterrormsg={seterrormsg}
                                        />
                                    </div>

                                </div>

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                }}>
                                    <p>
                                        Item Brand
                                    </p>

                                    <span style={{ width: '10px' }} />
                                    <div style={{ alignContent: 'center' }}>
                                        <CustomTextBox
                                            inputRef={dialogItemBrandInputRef}
                                            placeholderText="Item Brand"
                                            textType="text"
                                            onTextBoxValueChange={handledialogItemBrandUpdate}
                                            TextBoxValue={tempdialogData.ITEM_BRAND}
                                            inputBoxWidth={"40vw"}
                                            nextComponentFocus={() => handlenextComponentFocus("ITEM_BRAND")}
                                            previousComponentFocus={() => handlepreviousComponentFocus("ITEM_BRAND")}
                                        />

                                    </div>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                }}>
                                    <p>
                                        Purchase Price
                                    </p>

                                    <span style={{ width: '10px' }} />

                                    <div style={{ alignContent: 'center' }}>
                                        <CustomTextBox
                                            inputRef={dialogPurchasePriceInputRef}
                                            placeholderText="Purchase Price"
                                            textType="number"
                                            allowDecimal="true"
                                            onTextBoxValueChange={handlePurchasePriceUpdate}
                                            TextBoxValue={tempdialogData.ITEM_PURCHASE_PRICE}
                                            inputBoxWidth={"40vw"}
                                            nextComponentFocus={() => handlenextComponentFocus("ITEM_PURCHASE_PRICE")}
                                            previousComponentFocus={() => handlepreviousComponentFocus("ITEM_PURCHASE_PRICE")}
                                        />

                                    </div>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',

                                }}>
                                    <p>
                                        Purchase Discount
                                    </p>

                                    <span style={{ width: '10px' }} />
                                    <div style={{ alignContent: 'center' }}>
                                        <CustomTextBox
                                            inputRef={dialogPurchaseDiscountInputRef}
                                            placeholderText="Purchase Discount"
                                            textType="number"
                                            allowDecimal="true"
                                            onTextBoxValueChange={handlePurchaseDiscountUpdate}
                                            TextBoxValue={tempdialogData.ITEM_PURCHASE_DISCOUNT}
                                            inputBoxWidth={"40vw"}
                                            nextComponentFocus={() => handlenextComponentFocus("PurchaseDiscount")}
                                            previousComponentFocus={() => handlepreviousComponentFocus("PurchaseDiscount")}
                                        />
                                    </div>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                }}>
                                    <p>
                                        Sales Price
                                    </p>

                                    <span style={{ width: '10px' }} />

                                    <div style={{ alignContent: 'center' }}>
                                        <CustomTextBox
                                            inputRef={dialogSalesPriceInputRef}
                                            placeholderText="Sales Price"
                                            textType="number"
                                            allowDecimal="true"
                                            onTextBoxValueChange={handleSalesPriceUpdate}
                                            TextBoxValue={tempdialogData.ITEM_SALES_PRICE}
                                            inputBoxWidth={"40vw"}
                                            nextComponentFocus={() => handlenextComponentFocus("SalesPrice")}
                                            previousComponentFocus={() => handlepreviousComponentFocus("SalesPrice")}
                                        />

                                    </div>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                }}>
                                    <p>
                                        Sales Discount
                                    </p>

                                    <span style={{ width: '10px' }} />
                                    <div style={{ alignContent: 'center' }}>
                                        <CustomTextBox
                                            inputRef={dialogSalesDiscountInputRef}
                                            placeholderText="Sales Discount"
                                            textType="number"
                                            allowDecimal="true"
                                            onTextBoxValueChange={handleSalesDiscountUpdate}
                                            TextBoxValue={tempdialogData.ITEM_SALES_DISCOUNT}
                                            inputBoxWidth={"40vw"}
                                            nextComponentFocus={() => handlenextComponentFocus("SalesDiscount")}
                                            previousComponentFocus={() => handlepreviousComponentFocus("SalesDiscount")}
                                        />
                                    </div>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                }}>
                                    <p>
                                        Item Unit
                                    </p>

                                    <span style={{ width: '10px' }} />

                                    <AutoCompleteInputBox
                                        inputRef={dialogItemUnitInputRef}
                                        fieldCompulsory={false}
                                        placeholderText="Item Unit"
                                        textType="text"
                                        addWhatText={"Unit"}
                                        onTextBoxValueChange={handleItemUnitUpdate}
                                        TextBoxValue={tempdialogData.ITEM_DEFAULT_UNIT}
                                        defaultValue={tempdialogData.ITEM_DEFAULT_UNIT}
                                        SearchTable={"UNIT"}
                                        SearchValues={[]}
                                        keytoChooseinList={"UNIT_SHORT_FORM"}
                                        keystoSearchinList={["UNIT_NAME", "UNIT_SHORT_FORM"]}
                                        valuesFetched={unitList}
                                        valuesUpdate={setunitList}
                                        inputBoxWidth={"40vw"}
                                        showClearButton={false}
                                        listDivWidth={"15vw"}
                                        listDivHeight={"15vw"}
                                        strictlyselectfromlist={true}
                                        nextComponentFocus={() => handlenextComponentFocus("ItemUnit")}
                                        previousComponentFocus={() => handlepreviousComponentFocus("ItemUnit")}
                                        openDialogBox={handleOpenDialogBox}
                                        isSnackbarOpen={isSnackbarOpen}
                                        setIsSnackbarOpen={setIsSnackbarOpen}
                                        seterrormsg={seterrormsg}
                                    />

                                </div>

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                }}>
                                    <p>
                                        Item Opening Quantity
                                    </p>

                                    <span style={{ width: '10px' }} />

                                    <div style={{ alignContent: 'center' }}>
                                        <CustomTextBox
                                            placeholderText="Item Opening Quantity"
                                            inputRef={dialogItemOpeningQuantityInputRef}
                                            textType="number"
                                            allowDecimal="true"
                                            inputBoxWidth={"40vw"}
                                            billDateValue={tempdialogData.ITEM_OPENING_QTY}
                                            onTextBoxValueChange={handleItemOpeningQuantityUpdate}
                                            nextComponentFocus={() => handlenextComponentFocus("ItemOpeningQuantity")}
                                            previousComponentFocus={() => handlepreviousComponentFocus("ItemOpeningQuantity")}


                                        />
                                    </div>

                                </div>


                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                }}>
                                    <p>
                                        Item Description
                                    </p>

                                    <span style={{ width: '10px' }} />

                                    <CustomTextAreaBox
                                        inputRef={dialogItemNoteInputRef}
                                        inputId='ItemDes'
                                        placeholderText="Item Description..."
                                        textType="text"
                                        onTextBoxValueChange={handledialogItemDescriptionUpdate}
                                        TextBoxValue={tempdialogData.ITEM_DESCRIPTION}
                                        inputBoxWidth={"40vw"}
                                        inputBoxHeight={"5vh"}
                                        nextComponentFocus={() => handlenextComponentFocus("ItemDescription")}
                                        previousComponentFocus={() => handlepreviousComponentFocus("ItemDescription")}

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

                    {openHSNDialog
                        &&
                        <AddHSNDialogBox
                            open={openHSNDialog}
                            dialogData={HSNDetails}
                            setDialogData={handlesetHSNDetails}
                            onClose={handleCloseAddHSNDialog}
                            onSubmit={handleSubmitAddHSNDialog}

                            gstList={gstList}
                            setgstList={setgstList}

                        />
                    }
                    {openUnitDialog
                        &&
                        <AddUnitDialogBox
                            open={openUnitDialog}
                            dialogData={UnitDetails}
                            setDialogData={handlesetUnitDetails}
                            onClose={handleCloseAddUnitDialog}
                            onSubmit={handleSubmitAddUnitDialog}

                            unitList={unitList}
                            setunitList={setunitList}
                        />
                    }

                    {openGSTDialog
                        &&
                        <AddGSTDialogBox
                            open={openGSTDialog}
                            dialogData={GSTDetails}
                            setDialogData={handlesetGSTDetails}
                            onClose={handleCloseAddGSTDialog}
                            onSubmit={handleSubmitAddGSTDialog}
                        />
                    }

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

export default AddItemsDialogBox;

