import { Grid } from '@mui/material';
import React, { useRef, useEffect, useState } from 'react';
import AutoCompleteInputBox from '../../utils/inputs/AutoComplete/AutoCompleteInputBox';
import CustomTextBox from '../../utils/inputs/CustomTextBox';
import CustomTextAreaBox from '../../utils/inputs/CustomTextAreaBox';
import { convertToUpperCase, parseString, roundOffIntegers } from '../../utils/global/commonfrontendfuncs';
import AddPaymentModeDialogBox from '../../utils/widgets/DialogBoxes/AddPaymentMode';

const TotalForSalesBill = ({
  totalContainerRef,
  receivedRef,
  subtotalAmount,

  noOfPackings,
  setnoOfPackings,
  transportName,
  settransportName,
  billNote,
  setbillNote,
  paymentModeList,
  setpaymentModeList,
  PaymentModesListUpdated,
  PaymentModeDetails,
  setPaymentModeDetails,
  totalAmount,
  settotalAmount,
  roundOffValue,
  setroundOffValue,
  freightCharges,
  setfreightCharges,
  totalDiscount,
  settotalDiscount,
  received,
  setreceived,
  openPaymentModeDialog,
  setopenPaymentModeDialog,
  isSnackbarOpen,
  setIsSnackbarOpen,
  seterrormsg,

}) => {



  const noOfPackingsRef = useRef(null);
  const transportNameRef = useRef(null);
  const paymentModeRef = useRef(null);
  const billNoteRef = useRef(null);
  const roundOffRef = useRef(null);
  const freightChargesRef = useRef(null);
  const totalDiscountRef = useRef(null);



  const [defaultPaymentMode, setdefaultPaymentMode] = useState(false);



  function handlenextComponentFocus(name) {

    if (name == "Packings") {
      changeFocusTo(transportNameRef)
    } else if (name == "TransportName") {
      changeFocusTo(paymentModeRef)
    } else if (name == "PaymentMode") {
      changeFocusTo(billNoteRef)
    } else if (name == "BillNote") {
      changeFocusTo(roundOffRef)
    } else if (name == "RoundOff") {
      changeFocusTo(freightChargesRef)
    } else if (name == "FreightCharges") {
      changeFocusTo(totalDiscountRef)
    } else if (name == "TotalDiscount") {
      changeFocusTo(receivedRef)
    } else if (name == "Received") {
      changeFocusTo(noOfPackingsRef)

    } else {

    }
  }



  // function PaymentModeListUpdated(selectedValue) {
  //   setpaymentModeList(selectedValue.sort((a, b) => {
  //     return (a.MODE_NAME).localeCompare(b.MODE_NAME);
  //   }));
  // }

  function handlePreviousComponentFocus(name) {
    if (name == "Packings") {

    } else if (name == "TransportName") {
      changeFocusTo(noOfPackingsRef)
    } else if (name == "RoundOff") {
      changeFocusTo(transportNameRef)
    } else if (name == "FreightCharges") {
      changeFocusTo(roundOffRef)
    } else if (name == "TotalDiscount") {
      changeFocusTo(freightChargesRef)
    } else if (name == "Received") {
      changeFocusTo(totalDiscountRef)
    } else {

    }
  }

  function handleOpenDialogBox(value) {
    setopenPaymentModeDialog(true)
  }

  function handleCloseDialogBox() {
    setopenPaymentModeDialog(false)
  }

  function handleNoOfPackingsChange(value) {
    setnoOfPackings(value)
  }

  function handleTransportNameChange(value) {
    settransportName(value)
  }

  function handleBillNoteChange(value) {
    setbillNote(value)
  }

  function handlePaymentModeChange(value) {
    setPaymentModeDetails(prevData => ({
      ...prevData,
      MODE_NAME: value
    }));
  }

  function handleRoundOffValueChange(value) {
    setroundOffValue(value)
  }

  function handleTotalDiscountValueChange(value) {
    settotalDiscount(value)
  }

  function handleFreightChargesChange(value) {
    setfreightCharges(value)
  }

  function handlereceivedChange(value) {
    setreceived(value)
  }

  function handleClosePaymentDialog() {
    setopenPaymentModeDialog(false);
    changeFocusTo(paymentModeRef)
  }

  function handleSubmitPaymentModeDialog(new_dictionary, payment_mode, payment_mode_id) {
    new_dictionary.PAYMENT_MODE_ID = payment_mode_id;
    setopenPaymentModeDialog(false);
    setdefaultPaymentMode(payment_mode);
    setpaymentModeList(prevList => {
      const updatedList = [...prevList, new_dictionary];

      const sortedList = updatedList.sort((a, b) => {
        return parseString(a.MODE_NAME).localeCompare(parseString(b.MODE_NAME));
      });

      return sortedList;
    });
  }

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


  function parseInteger(stringvalue) {
    if (isNaN(stringvalue)) {
      return 0;
    }
    if (!stringvalue ) {
      return 0;
    }
    if (parseInt(stringvalue * 100) == 0) {
      return 0;
    }
    else {
      return Math.round(parseFloat(stringvalue) * 100) / 100;
    }
  }


  useEffect(() => {
    if (parseString(PaymentModeDetails.MODE_NAME).trim()) {
      var tempDict = paymentModeList.find(dictionary => convertToUpperCase(dictionary.MODE_NAME) == convertToUpperCase(PaymentModeDetails.MODE_NAME))
      if (tempDict && tempDict.PAYMENT_MODE_ID) {
        setPaymentModeDetails(prevData => ({
          ...prevData,
          PAYMENT_MODE_ID: tempDict.PAYMENT_MODE_ID,
        }));
      } else {
        const value = "";
        setPaymentModeDetails(prevData => ({
          ...prevData,
          PAYMENT_MODE_ID: value,
        }));
      }
    } else {
      const value = "";
      setPaymentModeDetails(prevData => ({
        ...prevData,
        PAYMENT_MODE_ID: value,
      }));
    }
  }, [PaymentModeDetails.MODE_NAME])


  useEffect(() => {

    if (roundOffValue == roundOffIntegers(roundOffIntegers(subtotalAmount, false) - subtotalAmount)) {
      var x = parseInteger(subtotalAmount) + parseInteger(roundOffValue) + parseInteger(freightCharges) - totalDiscount
      settotalAmount(parseInteger(x))

    } else {
      setroundOffValue(roundOffIntegers(roundOffIntegers(subtotalAmount, false) - subtotalAmount))

    }
  }, [subtotalAmount])

  useEffect(() => {
    var x = parseInteger(subtotalAmount) + parseInteger(roundOffValue) + parseInteger(freightCharges) - totalDiscount
    settotalAmount(parseInteger(x))

  }, [roundOffValue, freightCharges, totalDiscount])


  return (
    <div
      id='totalContainer'
      className='no_select_text'
      ref={totalContainerRef}
      style={{
        marginLeft: "1vw",
        marginRight: "1vw",
        border: 'solid black 1px',
        overflow: 'hidden'
      }}>

      <Grid container columns={13} >


        {/* left side of grid*/}
        <Grid paddingTop={'10px'} item xs={9.8}>

          <Grid container paddingTop={'3px'} columns={9.8}>
            <Grid item xs={2.5} paddingTop={'5px'} className='total_calc-grid_item_text_left' >
              <p style={{
                fontSize: '15px'
              }}>
                NO. OF PACKINGS

              </p>
            </Grid>
            <Grid item xs={3} className='total_calc-grid_item_value_left' >
              <CustomTextBox
                inputRef={noOfPackingsRef}
                placeholderText=''
                TextBoxValue={noOfPackings}
                defaultValue={noOfPackings}
                onTextBoxValueChange={handleNoOfPackingsChange}
                textType='number'
                allowDecimal={true}
                inputBoxWidth={"95%"}
                inputBoxHeight='3.5vh'
                nextComponentFocus={() => handlenextComponentFocus("Packings")}
                previousComponentFocus={() => handlePreviousComponentFocus("Packings")}
              />
            </Grid>
          </Grid>

          <Grid container paddingTop={'15px'} columns={9.8}>
            <Grid item xs={2.5} paddingTop={'3px'} className='total_calc-grid_item_text_left' >
              <p style={{
                fontSize: '15px'
              }}>
                TRANSPORT

              </p>
            </Grid>
            <Grid item xs={3} className='total_calc-grid_item_value_left' >
              <CustomTextBox
                inputRef={transportNameRef}
                TextBoxValue={transportName}
                defaultValue={transportName}
                onTextBoxValueChange={handleTransportNameChange}
                placeholderText=''
                inputBoxWidth={"95%"}
                inputBoxHeight='3.5vh'
                nextComponentFocus={() => handlenextComponentFocus("TransportName")}
                previousComponentFocus={() => handlePreviousComponentFocus("TransportName")}
              />
            </Grid>
          </Grid>








          {/* BESIDE THIS PAYMENT MODE ALSO INCLUDE SOMETHING WHICH SHOWS ALL THE PAYMENT HISTORY IN REGARD TO THAT BILL
IF POSSIBLE ALSO MAKE THAT EDITABLE ONLY IF REQUIRED 
CHECK VYAPAR FOR REFERERENCE 
*/}












          <Grid container paddingTop={'15px'} columns={9.8}>
            <Grid item xs={2.5} paddingTop={'3px'} className='total_calc-grid_item_text_left' >
              <p style={{
                fontSize: '15px'
              }}>
                PAYMENT MODE

              </p>
            </Grid>
            <Grid item xs={3} className='total_calc-grid_item_value_left' >


              <AutoCompleteInputBox
                inputRef={paymentModeRef}
                placeholderText=""
                textType="text"
                addWhatText={"Payment Mode"}
                onTextBoxValueChange={handlePaymentModeChange}
                TextBoxValue={PaymentModeDetails["MODE_NAME"]}
                defaultValue={defaultPaymentMode}
                SearchTable={"PAYMENT_MODES"}
                SearchValues={[]}
                keytoChooseinList={"MODE_NAME"}
                keystoSearchinList={["MODE_NAME"]}
                valuesUpdate={PaymentModesListUpdated}
                valuesFetched={paymentModeList}
                showClearButton={false}
                inputBoxHeight='3.5vh'
                inputBoxWidth={"95%"}
                listDivWidth={"25vw"}
                nextComponentFocus={() => handlenextComponentFocus("PaymentMode")}
                previousComponentFocus={() => handlePreviousComponentFocus("PaymentMode")}
                openDialogBox={handleOpenDialogBox}
                isSnackbarOpen={isSnackbarOpen}
                setIsSnackbarOpen={setIsSnackbarOpen}
                seterrormsg={seterrormsg}
              />

            </Grid>
          </Grid>

          <Grid container paddingTop={'6px'} columns={9.8}>
            <Grid item xs={2.5} paddingTop={'3px'} className='total_calc-grid_item_text_left' >
              <p style={{
                fontSize: '15px'
              }}>
                NOTE

              </p>
            </Grid>
            <Grid item xs={3} className='total_calc-grid_item_value_left' style={{
              maxHeight: "100vh"
            }}>
              <CustomTextAreaBox
                inputRef={billNoteRef}
                resizeDirection='both'
                inputId='BillNote'
                placeholderText=''
                TextBoxValue={billNote}
                defaultValue={billNote}
                onTextBoxValueChange={handleBillNoteChange}
                inputBoxWidth={"95%"}
                inputBoxHeight='5vh'
                maxInputBoxHeight='10vh'
                nextComponentFocus={() => handlenextComponentFocus("BillNote")}
                previousComponentFocus={() => handlePreviousComponentFocus("BillNote")}
              />
            </Grid>
          </Grid>




        </Grid>

        {/* right side of the grid */}
        <Grid sx={{
          bgcolor: 'background.paper',
          borderLeft: 1,
          paddingTop: "15px",
        }} item xs={3.2} style={{ textAlign: "center", }}>


          <Grid container columns={3.2} style={{
            gridGap: '5px'
          }}>

            <Grid container columns={3.2} paddingTop={''} style={{}}>
              <Grid item xs={2} className='total_calc-grid_item_text_right' >
                <p>
                  SUB TOTAL
                </p>
              </Grid>

              <Grid item xs={1.2} className='total_calc-grid_item_value_right' >

                <CustomTextBox
                  texteditable={false}
                  inputBoxWidth={"95%"}
                  inputBoxHeight='3.5vh'
                  textType='number'
                  allowDecimal={true}
                  TextBoxValue={subtotalAmount}
                  defaultValue={subtotalAmount}

                />

              </Grid>
            </Grid>

            <Grid container columns={3.2} paddingTop={'9px'} style={{}}>
              <Grid item xs={2} className='total_calc-grid_item_text_right' >
                <p style={{
                  fontSize: '15px'
                }}>
                  ROUND OFF

                </p>
              </Grid>

              <Grid item xs={1.2} paddingBottom={'5px'} className='total_calc-grid_item_value_right' >
                <CustomTextBox
                  inputRef={roundOffRef}
                  placeholderText=''
                  inputBoxWidth={"95%"}
                  inputBoxHeight='3.5vh'
                  allownegative={true}
                  allowDecimal={true}
                  textType='number'
                  TextBoxValue={roundOffValue}
                  defaultValue={roundOffValue}
                  onTextBoxValueChange={handleRoundOffValueChange}
                  nextComponentFocus={() => handlenextComponentFocus("RoundOff")}
                  previousComponentFocus={() => handlePreviousComponentFocus("RoundOff")}

                />
              </Grid>
            </Grid>

            <Grid container columns={3.2} paddingTop={'5px'} style={{}}>
              <Grid item xs={2} paddingTop={'3px'} className='total_calc-grid_item_text_right' >
                <p style={{
                  fontSize: '15px'
                }}>
                  FREIGHT

                </p>
              </Grid>

              <Grid item xs={1.2} className='total_calc-grid_item_value_right' >
                <CustomTextBox
                  inputRef={freightChargesRef}
                  placeholderText=''
                  inputBoxWidth={"95%"}
                  inputBoxHeight='3.5vh'
                  textType='number'
                  allowDecimal={true}
                  TextBoxValue={freightCharges}
                  defaultValue={freightCharges}
                  onTextBoxValueChange={handleFreightChargesChange}
                  nextComponentFocus={() => handlenextComponentFocus("FreightCharges")}
                  previousComponentFocus={() => handlePreviousComponentFocus("FreightCharges")}

                />
              </Grid>
            </Grid>





            {/* 
HERE ALSO INCLUDE ONE MORE BOX THAT CALCULATES DISCOUNT PERCENTAGE FOR THE BILL INSTEAD OF JUST HAVING THE DIS_AMT
*/}










            <Grid container columns={3.2} paddingTop={'10px'} style={{}}>
              <Grid item xs={2} className='total_calc-grid_item_text_right' >
                <p style={{
                  fontSize: '15px'
                }}>
                  DISCOUNT

                </p>
              </Grid>

              <Grid item xs={1.2} paddingBottom={'5px'} className='total_calc-grid_item_value_right' >
                <CustomTextBox
                  inputRef={totalDiscountRef}
                  placeholderText=''
                  inputBoxWidth={"95%"}
                  inputBoxHeight='3.5vh'
                  textType='number'
                  allowDecimal={true}
                  maxValueforNumber={subtotalAmount + roundOffValue + freightCharges}
                  TextBoxValue={totalDiscount}
                  defaultValue={totalDiscount}
                  onTextBoxValueChange={handleTotalDiscountValueChange}
                  nextComponentFocus={() => handlenextComponentFocus("TotalDiscount")}
                  previousComponentFocus={() => handlePreviousComponentFocus("TotalDiscount")}

                />
              </Grid>
            </Grid>


            <Grid container columns={3.2} paddingTop={'5px'} style={{}}>
              <Grid item xs={2} className='total_calc-grid_item_text_right' >
                <p>
                  TOTAL
                </p>
              </Grid>

              <Grid item xs={1.2} className='total_calc-grid_item_value_right' >


                <CustomTextBox
                  texteditable={false}
                  inputBoxWidth={"95%"}
                  inputBoxHeight='3.5vh'
                  textType='number'
                  allownegative={true}
                  allowDecimal={true}
                  TextBoxValue={totalAmount}
                  defaultValue={totalAmount}
                />

              </Grid>
            </Grid>


            <Grid container columns={3.2} paddingTop={'7px'} style={{}}>
              <Grid item xs={2} paddingTop={'3px'} className='total_calc-grid_item_text_right' >
                <p style={{
                  fontSize: '15px'
                }}>
                  RECEIVED

                </p>
              </Grid>

              <Grid item xs={1.2} className='total_calc-grid_item_value_right' >
                <CustomTextBox
                  inputRef={receivedRef}
                  placeholderText=''
                  inputBoxWidth={"95%"}
                  inputBoxHeight='3.5vh'
                  textType='number'
                  allowDecimal={true}
                  TextBoxValue={received}
                  defaultValue={received}
                  // maxValueforNumber={totalAmount}
                  onTextBoxValueChange={handlereceivedChange}
                  nextComponentFocus={() => handlenextComponentFocus("Received")}
                  previousComponentFocus={() => handlePreviousComponentFocus("Received")}

                />
              </Grid>
            </Grid>

            <Grid container columns={3.2} paddingTop={'7px'} style={{}}>
              <Grid item xs={2} className='total_calc-grid_item_text_right' >
                <p>
                  BALANCE
                </p>
              </Grid>

              <Grid item xs={1.2} className='total_calc-grid_item_value_right' >

                <CustomTextBox
                  texteditable={false}
                  inputBoxWidth={"95%"}
                  inputBoxHeight='3.5vh'
                  textType='number'
                  allowDecimal={true}
                  allownegative={true}
                  TextBoxValue={totalAmount - received}
                  defaultValue={totalAmount - received}
                />

              </Grid>
            </Grid>







          </Grid>

        </Grid>

        {/* this is just like padding  */}

        <Grid paddingTop={'10px'} item xs={9.8} />

        <Grid sx={{
          bgcolor: 'background.paper',
          borderLeft: 1,
          paddingTop: "15px",
        }} item xs={3.2}
          style={{ textAlign: "center", }} />

      </Grid>


      {openPaymentModeDialog
        &&
        <AddPaymentModeDialogBox
          open={openPaymentModeDialog}
          dialogData={PaymentModeDetails}
          setDialogData={setPaymentModeDetails}
          onClose={handleClosePaymentDialog}
          onSubmit={handleSubmitPaymentModeDialog}
        />
      }

    </div>
  );
};

export default TotalForSalesBill;
