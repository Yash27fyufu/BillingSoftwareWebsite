import React, { useEffect, useRef, useState } from "react";
import { makeApiCall } from '../../../utils/functions/ApiCallGateway';
import { convertToUpperCase, findIndexUsingItemName, getLastBillNumber, parseInteger, parseString } from "../../../utils/global/commonfrontendfuncs";
import AutoCompleteInputBox from "../../../utils/inputs/AutoComplete/AutoCompleteInputBox";
import CustomButton from '../../../utils/inputs/CustomButton';
import CustomDatePicker from "../../../utils/inputs/CustomDatePicker";
import CustomTextAreaBox from "../../../utils/inputs/CustomTextAreaBox";
import CustomTextBox from "../../../utils/inputs/CustomTextBox";
import CustomSnackbar from '../../../utils/widgets/Snackbar/CustomSnackBar';
import LoadingScreen from '../../../utils/widgets/Loading/LoadingScreen';
import AddBillSeriesDialogBox from '../../../utils/widgets/DialogBoxes/AddBillSeries';
import AddPartyDialogBox from '../../../utils/widgets/DialogBoxes/AddParty';
import InfoDialog from "../../../utils/widgets/DialogBoxes/InfoDialog";
import ItemsTable from "../itemsTable";
import TotalForSalesBill from "../totalCalc";

export default function SalesInvoice() {

  const [partyNameList, setpartyNameList] = useState([]);
  const [billSeriesList, setbillSeriesList] = useState([]);
  const [paymentModeList, setpaymentModeList] = useState([]);

  const [defaultpartyName, setdefaultpartyName] = useState("");
  const [defaultBillSeries, setdefaultBillSeries] = useState("");

  const [billNumber, setbillNumber] = useState(0);
  const [billDate, setbillDate] = useState(new Date().toLocaleDateString('en-CA') .slice(0, 10));
  const [billYear, setbillYear] = useState(new Date(billDate).getFullYear() + (new Date(billDate).getMonth() < 4 ? -1 : 0));

  const [priceWithTax, setpriceWithTax] = useState(false);

  const [subtotalAmount, setsubtotalAmount] = useState(0);

  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [errormsg, seterrormsg] = useState('');

  const [loadingScreen, setloadingScreen] = useState(true);

  const [openCompanyDialog, setopenCompanyDialog] = useState(false);
  const [openBillSeriesDialog, setopenBillSeriesDialog] = useState(false);

  const [openItemsDialog, setopenItemsDialog] = useState(false);
  const [openUnitDialog, setopenUnitDialog] = useState(false);
  const [openGSTDialog, setopenGSTDialog] = useState(false);

  const [openPaymentModeDialog, setopenPaymentModeDialog] = useState(false);

  const [openInfoDialog, setopenInfoDialog] = useState(false);
  const [infoMessage, setinfoMessage] = useState("");


  const [noOfPackings, setnoOfPackings] = useState(0);
  const [transportName, settransportName] = useState("");
  const [billNote, setbillNote] = useState("");

  const [totalAmount, settotalAmount] = useState(0);
  const [roundOffValue, setroundOffValue] = useState(0);
  const [freightCharges, setfreightCharges] = useState(0);
  const [totalDiscount, settotalDiscount] = useState(0);
  const [received, setreceived] = useState(0);


  const partyNameInputRef = useRef(null);
  const billDatePickerRef = useRef(null);
  const billSeriesInputRef = useRef(null);
  const billNumberInputRef = useRef(null);
  const phoneNumberInputRef = useRef(null);
  const billingAddressInputRef = useRef(null);
  const shippingAddressInputRef = useRef(null);

  const tableContainerRef = useRef(null);
  const totalContainerRef = useRef(null);
  const receivedRef = useRef(null);


  const submitButtonRef = useRef(null);

  // const [sameNameBillSeriesChangeID, setsameNameBillSeriesChangeID] = useState([]);

  const [shippingAddress, setshippingAddress] = useState("");

  const [PartyDetails, setPartyDetails] = useState({
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
    PARTY_OPENING_BALANCE_DATE: new Date().toLocaleDateString('en-CA') .slice(0, 10),
    NOTE: "",
    PARTY_ID: "",
    isCashEntry: false,

  });

  const [BillingDetails, setBillingDetails] = useState({
    BILL_SERIES: "",
    BILL_SERIES_ID: "",
    PREFIX: "",
  });

  const [tableData, setTableData] = useState([{
    id: 0,
    "ITEM_NAME": "",
    "QTY": "",
    "UNIT_NAME": "",
    "PRICE": null,
    "DIS_PERC": null,
    "DIS_AMT": null,
    "TAX_PERC": null,
    "TAX_AMT": null,
    "SUB_TOT": null,
    "GST_ID": "",
    "UNIT_ID": "",
    "ITEM_ID": "",

    // this is how the actual final used row will be but others are not changed
    // because they might not have data since they are at the bottom
  }, {
    id: 1,
    "ITEM_NAME": "",
    "QTY": "",
    "UNIT_NAME": "",
    "PRICE": null,
    "DIS_PERC": null,
    "DIS_AMT": null,
    "TAX_PERC": null,
    "TAX_AMT": null,
    "SUB_TOT": null,
    "GST_ID": "",
    "UNIT_ID": "",
    "ITEM_ID": "",

  }, {
    id: 2,
    "ITEM_NAME": "",
    "QTY": "",
    "UNIT_NAME": "",
    "PRICE": null,
    "DIS_PERC": null,
    "DIS_AMT": null,
    "TAX_PERC": null,
    "TAX_AMT": null,
    "SUB_TOT": null,
    "GST_ID": "",
    "UNIT_ID": "",
    "ITEM_ID": "",

  }]);

  const [PaymentModeDetails, setPaymentModeDetails] = useState({
    PAYMENT_MODE_ID: "",
    MODE_NAME: "",
  });


  const handleSubmit = async () => {

    // idk the purpose bt let it be till last or sometime 

    // let index = partyNameList.findIndex(party => party.PARTY_ID === PartyDetails.PARTY_ID);

    // if (index !== -1) {
    //   // Remove the existing dictionary
    //   partyNameList.splice(index, 1);
    //   // Insert the new dictionary at the same index
    //   partyNameList.splice(index, 0, PartyDetails);
    // }

    if (!BillingDetails || !billDate || !tableData || !billNumber || !subtotalAmount || !totalAmount) {
      seterrormsg("Missing or incorrect details");
      setIsSnackbarOpen(true)

    } else if (received && parseInteger(PaymentModeDetails.PAYMENT_MODE_ID) == 0) {
      seterrormsg("Incorrect payment mode");
      setIsSnackbarOpen(true)

    } else if (totalAmount < received) {
      setinfoMessage("Cannot receive more than the total")
      setopenInfoDialog(true)

    } else {
      const response = await makeApiCall('/api/sales/invoice/add', {
        PartyDetails: PartyDetails,
        BillingDetails: BillingDetails,
        shippingAddress: shippingAddress,
        priceWithTax: priceWithTax,
        tableData: tableData,
        noOfPackings: noOfPackings,
        transportName: transportName,
        billNote: billNote,
        PaymentModeDetails: PaymentModeDetails,
        roundOffValue: roundOffValue,
        freightCharges: freightCharges,
        totalDiscount: totalDiscount,
        received: received,
        billNumber: billNumber,
        billDate: billDate,
        subtotalAmount: subtotalAmount,
        totalAmount: totalAmount,

      });

      if (response.success) {
        window.location.reload(); // This will refresh the page

      } else {
        switch (response.error) {
          case "No such party exists":
            seterrormsg(response.error);
            setIsSnackbarOpen(true)
            break;
          default:
            seterrormsg(response);
            setIsSnackbarOpen(true)
        }
      }
    }

  }

  const handleSnackbarClose = () => {
    setIsSnackbarOpen(false);
  };


  const handleKeyDown = (event) => {
    if (event.altKey && !event.shiftKey && (event.key === "S" || event.key === "s")) {
      changeFocusTo(partyNameInputRef)

    }
    else if (event.key === "ArrowUp") {
      event.preventDefault();
      moveFocus('up');

    }
    else if (event.key === "ArrowDown") {
      event.preventDefault();
      moveFocus('down');

    }
    else if (event.key == "Enter" && event.ctrlKey && !event.altKey && !event.shiftKey) {
      var temp_tot_cont = document.getElementById('totalContainer')
      var temp_tab_cont = document.getElementById('tableContainer')


      var focusedElement = document.activeElement

      if (temp_tab_cont.contains(focusedElement)) {
        handlenextComponentFocus("BillTotal")
      } else if (temp_tot_cont.contains(focusedElement)) {
        handlenextComponentFocus("SubmitButton")
      } else {
        handlenextComponentFocus("ShippingAddress")
      }
    }
    // else if (event.key == "Tab" && !event.ctrlKey && !event.shiftKey) {
    //   console.info(event.target.id); // get the id and the value of the component if u want to use tab key to jump

    //   var temp_tab_cont = document.getElementById('tableContainer')

    //   var focusedElement = document.activeElement
    //   if (temp_tab_cont.contains(focusedElement) && !focusedElement.title) {
    //     event.preventDefault()
    //     handlenextComponentFocus("BillTotal")
    //   }
    // }
  }

  function moveFocus(direction) {
    const showDivOpen = document.getElementById('ConditionalList');
    if (showDivOpen && showDivOpen.offsetHeight > 0) return;

    const focusedInputID = document.activeElement.id;
    const [prefix, index] = focusedInputID.split("_");
    const newIndex = direction === 'up' ? parseInt(index) - 1 : parseInt(index) + 1;
    const newToFocusInput = document.getElementById(`${prefix}_${newIndex}`);

    if (newToFocusInput) {
      newToFocusInput.focus();
    }
  };


  // handle function for lists of auto-complete components

  function PartyNameListUpdated(selectedValue) {
    setpartyNameList(selectedValue.sort((a, b) => {
      return parseString(a.PARTY_NAME).localeCompare(parseString(b.PARTY_NAME));
    }));
  }

  function BillSeriesListUpdated(selectedValue) {
    setbillSeriesList(selectedValue.sort((a, b) => {
      return parseString(a.BILL_SERIES).localeCompare(parseString(b.BILL_SERIES));
    }));
  }

  function PaymentModesListUpdated(selectedValue) {
    setpaymentModeList(selectedValue.sort((a, b) => {
      return parseString(a.MODE_NAME).localeCompare(parseString(b.MODE_NAME));
    }));
  }

  // handle function for values update

  function handlePartyNameUpdate(value) {
    setPartyDetails(prevData => ({
      ...prevData,
      PARTY_NAME: value
    }));
  }

  function handlePartyNumberUpdate(value) {
    setPartyDetails(prevData => ({
      ...prevData,
      PARTY_NUMBER_1: value
    }));

    if (!PartyDetails.PARTY_NAME) {
      const filteredDicts = findIndexUsingItemName(partyNameList, value, ["PARTY_NUMBER_1", "PARTY_NUMBER_2"]);
      if (filteredDicts.length != 0) {
        setdefaultpartyName(filteredDicts[0].PARTY_NAME)


      }
    }
  }

  function handlePartyAddressUpdate(value) {
    setPartyDetails(prevData => ({
      ...prevData,
      PARTY_ADDRESS: value
    }));
  }

  function handleShippingAddressUpdate(value) {
    setshippingAddress(value)
  }

  function handleBillSeriesUpdate(value) {
    setBillingDetails(prevData => ({
      ...prevData,
      BILL_SERIES: value
    }));
  }

  function handleBillNumberUpdate(value) {
    if (value < 0) {
      value = 0
    }
    setbillNumber(value);
  }

  function handleBillDateChange(value) {
    setbillDate(value);
  }

  function handleOpenDialogBox(value) {
    if (value == "Party Name") {
      setopenCompanyDialog(true)
    } else if (value == "Bill Series") {
      setopenBillSeriesDialog(true)
    }
  }

  function handlenextComponentFocus(name) {

    if (name == "PartyName") {
      changeFocusTo(billDatePickerRef)
    } else if (name == "BillDate") {
      changeFocusTo(billSeriesInputRef)
    } else if (name == "BillSeries") {
      changeFocusTo(billNumberInputRef)
    } else if (name == "BillNumber") {
      changeFocusTo(phoneNumberInputRef)
    } else if (name == "PhoneNumber") {
      changeFocusTo(billingAddressInputRef)
    } else if (name == "BillingAddress") {
      changeFocusTo(shippingAddressInputRef)
    } else if (name == "ShippingAddress") {
      const firstInput = document.getElementById("ITEMNAME_0");
      if (firstInput) {
        firstInput.focus();
      }
    } else if (name == "BillTotal") {
      const firstInput = totalContainerRef.current.querySelector("input");
      if (firstInput) {
        firstInput.focus();
      }
    } else if (name == "SubmitButton") {
      changeFocusTo(submitButtonRef)
    }
  }

  function handlePreviousComponentFocus(name) {
    // if (name == "PartyName") {

    // } else if (name == "BillDate") {
    //   changeFocusTo(partyNameInputRef)
    // } else if (name == "BillSeries") {
    //   changeFocusTo(billDatePickerRef)
    // } else if (name == "BillNumber") {
    //   changeFocusTo(billSeriesInputRef)
    // } 
  }

  function handleCloseAddCompanyDialog() {
    setopenCompanyDialog(false);
  }

  function handleCloseBillSeriesDialog() {
    setopenBillSeriesDialog(false);
  }

  function handleCloseInfoDialog() {
    setopenInfoDialog(false);
    changeFocusTo(receivedRef)

  }

  function handleSubmitBillSeriesDialog(new_dictionary, bill_series, bill_series_id) {
    new_dictionary.BILL_SERIES_ID = bill_series_id;
    setopenBillSeriesDialog(false);
    setdefaultBillSeries(bill_series);
    setbillSeriesList(prevList => {
      const updatedList = [...prevList, new_dictionary];

      const sortedList = updatedList.sort((a, b) => {
        return parseString(a.BILL_SERIES).localeCompare(parseString(b.BILL_SERIES));
      });

      return sortedList;
    });
  }

  function handleSubmitAddCompanyDialog(new_dictionary, party_name, party_id) {
    new_dictionary.PARTY_NAME = new_dictionary.PARTY_NAME;

    setpartyNameList(prevList => {
      const updatedList = [...prevList, new_dictionary];

      const sortedList = updatedList.sort((a, b) => {
        return parseString(a.PARTY_NAME).localeCompare(parseString(b.PARTY_NAME));
      });

      return sortedList;
    });
    setPartyDetails(prevData => ({
      ...prevData,
      PARTY_ID: party_id,
    }))
    new_dictionary.PARTY_ID = party_id;
    setopenCompanyDialog(false);
    setdefaultpartyName(party_name);
  }


  // general functions

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
    }, 200);
  }
  async function getbillnum() {
    var x = await getLastBillNumber(
      "SALES_BILL",
      new Date(billDate).getFullYear() + (new Date(billDate).getMonth() < 4 ? -1 : 0),
      BillingDetails.BILL_SERIES_ID)

    setbillNumber(x || "")
  }

  async function fetchData() {
    try {
      setloadingScreen(true);
      var data = await getValuesFromSearchTable("BILL_SERIES", []);
      BillSeriesListUpdated(data);
      data = await getValuesFromSearchTable("PARTIES", []);
      PartyNameListUpdated(data);
      data = await getValuesFromSearchTable("PAYMENT_MODES", []);
      PaymentModesListUpdated(data)
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setloadingScreen(false);
    }
  }

  async function getValuesFromSearchTable(SearchTable, SearchValues) {
    const response = await makeApiCall('/api/utils/autocomplete', {
      SearchTable: SearchTable,
      SearchValues: SearchValues,
    });
    const data = response;
    return data.autoCompleteResult;
  }

  // use states and use effects
  useEffect(() => {
    if (!(openCompanyDialog || openBillSeriesDialog || openItemsDialog || openUnitDialog || openGSTDialog)) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [openCompanyDialog, openBillSeriesDialog, openItemsDialog, openUnitDialog, openGSTDialog]);

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (!loadingScreen) {
      changeFocusTo(partyNameInputRef);
    }
  }, [loadingScreen])

  useEffect(() => {
    if (openCompanyDialog == false && !loadingScreen) {
      changeFocusTo(partyNameInputRef);
    }
  }, [openCompanyDialog]);

  useEffect(() => {
    if (openBillSeriesDialog == false && !loadingScreen) {
      changeFocusTo(billSeriesInputRef)
    }
  }, [openBillSeriesDialog]);

  useEffect(() => {
    if (openCompanyDialog || openBillSeriesDialog) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [openCompanyDialog, openBillSeriesDialog])

  useEffect(() => {

    if (parseString(PartyDetails.PARTY_NAME).trim()) {
      var tempDict = partyNameList.find(dictionary => convertToUpperCase(dictionary.PARTY_NAME) == convertToUpperCase(PartyDetails.PARTY_NAME))
      if (tempDict && tempDict.PARTY_ID) {
        setPartyDetails(prevData => ({
          ...prevData,
          PARTY_ID: tempDict.PARTY_ID,
          BILLING_NAME: tempDict.BILLING_NAME,
          PARTY_NUMBER_1: tempDict.PARTY_NUMBER_1,
          PARTY_ADDRESS: tempDict.PARTY_ADDRESS,
          PARTY_PINCODE: tempDict.PARTY_PINCODE,
        }));
      } else {
        const value = "";
        setPartyDetails(prevData => ({
          ...prevData,
          NOTE: value,
          PARTY_OPENING_BALANCE_DATE: value,
          PARTY_OPENING_BALANCE: value,
          PARTY_NUMBER_2: value,
          PARTY_NUMBER_1: value,
          PARTY_MAIL: value,
          PARTY_GST: value,
          PARTY_PINCODE: value,
          TRANSPORT_NAME: value,
          PARTY_ADDRESS: value,
          BILLING_NAME: value,
          PARTY_ID: value,
        }));
      }
    } else {
      const value = "";
      setPartyDetails(prevData => ({
        ...prevData,
        NOTE: value,
        PARTY_OPENING_BALANCE_DATE: value,
        PARTY_OPENING_BALANCE: value,
        PARTY_NUMBER_2: value,
        PARTY_NUMBER_1: value,
        PARTY_MAIL: value,
        PARTY_GST: value,
        PARTY_PINCODE: value,
        TRANSPORT_NAME: value,
        PARTY_ADDRESS: value,
        BILLING_NAME: value,
        PARTY_ID: value,
      }));
    }
  }, [PartyDetails.PARTY_NAME])


  // useEffect(() => {
  //   if (sameNameBillSeriesChangeID) {
  //     setBillingDetails(prevData => ({
  //       ...prevData,
  //       BILL_SERIES_ID: sameNameBillSeriesChangeID.BILL_SERIES_ID,
  //       PREFIX: sameNameBillSeriesChangeID.PREFIX,
  //     }));
  //   } else {
  //     setBillingDetails(prevData => ({
  //       ...prevData,
  //       BILL_SERIES_ID: "",
  //       PREFIX: "",
  //     }));
  //   }
  // }, [sameNameBillSeriesChangeID]);

  function sameNameBillSeriesChangeID(value) {
    if (value) {
      setBillingDetails(prevData => ({
        ...prevData,
        BILL_SERIES_ID: value.BILL_SERIES_ID,
        PREFIX: value.PREFIX,
      }));
    } else {
      setBillingDetails(prevData => ({
        ...prevData,
        BILL_SERIES_ID: "",
        PREFIX: "",
      }));
    }
  }

  useEffect(() => {
    if (BillingDetails.BILL_SERIES_ID != "") {
      return
    }
    if (parseString(BillingDetails.BILL_SERIES).trim()) {
      var tempDict = billSeriesList.find(dictionary => convertToUpperCase(dictionary.BILL_SERIES) == convertToUpperCase(BillingDetails.BILL_SERIES))
      if (tempDict && tempDict.BILL_SERIES_ID) {
        setBillingDetails(prevData => ({
          ...prevData,
          BILL_SERIES_ID: tempDict.BILL_SERIES_ID,
          PREFIX: tempDict.PREFIX,
        }));
      } else {
        const value = "";
        setBillingDetails(prevData => ({
          ...prevData,
          BILL_SERIES_ID: value,
          PREFIX: value
        }));
      }
    } else {
      const value = "";
      setBillingDetails(prevData => ({
        ...prevData,
        BILL_SERIES_ID: value,
        PREFIX: value
      }));
    }
  }, [BillingDetails.BILL_SERIES])


  useEffect(() => {
    if (BillingDetails.BILL_SERIES_ID) {
      getbillnum()
    } else {
      setbillNumber("")
    }
  }, [BillingDetails.BILL_SERIES_ID, billYear])

  useEffect(() => {
    setbillYear(new Date(billDate).getFullYear() + (new Date(billDate).getMonth() < 4 ? -1 : 0))
  }, [billDate])



  return (

    <div style={{
      height: '100vh'
    }}>
      
      {loadingScreen && <LoadingScreen message="Data is being fetched..." />}

      <div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            marginLeft: "3vw",
          }}
        >


          <AutoCompleteInputBox
            inputRef={partyNameInputRef}
            placeholderText="Party Name"
            textType="text"
            addWhatText={"Party"}
            onTextBoxValueChange={handlePartyNameUpdate}
            TextBoxValue={PartyDetails.PARTY_NAME}
            defaultValue={defaultpartyName}
            SearchTable={"PARTIES"}
            SearchValues={[""]}
            valuesFetched={partyNameList}
            keytoChooseinList={"PARTY_NAME"}
            keystoSearchinList={["PARTY_NAME", "PARTY_GST", "PARTY_NUMBER_1"]}  // it can have any number of keys
            valuesUpdate={PartyNameListUpdated}
            inputBoxWidth={"30vw"}
            listDivWidth={"25vw"}
            labelText={"Party Name"}
            strictlyselectfromlist={true}
            nextComponentFocus={() => handlenextComponentFocus("PartyName")}
            previousComponentFocus={() => handlePreviousComponentFocus("PartyName")}
            openDialogBox={handleOpenDialogBox}
            isSnackbarOpen={isSnackbarOpen}
            setIsSnackbarOpen={setIsSnackbarOpen}
            seterrormsg={seterrormsg}
          />

          <div style={{ width: "1rem" }}></div>

          <CustomDatePicker
            inputRef={billDatePickerRef}
            inputBoxWidth={"10vw"}
            labelText={"Bill Date"}
            billDateValue={billDate}
            onDateChange={handleBillDateChange}
            setmsg={"Change date ?"}
            nextComponentFocus={() => handlenextComponentFocus("BillDate")}
            previousComponentFocus={() => handlePreviousComponentFocus("BillDate")}
          />

          <div style={{ width: "1rem" }}></div>

          <div className="input-group">
            {(BillingDetails.PREFIX == 0 || BillingDetails.PREFIX == 1)
              &&
              <span className="input-group-suffix no_select_text" >
                {BillingDetails.BILL_SERIES === "" ?
                  "" : BillingDetails.PREFIX == 1 ?
                    "Prefix" : BillingDetails.PREFIX == 0 ?
                      "Suffix" : ""}
              </span>
            }


            <AutoCompleteInputBox
              inputRef={billSeriesInputRef}
              placeholderText="Bill Series"
              textType="text"
              addWhatText={"Bill Series"}
              showClearButton={false}
              SearchTable={"BILL_SERIES"}
              SearchValues={[""]}
              keytoChooseinList={"BILL_SERIES"}
              keystoSearchinList={["BILL_SERIES"]}  // it can have any number of keys
              valuesFetched={billSeriesList}
              valuesUpdate={BillSeriesListUpdated}
              setsendIDToConfirmChangeForSameName={sameNameBillSeriesChangeID}
              TextBoxValue={BillingDetails.BILL_SERIES}
              onTextBoxValueChange={handleBillSeriesUpdate}
              defaultValue={defaultBillSeries}
              inputBoxWidth={"15vw"}
              listDivWidth={"15vw"}
              labelText={"Bill Series"}
              strictlyselectfromlist={true}
              nextComponentFocus={() => handlenextComponentFocus("BillSeries")}
              previousComponentFocus={() => handlePreviousComponentFocus("BillSeries")}
              openDialogBox={handleOpenDialogBox}
              isSnackbarOpen={isSnackbarOpen}
              setIsSnackbarOpen={setIsSnackbarOpen}
              seterrormsg={seterrormsg}
            />
          </div>

          <div style={{ width: "1rem" }}></div>

          <CustomTextBox
            inputRef={billNumberInputRef}
            placeholderText="Bill Number"
            textType="number"
            prefixZeroAllowed={true}
            onTextBoxValueChange={handleBillNumberUpdate}
            defaultValue={billNumber}
            maxValueforNumber={1000000000000000}
            TextBoxValue={billNumber}
            inputBoxWidth={"18vw"}
            labelText={"Bill Number"}
            nextComponentFocus={() => handlenextComponentFocus("BillNumber")}
            previousComponentFocus={() => handlePreviousComponentFocus("BillNumber")}
          />
          <div style={{ width: "1rem" }}></div>

        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            marginLeft: "3vw",
            marginTop: '1vh',
          }}
        >

          <CustomTextBox
            inputRef={phoneNumberInputRef}
            placeholderText="Phone Number"
            textType="number"
            defaultValue={PartyDetails.PARTY_NUMBER_1}
            TextBoxValue={PartyDetails.PARTY_NUMBER_1}
            onTextBoxValueChange={handlePartyNumberUpdate}
            nextComponentFocus={() => handlenextComponentFocus("PhoneNumber")}
            inputBoxWidth={"18vw"}
            labelText={"Phone Number"}
            isSnackbarOpen={isSnackbarOpen}
            setIsSnackbarOpen={setIsSnackbarOpen}
            seterrormsg={seterrormsg}
          />

          <div style={{ width: "1rem" }} />

          <CustomTextBox
            inputRef={billingAddressInputRef}
            placeholderText="Billing Address"
            textType="text"
            // texteditable={false}
            defaultValue={PartyDetails.PARTY_ADDRESS}
            TextBoxValue={PartyDetails.PARTY_ADDRESS}
            onTextBoxValueChange={handlePartyAddressUpdate}
            nextComponentFocus={() => handlenextComponentFocus("BillingAddress")}
            inputBoxWidth={"30vw"}
            labelText={"Billing Address"}
            isSnackbarOpen={isSnackbarOpen}
            setIsSnackbarOpen={setIsSnackbarOpen}
            seterrormsg={seterrormsg}
          />

          <div style={{ width: "1rem" }} />

          <CustomTextAreaBox
            inputId="ShippingAddress"
            inputRef={shippingAddressInputRef}
            placeholderText="Shipping Address"
            textType="text"
            TextBoxValue={shippingAddress}
            onTextBoxValueChange={handleShippingAddressUpdate}
            nextComponentFocus={() => handlenextComponentFocus("ShippingAddress")}
            inputBoxWidth={"30vw"}
            labelText={"Shipping Address"}
            isSnackbarOpen={isSnackbarOpen}
            setIsSnackbarOpen={setIsSnackbarOpen}
            seterrormsg={seterrormsg}
          />

          <div style={{ width: "1rem" }} />

        </div>

        <div style={{ height: "1rem" }} />

        <ItemsTable
          tableContainerRef={tableContainerRef}
          isSnackbarOpen={isSnackbarOpen}
          setIsSnackbarOpen={setIsSnackbarOpen}
          seterrormsg={seterrormsg}

          tableData={tableData}
          setTableData={setTableData}

          priceWithTax={priceWithTax}
          setpriceWithTax={setpriceWithTax}

          openItemsDialog={openItemsDialog}
          openUnitDialog={openUnitDialog}
          openGSTDialog={openGSTDialog}
          setopenItemsDialog={setopenItemsDialog}
          setopenUnitDialog={setopenUnitDialog}
          setopenGSTDialog={setopenGSTDialog}

          setsubtotalAmount={setsubtotalAmount}
          subtotalAmount={subtotalAmount}

        />
        <div style={{ height: "1rem" }}></div>

        <TotalForSalesBill
          totalContainerRef={totalContainerRef}
          receivedRef={receivedRef}
          subtotalAmount={subtotalAmount}
          noOfPackings={noOfPackings}
          setnoOfPackings={setnoOfPackings}
          transportName={transportName}
          settransportName={settransportName}
          billNote={billNote}
          setbillNote={setbillNote}
          paymentModeList={paymentModeList}
          setpaymentModeList={setpaymentModeList}
          PaymentModesListUpdated={PaymentModesListUpdated}
          PaymentModeDetails={PaymentModeDetails}
          setPaymentModeDetails={setPaymentModeDetails}
          totalAmount={totalAmount}
          settotalAmount={settotalAmount}
          roundOffValue={roundOffValue}
          setroundOffValue={setroundOffValue}
          freightCharges={freightCharges}
          setfreightCharges={setfreightCharges}
          totalDiscount={totalDiscount}
          settotalDiscount={settotalDiscount}
          received={received}
          setreceived={setreceived}

          openPaymentModeDialog={openPaymentModeDialog}
          setopenPaymentModeDialog={setopenPaymentModeDialog}

          isSnackbarOpen={isSnackbarOpen}
          setIsSnackbarOpen={setIsSnackbarOpen}
          seterrormsg={seterrormsg}
        />

        <div style={{ height: "1rem" }}></div>


        <CustomButton
          onClick={handleSubmit}
          label='SUBMIT'
          buttonRef={submitButtonRef}
        />


        <CustomSnackbar
          isOpen={isSnackbarOpen}
          message={errormsg}
          severity="error"
          onClose={handleSnackbarClose}
          duration={1500}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          alertStyles={{ backgroundColor: '#ff5252', color: '#fff' }}
          boxStyles={{ width: '40vw' }}
        />


        {openCompanyDialog
          &&
          <AddPartyDialogBox
            open={openCompanyDialog}
            dialogData={PartyDetails}
            setDialogData={setPartyDetails}
            onClose={handleCloseAddCompanyDialog}
            onSubmit={handleSubmitAddCompanyDialog}
          />
        }

        {openBillSeriesDialog
          &&
          <AddBillSeriesDialogBox
            open={openBillSeriesDialog}
            dialogData={BillingDetails}
            setDialogData={setBillingDetails}
            onClose={handleCloseBillSeriesDialog}
            onSubmit={handleSubmitBillSeriesDialog}
          />
        }

        {openInfoDialog
          &&
          <InfoDialog
            open={openInfoDialog}
            message={infoMessage}
            onClose={handleCloseInfoDialog}
          />
        }

      </div>

      <div style={{
        height: '20vh'
      }} />
    </div>
  );
}