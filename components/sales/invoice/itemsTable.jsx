import Grid from "@mui/material/Grid";
import React, { useEffect, useState } from "react";
import { makeApiCall } from '../../utils/functions/ApiCallGateway';
import { findIndexUsingItemName, parseString, roundOffIntegers } from "../../utils/global/commonfrontendfuncs";
import AutoCompleteInputBox from "../../utils/inputs/AutoComplete/AutoCompleteInputBox.jsx";
import CustomDropDownBox from "../../utils/inputs/CustomDropDown/CustomDropDown.jsx";
import CustomTextBox from "../../utils/inputs/CustomTextBox";
import AddGSTDialogBox from '../../utils/widgets/DialogBoxes/AddGST';
import AddItemsDialogBox from '../../utils/widgets/DialogBoxes/AddItems.jsx';
import AddUnitDialogBox from '../../utils/widgets/DialogBoxes/AddUnit';

export default function ItemsTable({
  tableContainerRef,
  isSnackbarOpen,
  setIsSnackbarOpen,
  seterrormsg,

  tableData,
  setTableData,

  priceWithTax,
  setpriceWithTax,

  openItemsDialog,
  openUnitDialog,
  openGSTDialog,

  setopenItemsDialog,
  setopenUnitDialog,
  setopenGSTDialog,

  setsubtotalAmount,
  subtotalAmount,


}) {



  const [totalQuantity, settotalQuantity] = useState(0);
  const [totalDiscount, settotalDiscount] = useState(0);
  const [totalTax, settotalTax] = useState(0);

  const [totalRows, settotalRows] = useState(3);

  const [itemsList, setitemsList] = useState([]);
  const [unitList, setunitList] = useState([]);
  const [gstList, setgstList] = useState([]);
  const [HSNList, setHSNList] = useState([]);

  const [callundoredoflag, setcallundoredoflag] = useState(false);
  const [undoredostackforTable, setundoredostackforTable] = useState([tableData]);
  const [undoredostackindexforTable, setundoredostackindexforTable] = useState(0);

  const [rowNumbertoUpdateFromDialog, setrowNumbertoUpdateFromDialog] = useState(0);

  const [UnitDetails, setUnitDetails] = useState({
    UNIT_ID: "",
    UNIT_NAME: "",
    UNIT_SHORT_FORM: "",
  });

  const [GSTDetails, setGSTDetails] = useState({
    GST_ID: "",
    GST_PERCENTAGE: "",
  });

  const [ItemDetails, setItemDetails] = useState({
    ITEM_ID: "",
    ITEM_NAME: "",
    ITEM_CODE: "",
    ITEM_HSN: "",
    ITEM_GST_TYPE_ID: "",
    ITEM_BRAND: "",
    ITEM_PURCHASE_PRICE: "",
    ITEM_PURCHASE_DISCOUNT: "",
    ITEM_SALES_PRICE: "",
    ITEM_SALES_DISCOUNT: "",
    ITEM_DEFAULT_UNIT_ID: "",
    ITEM_OPENING_QTY: "",
    ITEM_DESCRIPTION: "",

  });

  function deleteRow(index) {
    const updatedData = tableData.filter(row => row.id !== index);
    setTableData(updatedData);
    setcallundoredoflag(true)
  }

  function addRow() {
    setTableData([...tableData, {
      id: totalRows,
      "ITEM_NAME": "",
      "QTY": "",
      "UNIT_NAME": "",
      "PRICE": "",
      "DIS_PERC": "",
      "DIS_AMT": "",
      "TAX_PERC": "",
      "TAX_AMT": "",
      "SUB_TOT": "",
    }]);

    settotalRows(totalRows + 1);
    setcallundoredoflag(true)
  }


  function ItemListUpdate(listValue) {
    setitemsList(listValue.sort((a, b) => {
      return parseString(a.ITEM_NAME).localeCompare(parseString(b.ITEM_NAME));
    }));
  }

  // these update functions are to sort the list 
  function UnitListUpdate(listValue) {
    setunitList(listValue.sort((a, b) => {
      return parseString(a.UNIT_NAME).localeCompare(parseString(b.UNIT_NAME));
    }));
  }

  function GstListUpdate(listValue) {
    setgstList(listValue.sort((a, b) => {
      return parseString(a.GST_PERCENTAGE).localeCompare(parseString(b.GST_PERCENTAGE));
    }));
  }

  function HSNListUpdate(listValue) {
    setHSNList(listValue.sort((a, b) => {
      return parseString(a.HSN_CODE).localeCompare(parseString(b.HSN_CODE));
    }));
  }


  function handlepreviousComponentFocus(name, rowIndex) {

    var firstInput;

    switch (name) {
      case "TaxDropDown":
        firstInput = document.getElementById("ITEMNAME_0");
        break;

      case "ItemName":
        break;

      case "QTY":
        firstInput = document.getElementById("ITEMNAME_" + rowIndex);
        break;

      case "UNIT_NAME":
        firstInput = document.getElementById("QTY_" + rowIndex);
        break;

      case "Price":
        firstInput = document.getElementById("UNIT_" + rowIndex);
        break;

      case "DiscountPercentage":
        firstInput = document.getElementById("PRICE_" + rowIndex);
        break;

      case "DiscountAmount":
        firstInput = document.getElementById("DISPERC_" + rowIndex);
        break;

      case "PriceBeforeTax":
        firstInput = document.getElementById("DISAMT_" + rowIndex);
        break;

      case "TaxPercentage":
        firstInput = document.getElementById("DISAMT_" + rowIndex);
        break;

      case "TaxAmount":
        firstInput = document.getElementById("TAXPERC_" + rowIndex);
        break;

      case "SubTotal":
        firstInput = document.getElementById("TAXPERC_" + rowIndex);
        break;

      default:
        return;
    }

    if (firstInput) {
      firstInput.focus();
    }
  }

  function handlenextComponentFocus(name, rowIndex) {

    if (rowIndex >= (tableData.length - 3)) {
      addRow();
    }

    var firstInput;

    switch (name) {
      case "TaxDropDown":
        firstInput = document.getElementById("ITEMNAME_0");
        break;

      case "ItemName":
        firstInput = document.getElementById("QTY_" + rowIndex);
        break;

      case "QTY":
        if (isNaN(parseInteger(tableData[rowIndex]["QTY"])) || parseInteger(tableData[rowIndex]["QTY"]) == 0) {
          handleItemTableValuesUpdate(1, rowIndex, "QTY")
        }
        firstInput = document.getElementById("UNIT_" + rowIndex);
        break;

      case "UNIT_NAME":
        firstInput = document.getElementById("PRICE_" + rowIndex);
        break;

      case "Price":
        firstInput = document.getElementById("DISPERC_" + rowIndex);
        break;

      case "DiscountPercentage":
        firstInput = document.getElementById("DISAMT_" + rowIndex);
        break;

      case "DiscountAmount":
        firstInput = document.getElementById("TAXPERC_" + rowIndex);
        break;

      case "TaxPercentage":
        firstInput = document.getElementById("TAXAMT_" + rowIndex);
        break;

      case "TaxAmount":
        firstInput = document.getElementById("AMOUNT_" + rowIndex);
        break;

      case "SubTotal":
        firstInput = document.getElementById("ITEMNAME_" + parseInt(rowIndex + 1));
        break;

      default:
        return;
    }

    if (firstInput) {
      firstInput.focus();
    }

  }

  function handleOpenDialogBox(whichDialog, Textvalue, rowNumber) {
    setrowNumbertoUpdateFromDialog(rowNumber)

    if (whichDialog == "Item") {
      setItemDetails(prevData => ({
        ...prevData,
        ITEM_NAME: Textvalue
      }));
      setopenItemsDialog(true)

    } else if (whichDialog == "Unit") {
      setUnitDetails(prevData => ({
        ...prevData,
        UNIT_NAME: Textvalue
      }));
      setopenUnitDialog(true)

    } else if (whichDialog == "Tax Slab") {
      setGSTDetails(prevData => ({
        ...prevData,
        GST_PERCENTAGE: Textvalue
      }));
      setopenGSTDialog(true)
    }
  }

  function parseInteger(stringvalue) {
    if (isNaN(stringvalue)) {
      return 0;
    }
    if (!stringvalue) {
      return 0;
    }
    if (parseInt(stringvalue * 100) == 0) {
      return 0;
    }
    else {
      return Math.round(parseFloat(stringvalue) * 100) / 100;
    }
  }

  function changeTotalQuantity() {
    var tempqty = 0;
    for (var i = 0; i < tableData.length; i++) {
      tempqty = parseInteger(tableData[i]["QTY"]) + tempqty;

    }
    settotalQuantity(roundOffIntegers(tempqty))
  }

  function changeTotalDiscount() {
    var tempdis = 0;
    for (var i = 0; i < tableData.length; i++) {
      tempdis = parseInteger(tableData[i]["DIS_AMT"]) + tempdis;

    }
    settotalDiscount(roundOffIntegers(tempdis))
  }

  function changeTotalTax() {
    var temptax = 0;
    for (var i = 0; i < tableData.length; i++) {
      if (tableData[i]["QTY"] == 0 || tableData[i]["PRICE"] == 0) {
        continue
      }
      temptax = parseInteger(tableData[i]["TAX_AMT"]) + temptax;

    }
    settotalTax(roundOffIntegers(temptax))
  }

  function changesubtotalAmount() {
    var tempamt = 0;
    for (var i = 0; i < tableData.length; i++) {
      tempamt = parseInteger(tableData[i]["SUB_TOT"]) + tempamt;
    }
    setsubtotalAmount(roundOffIntegers(tempamt))
  }

  function sameNameItemNameChangeID(value, rownum) {

    if (value.ITEM_ID) {
      // handleItemTableValuesUpdate(value.ITEM_ID, rownum, "ITEM_ID")
      var temptabdata = [...tableData]
      const filteredDicts = findIndexUsingItemName(itemsList, value.ITEM_ID, "ITEM_ID");
      temptabdata = updateItemDetails(temptabdata, rownum, filteredDicts)
      setTableData(temptabdata);

    }
  }


  function updateItemDetails(temptabdata, rownum, filteredDicts) {

    if (filteredDicts.length != 0) {

      temptabdata[rownum]["ITEM_ID"] = filteredDicts[0]["ITEM_ID"];

      const filteredDictsForGst = findIndexUsingItemName(gstList, filteredDicts[0]["ITEM_GST_TYPE_ID"], "GST_ID");
      const filteredDictsForUnit = findIndexUsingItemName(unitList, filteredDicts[0]["ITEM_DEFAULT_UNIT_ID"], "UNIT_ID");
      const filteredDictsForHSN = findIndexUsingItemName(HSNList, filteredDicts[0]["ITEM_HSN_ID"], "HSN_ID");

      temptabdata[rownum]["PRICE"] = filteredDicts[0]["ITEM_SALES_PRICE"];
      temptabdata[rownum]["DIS_PERC"] = filteredDicts[0]["ITEM_SALES_DISCOUNT"];

      if (filteredDictsForHSN.length != 0) {
        temptabdata[rownum]["ITEM_HSN_ID"] = filteredDictsForHSN[0]["HSN_ID"];
      } else {
        temptabdata[rownum]["ITEM_HSN_ID"] = "";
      }

      if (filteredDictsForGst.length != 0) {
        temptabdata[rownum]["GST_ID"] = filteredDictsForGst[0]["GST_ID"];
        temptabdata[rownum]["TAX_PERC"] = filteredDictsForGst[0]["GST_PERCENTAGE"];
      } else {
        temptabdata[rownum]["GST_ID"] = "";
        temptabdata[rownum]["TAX_PERC"] = "";
      }

      if (filteredDictsForUnit.length != 0) {
        temptabdata[rownum]["UNIT_ID"] = filteredDictsForUnit[0]["UNIT_ID"];
        temptabdata[rownum]["UNIT_NAME"] = filteredDictsForUnit[0]["UNIT_SHORT_FORM"];
      } else {
        temptabdata[rownum]["UNIT_ID"] = "";
      }

      if (temptabdata[rownum]["QTY"] != 0) {
        temptabdata[rownum]["DIS_AMT"] = roundOffIntegers((parseInteger(temptabdata[rownum]["QTY"]) * parseInteger(temptabdata[rownum]["PRICE"])) * parseInteger(temptabdata[rownum]["DIS_PERC"]) / 100);
        temptabdata[rownum]["TAX_AMT"] = roundOffIntegers(((parseInteger(temptabdata[rownum]["QTY"]) * parseInteger(temptabdata[rownum]["PRICE"])) - parseInteger(temptabdata[rownum]["DIS_AMT"])) * parseInteger(temptabdata[rownum]["TAX_PERC"]) / 100);
      }

    } else {
      // for any new value which is not found in the itemslist everything except qty will be reset
      temptabdata[rownum]["UNIT_NAME"] = "";
      temptabdata[rownum]["PRICE"] = "";
      temptabdata[rownum]["DIS_PERC"] = "";
      temptabdata[rownum]["TAX_PERC"] = "";
      temptabdata[rownum]["DIS_AMT"] = "";
      temptabdata[rownum]["TAX_AMT"] = "";

      temptabdata[rownum]["ITEM_ID"] = "";
      temptabdata[rownum]["GST_ID"] = "";
      temptabdata[rownum]["UNIT_ID"] = "";
    }
    return temptabdata
  }

  function handleItemTableValuesUpdate(value, rownum, colname) {
    var temptabdata = [...tableData];
    temptabdata[rownum][colname] = value;

    if (colname == "UNIT_NAME") {
      const filteredDictsForUnit = findIndexUsingItemName(unitList, value, ["UNIT_NAME", "UNIT_SHORT_FORM"]);

      if (filteredDictsForUnit.length != 0) {
        temptabdata[rownum]["UNIT_ID"] = filteredDictsForUnit[0]["UNIT_ID"]

      }
      else {
        temptabdata[rownum]["UNIT_ID"] = "";

      }
    }
    else if (!priceWithTax) { // price without tax
      if (colname == "ITEM_NAME") {
        // item changed

        const filteredDicts = findIndexUsingItemName(itemsList, value, "ITEM_NAME");
        if (filteredDicts.length <= 1) {
          temptabdata = updateItemDetails(temptabdata, rownum, filteredDicts)

        } else {
          if (!temptabdata[rownum]["ITEM_ID"]) {
            temptabdata = updateItemDetails(temptabdata, rownum, filteredDicts)
          }
        }
        temptabdata[rownum]["SUB_TOT"] = roundOffIntegers((parseInteger(temptabdata[rownum]["QTY"]) * parseInteger(temptabdata[rownum]["PRICE"])) - parseInteger(temptabdata[rownum]["DIS_AMT"]) + parseInteger(temptabdata[rownum]["TAX_AMT"]));

      }
      else if (colname == "SUB_TOT") {
        // total amount changed

        if (parseInteger(temptabdata[rownum]["QTY"]) == 0) {
          temptabdata[rownum]["PRICE"] = 0
          temptabdata[rownum]["DIS_AMT"] = 0
          temptabdata[rownum]["TAX_AMT"] = 0

        } else {
          temptabdata[rownum]["PRICE"] =
            roundOffIntegers(((temptabdata[rownum]["SUB_TOT"] / (1 + (temptabdata[rownum]["TAX_PERC"] / 100))))
              /
              (1 - (temptabdata[rownum]["DIS_PERC"] / 100)) / temptabdata[rownum]["QTY"]);
          temptabdata[rownum]["DIS_AMT"] = roundOffIntegers((parseInteger(temptabdata[rownum]["QTY"]) * parseInteger(temptabdata[rownum]["PRICE"])) * parseInteger(temptabdata[rownum]["DIS_PERC"]) / 100);
          temptabdata[rownum]["TAX_AMT"] = roundOffIntegers(((parseInteger(temptabdata[rownum]["QTY"]) * parseInteger(temptabdata[rownum]["PRICE"])) - parseInteger(temptabdata[rownum]["DIS_AMT"])) * parseInteger(temptabdata[rownum]["TAX_PERC"]) / 100);

        }
      }
      else {
        if (colname == "QTY") {
          //qty changed
          temptabdata[rownum]["DIS_AMT"] = roundOffIntegers((parseInteger(temptabdata[rownum]["QTY"]) * parseInteger(temptabdata[rownum]["PRICE"])) * parseInteger(temptabdata[rownum]["DIS_PERC"]) / 100);
          temptabdata[rownum]["TAX_AMT"] = roundOffIntegers(((parseInteger(temptabdata[rownum]["QTY"]) * parseInteger(temptabdata[rownum]["PRICE"])) - parseInteger(temptabdata[rownum]["DIS_AMT"])) * parseInteger(temptabdata[rownum]["TAX_PERC"]) / 100);


        }
        else if (colname == "PRICE") {
          //price changed
          temptabdata[rownum]["DIS_AMT"] = roundOffIntegers((parseInteger(temptabdata[rownum]["QTY"]) * parseInteger(temptabdata[rownum]["PRICE"])) * parseInteger(temptabdata[rownum]["DIS_PERC"]) / 100);
          temptabdata[rownum]["TAX_AMT"] = roundOffIntegers(((parseInteger(temptabdata[rownum]["QTY"]) * parseInteger(temptabdata[rownum]["PRICE"])) - parseInteger(temptabdata[rownum]["DIS_AMT"])) * parseInteger(temptabdata[rownum]["TAX_PERC"]) / 100);

        }
        else if (colname == "DIS_PERC") {
          //dis % changed
          if (value == 0) {
            temptabdata[rownum]["DIS_AMT"] = "";
          } else {
            temptabdata[rownum]["DIS_AMT"] = roundOffIntegers((parseInteger(temptabdata[rownum]["QTY"]) * parseInteger(temptabdata[rownum]["PRICE"])) * parseInteger(temptabdata[rownum]["DIS_PERC"]) / 100);
          }
          temptabdata[rownum]["TAX_AMT"] = roundOffIntegers(((parseInteger(temptabdata[rownum]["QTY"]) * parseInteger(temptabdata[rownum]["PRICE"])) - parseInteger(temptabdata[rownum]["DIS_AMT"])) * parseInteger(temptabdata[rownum]["TAX_PERC"]) / 100);
        }
        else if (colname == "DIS_AMT") {
          //dis amount changed
          if (temptabdata[rownum]["QTY"] == 0 || temptabdata[rownum]["PRICE"] == 0) {

            return
          }
          if (value == 0) {
            temptabdata[rownum]["DIS_PERC"] = "";
          } else {
            temptabdata[rownum]["DIS_PERC"] = roundOffIntegers(parseInteger(temptabdata[rownum]["DIS_AMT"]) * 100 / ((parseInteger(temptabdata[rownum]["QTY"]) * parseInteger(temptabdata[rownum]["PRICE"]))));
          }
          temptabdata[rownum]["TAX_AMT"] = roundOffIntegers(((parseInteger(temptabdata[rownum]["QTY"]) * parseInteger(temptabdata[rownum]["PRICE"])) - parseInteger(temptabdata[rownum]["DIS_AMT"])) * parseInteger(temptabdata[rownum]["TAX_PERC"]) / 100);

        }
        else if (colname == "TAX_PERC") {
          //tax % changed
          const filteredDictsForGst = findIndexUsingItemName(gstList, value, "GST_PERCENTAGE");

          if (filteredDictsForGst.length != 0) {
            temptabdata[rownum]["GST_ID"] = filteredDictsForGst[0]["GST_ID"]

          }
          else {
            temptabdata[rownum]["GST_ID"] = "";
            // temptabdata[rownum]["TAX_PERC"] = "";

          }
          if (value == 0) {
            temptabdata[rownum]["TAX_AMT"] = "";
          } else {
            temptabdata[rownum]["TAX_AMT"] = roundOffIntegers(((parseInteger(temptabdata[rownum]["QTY"]) * parseInteger(temptabdata[rownum]["PRICE"])) - parseInteger(temptabdata[rownum]["DIS_AMT"])) * parseInteger(temptabdata[rownum]["TAX_PERC"]) / 100);
          }
        }
        else if (colname == "TAX_AMT") {
          //tax amount changed
          if (temptabdata[rownum]["QTY"] == 0 || temptabdata[rownum]["PRICE"] == 0) {
            return
          }

          temptabdata[rownum]["TAX_PERC"] = roundOffIntegers(parseInteger(temptabdata[rownum]["TAX_AMT"]) * 100 / (((parseInteger(temptabdata[rownum]["QTY"]) * parseInteger(temptabdata[rownum]["PRICE"]))) - parseInteger(temptabdata[rownum]["DIS_AMT"])));

        }
        temptabdata[rownum]["SUB_TOT"] = roundOffIntegers((parseInteger(temptabdata[rownum]["QTY"]) * parseInteger(temptabdata[rownum]["PRICE"])) - parseInteger(temptabdata[rownum]["DIS_AMT"]) + parseInteger(temptabdata[rownum]["TAX_AMT"]));

      }

    }
    else { //price incl. tax
      if (colname == "ITEM_NAME") {
        // item name changed
        const filteredDicts = findIndexUsingItemName(itemsList, value, "ITEM_NAME");
        if (filteredDicts.length <= 1) {
          temptabdata = updateItemDetails(temptabdata, rownum, filteredDicts)

        } else {
          if (!temptabdata[rownum]["ITEM_ID"]) {
            temptabdata = updateItemDetails(temptabdata, rownum, filteredDicts)
          }
        }
        temptabdata[rownum]["SUB_TOT"] = roundOffIntegers((parseInteger(temptabdata[rownum]["QTY"]) * parseInteger(temptabdata[rownum]["PRICE"])) - parseInteger(temptabdata[rownum]["DIS_AMT"]));

      }
      else if (colname == "SUB_TOT") {
        // total amount changed

        if (parseInteger(temptabdata[rownum]["QTY"]) == 0) {
          temptabdata[rownum]["PRICE"] = 0
          temptabdata[rownum]["DIS_AMT"] = 0
          temptabdata[rownum]["TAX_AMT"] = 0

        } else {

          temptabdata[rownum]["PRICE"] =
            roundOffIntegers(((temptabdata[rownum]["SUB_TOT"]))
              /
              (1 - (temptabdata[rownum]["DIS_PERC"] / 100)) / temptabdata[rownum]["QTY"]);
          temptabdata[rownum]["DIS_AMT"] = roundOffIntegers((parseInteger(temptabdata[rownum]["QTY"]) * parseInteger(temptabdata[rownum]["PRICE"])) * parseInteger(temptabdata[rownum]["DIS_PERC"]) / 100);
          temptabdata[rownum]["TAX_AMT"] = roundOffIntegers(((parseInteger(temptabdata[rownum]["QTY"]) * parseInteger(temptabdata[rownum]["PRICE"])) - parseInteger(temptabdata[rownum]["DIS_AMT"])) * parseInteger(temptabdata[rownum]["TAX_PERC"]) / 100);

        }
      }
      else {
        if (colname == "QTY") {
          //qty changed
          temptabdata[rownum]["DIS_AMT"] = roundOffIntegers((parseInteger(temptabdata[rownum]["QTY"]) * parseInteger(temptabdata[rownum]["PRICE"])) * parseInteger(temptabdata[rownum]["DIS_PERC"]) / 100);
          temptabdata[rownum]["TAX_AMT"] = roundOffIntegers(((parseInteger(temptabdata[rownum]["QTY"]) * parseInteger(temptabdata[rownum]["PRICE"])) - parseInteger(temptabdata[rownum]["DIS_AMT"])) * parseInteger(temptabdata[rownum]["TAX_PERC"]) / 100);
          temptabdata[rownum]["TAX_AMT"] = roundOffIntegers(temptabdata[rownum]["TAX_AMT"] / ((parseInteger(temptabdata[rownum]["TAX_PERC"]) + (100)) / 100));

        }
        else if (colname == "PRICE") {
          //price changed
          temptabdata[rownum]["DIS_AMT"] = roundOffIntegers((parseInteger(temptabdata[rownum]["QTY"]) * parseInteger(temptabdata[rownum]["PRICE"])) * parseInteger(temptabdata[rownum]["DIS_PERC"]) / 100);
          temptabdata[rownum]["TAX_AMT"] = roundOffIntegers(((parseInteger(temptabdata[rownum]["QTY"]) * parseInteger(temptabdata[rownum]["PRICE"])) - parseInteger(temptabdata[rownum]["DIS_AMT"])) * parseInteger(temptabdata[rownum]["TAX_PERC"]) / 100);
          temptabdata[rownum]["TAX_AMT"] = roundOffIntegers(temptabdata[rownum]["TAX_AMT"] / ((parseInteger(temptabdata[rownum]["TAX_PERC"]) + (100)) / 100));

        }
        else if (colname == "DIS_PERC") {
          //dis % changed
          temptabdata[rownum]["DIS_AMT"] = roundOffIntegers((parseInteger(temptabdata[rownum]["QTY"]) * parseInteger(temptabdata[rownum]["PRICE"])) * parseInteger(temptabdata[rownum]["DIS_PERC"]) / 100);
          temptabdata[rownum]["TAX_AMT"] = roundOffIntegers(((parseInteger(temptabdata[rownum]["QTY"]) * parseInteger(temptabdata[rownum]["PRICE"])) - parseInteger(temptabdata[rownum]["DIS_AMT"])) * parseInteger(temptabdata[rownum]["TAX_PERC"]) / 100);
          temptabdata[rownum]["TAX_AMT"] = roundOffIntegers(temptabdata[rownum]["TAX_AMT"] / ((parseInteger(temptabdata[rownum]["TAX_PERC"]) + (100)) / 100));
        }
        else if (colname == "DIS_AMT") {
          //dis amount changed
          if (temptabdata[rownum]["QTY"] == 0 || temptabdata[rownum]["PRICE"] == 0) {
            return
          }
          temptabdata[rownum]["DIS_PERC"] = roundOffIntegers(parseInteger(temptabdata[rownum]["DIS_AMT"]) * 100 / ((parseInteger(temptabdata[rownum]["QTY"]) * parseInteger(temptabdata[rownum]["PRICE"]))));
          temptabdata[rownum]["TAX_AMT"] = roundOffIntegers(((parseInteger(temptabdata[rownum]["QTY"]) * parseInteger(temptabdata[rownum]["PRICE"])) - parseInteger(temptabdata[rownum]["DIS_AMT"])) * parseInteger(temptabdata[rownum]["TAX_PERC"]) / 100);
          temptabdata[rownum]["TAX_AMT"] = roundOffIntegers(temptabdata[rownum]["TAX_AMT"] / ((parseInteger(temptabdata[rownum]["TAX_PERC"]) + (100)) / 100));


        }
        else if (colname == "TAX_PERC") {
          //tax % changed
          const filteredDictsForGst = findIndexUsingItemName(gstList, value, "GST_PERCENTAGE");

          if (filteredDictsForGst.length != 0) {
            temptabdata[rownum]["GST_ID"] = filteredDictsForGst[0]["GST_ID"]

          }
          else {
            temptabdata[rownum]["GST_ID"] = "";
            // temptabdata[rownum]["TAX_PERC"] = "";

          }

          temptabdata[rownum]["TAX_AMT"] = roundOffIntegers(((parseInteger(temptabdata[rownum]["QTY"]) * parseInteger(temptabdata[rownum]["PRICE"])) - parseInteger(temptabdata[rownum]["DIS_AMT"])) * parseInteger(temptabdata[rownum]["TAX_PERC"]) / 100);
          temptabdata[rownum]["TAX_AMT"] = roundOffIntegers(temptabdata[rownum]["TAX_AMT"] / ((parseInteger(temptabdata[rownum]["TAX_PERC"]) + (100)) / 100));
        }
        else if (colname == "TAX_AMT") {
          //tax amount changed
          if (temptabdata[rownum]["QTY"] == 0 || temptabdata[rownum]["PRICE"] == 0) {
            return
          }
          temptabdata[rownum]["TAX_PERC"] = roundOffIntegers(parseInteger(temptabdata[rownum]["TAX_AMT"]) * 100 / (((parseInteger(temptabdata[rownum]["QTY"]) * parseInteger(temptabdata[rownum]["PRICE"]))) - parseInteger(temptabdata[rownum]["DIS_AMT"])));
        }
        temptabdata[rownum]["SUB_TOT"] = roundOffIntegers((parseInteger(temptabdata[rownum]["QTY"]) * parseInteger(temptabdata[rownum]["PRICE"])) - parseInteger(temptabdata[rownum]["DIS_AMT"]));

      }

    }

    setTableData(temptabdata);

  }

  function handlepricewithtaxchange(value) {

    if (value == "Including Tax") {
      setpriceWithTax(true);
    } else {
      setpriceWithTax(false);
    }
  };

  const dropdownOptions = [
    "Including Tax",
    "Plus Tax",
  ];
  function updatePriceWithorWithoutTax() {
    var temptabdata = [...tableData];
    if (priceWithTax) {
      for (var rownum = 0; rownum < temptabdata.length - 1; rownum++) {
        if (temptabdata[rownum]["QTY"] == 0 || temptabdata[rownum]["PRICE"] == 0) {
          continue
        }
        temptabdata[rownum]["TAX_AMT"] = roundOffIntegers(((parseInteger(temptabdata[rownum]["QTY"]) * parseInteger(temptabdata[rownum]["PRICE"])) - parseInteger(temptabdata[rownum]["DIS_AMT"])) * parseInteger(temptabdata[rownum]["TAX_PERC"]) / (100));
        temptabdata[rownum]["TAX_AMT"] = roundOffIntegers(temptabdata[rownum]["TAX_AMT"] / ((parseInteger(temptabdata[rownum]["TAX_PERC"]) + (100)) / 100));
        temptabdata[rownum]["SUB_TOT"] = roundOffIntegers((parseInteger(temptabdata[rownum]["QTY"]) * parseInteger(temptabdata[rownum]["PRICE"])) - parseInteger(temptabdata[rownum]["DIS_AMT"]));
      }
    } else { // what to do if item name changes and some of the details are already mentioned 
      for (var rownum = 0; rownum < temptabdata.length - 1; rownum++) {
        if (temptabdata[rownum]["QTY"] == 0 || temptabdata[rownum]["PRICE"] == 0) {
          continue
        }
        temptabdata[rownum]["TAX_AMT"] = roundOffIntegers(((parseInteger(temptabdata[rownum]["QTY"]) * parseInteger(temptabdata[rownum]["PRICE"])) - parseInteger(temptabdata[rownum]["DIS_AMT"])) * parseInteger(temptabdata[rownum]["TAX_PERC"]) / (100));
        temptabdata[rownum]["SUB_TOT"] = roundOffIntegers((parseInteger(temptabdata[rownum]["QTY"]) * parseInteger(temptabdata[rownum]["PRICE"])) - parseInteger(temptabdata[rownum]["DIS_AMT"]) + parseInteger(temptabdata[rownum]["TAX_AMT"]));

      }
    }
    setTableData(temptabdata);

  }

  function handleCloseAddItemsDialog() {
    setopenItemsDialog(false);

    changeFocusToColumn("ITEM")

  }

  function handlesetItemDetails(new_dictionary, item_id) {
    // adding the new item in the list and in submit fn update the table
    new_dictionary.ITEM_ID = item_id
    setitemsList(prevList => {
      const updatedList = [...prevList, new_dictionary];

      const sortedList = updatedList.sort((a, b) => {
        return parseString(a.ITEM_NAME).localeCompare(parseString(b.ITEM_NAME));
      });

      return sortedList;
    });

    var temptabdata = [...tableData]

    temptabdata[rowNumbertoUpdateFromDialog]["ITEM_NAME"] = new_dictionary["ITEM_NAME"];
    temptabdata[rowNumbertoUpdateFromDialog]["ITEM_ID"] = new_dictionary["ITEM_ID"];

    temptabdata[rowNumbertoUpdateFromDialog]["PRICE"] = new_dictionary["ITEM_SALES_PRICE"];
    temptabdata[rowNumbertoUpdateFromDialog]["DIS_PERC"] = new_dictionary["ITEM_SALES_DISCOUNT"];

    temptabdata[rowNumbertoUpdateFromDialog]["ITEM_HSN_ID"] = new_dictionary["ITEM_HSN_ID"];
    temptabdata[rowNumbertoUpdateFromDialog]["ITEM_HSN"] = new_dictionary["ITEM_HSN"];

    temptabdata[rowNumbertoUpdateFromDialog]["GST_ID"] = new_dictionary["ITEM_GST_TYPE_ID"];
    temptabdata[rowNumbertoUpdateFromDialog]["TAX_PERC"] = new_dictionary["ITEM_GST_TYPE"];

    temptabdata[rowNumbertoUpdateFromDialog]["UNIT_ID"] = new_dictionary["ITEM_DEFAULT_UNIT_ID"];
    temptabdata[rowNumbertoUpdateFromDialog]["UNIT_NAME"] = new_dictionary["ITEM_DEFAULT_UNIT"];

    if (temptabdata[rowNumbertoUpdateFromDialog]["QTY"] != 0) {
      temptabdata[rowNumbertoUpdateFromDialog]["DIS_AMT"] = roundOffIntegers((parseInteger(temptabdata[rowNumbertoUpdateFromDialog]["QTY"]) * parseInteger(temptabdata[rowNumbertoUpdateFromDialog]["PRICE"])) * parseInteger(temptabdata[rowNumbertoUpdateFromDialog]["DIS_PERC"]) / 100);
      temptabdata[rowNumbertoUpdateFromDialog]["TAX_AMT"] = roundOffIntegers(((parseInteger(temptabdata[rowNumbertoUpdateFromDialog]["QTY"]) * parseInteger(temptabdata[rowNumbertoUpdateFromDialog]["PRICE"])) - parseInteger(temptabdata[rowNumbertoUpdateFromDialog]["DIS_AMT"])) * parseInteger(temptabdata[rowNumbertoUpdateFromDialog]["TAX_PERC"]) / 100);
    }
  }

  function handlesetUnitDetails(new_dictionary, unit_id) {
    new_dictionary.UNIT_ID = unit_id

    setunitList(prevList => {
      const updatedList = [...prevList, new_dictionary];

      const sortedList = updatedList.sort((a, b) => {
        return parseString(a.UNIT_NAME).localeCompare(parseString(b.UNIT_NAME));
      });

      return sortedList;
    });

    var temptabdata = [...tableData];
    temptabdata[rowNumbertoUpdateFromDialog]["UNIT_NAME"] = new_dictionary.UNIT_SHORT_FORM;
    temptabdata[rowNumbertoUpdateFromDialog]["UNIT_ID"] = unit_id;

    setTableData(temptabdata);
  }

  function handlesetGSTDetails(new_dictionary, gst_id) {
    new_dictionary.GST_ID = gst_id;

    setgstList(prevList => {
      const updatedList = [...prevList, new_dictionary];

      const sortedList = updatedList.sort((a, b) => {
        return parseString(a.GST_PERCENTAGE).localeCompare(parseString(b.GST_PERCENTAGE));
      });

      return sortedList;
    });

    setTimeout(() => {
      handleItemTableValuesUpdate(new_dictionary.GST_PERCENTAGE, rowNumbertoUpdateFromDialog, "TAX_PERC")

    }, 350);
    // handleItemTableValuesUpdate(new_dictionary.GST_ID, rowNumbertoUpdateFromDialog, "GST_ID")

  }

  function changeFocusToColumn(colname) {
    const firstInput = tableContainerRef.current.querySelectorAll("input");
    var cellToHighlight;
    switch (colname) {
      case "ITEM":
        cellToHighlight = (rowNumbertoUpdateFromDialog * 10) + 1;
        break;
      case "UNIT_NAME":
        cellToHighlight = (rowNumbertoUpdateFromDialog * 10) + 2;
        break;
      case "TAX":
        cellToHighlight = (rowNumbertoUpdateFromDialog * 10) + 7;
        break;
      default:
        cellToHighlight = (rowNumbertoUpdateFromDialog * 10) + 1;
        break;
    }
    setTimeout(() => {
      firstInput[cellToHighlight].focus()

    }, 20);
  }

  function handleSubmitAddItemsDialog(a, b, c) {
    setopenItemsDialog(false)
    changeFocusToColumn("ITEM")

  }

  function handleSubmitAddUnitDialog(new_dictionary, unit_short_form, unit_id) {
    new_dictionary.UNIT_ID = unit_id;
    setopenUnitDialog(false);
    changeFocusToColumn("UNIT_NAME")
    setunitList(prevList => {
      const updatedList = [...prevList, new_dictionary];

      const sortedList = updatedList.sort((a, b) => {
        return parseString(a.UNIT_NAME).localeCompare(parseString(b.UNIT_NAME));
      });

      return sortedList;
    });
  }

  function handleCloseAddUnitDialog() {
    setopenUnitDialog(false);
    changeFocusToColumn("UNIT_NAME")

  }

  function handleSubmitAddGSTDialog(new_dictionary, unit_short_form, gst_id) {
    new_dictionary.GST_ID = gst_id;
    setopenGSTDialog(false);
    changeFocusToColumn("TAX")
    setgstList(prevList => {
      const updatedList = [...prevList, new_dictionary];

      const sortedList = updatedList.sort((a, b) => {
        return parseString(a.GST_PERCENTAGE).localeCompare(parseString(b.GST_PERCENTAGE));
      });

      return sortedList;
    });
  }

  function handleCloseAddGSTDialog() {
    setopenGSTDialog(false);
    changeFocusToColumn("TAX")

  }

  const handleUndoItemsTable = () => {
    if (undoredostackindexforTable > 0) {

      setundoredostackindexforTable(undoredostackindexforTable - 1);
      setTableData(undoredostackforTable[undoredostackindexforTable - 1]);
    }
  }

  const handleRedoItemsTable = () => {
    if (undoredostackindexforTable < undoredostackforTable.length - 1) {

      setundoredostackindexforTable(undoredostackindexforTable + 1);
      setTableData(undoredostackforTable[undoredostackindexforTable + 1]);
    }
  }


  useEffect(() => {
    // to prevent scrolling when a dialog is opened
    if (openGSTDialog || openUnitDialog || openItemsDialog) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [openGSTDialog, openUnitDialog, openItemsDialog])

  useEffect(() => {
    changeTotalQuantity();
    changeTotalDiscount();
    changeTotalTax();
    changesubtotalAmount();
  }, [tableData])

  useEffect(() => {
    if (callundoredoflag) {
      setcallundoredoflag(false)
      if (undoredostackindexforTable === 0) {
        const updatedStack = undoredostackforTable.slice(0, undoredostackindexforTable + 1);
        updatedStack.push(tableData);
        setundoredostackforTable(updatedStack);
      } else {
        const updatedStack = undoredostackforTable.slice(0, undoredostackindexforTable + 1);
        updatedStack.push(tableData);
        setundoredostackforTable(updatedStack);
      }

      setundoredostackindexforTable(undoredostackindexforTable + 1);

    }

  }, [callundoredoflag, tableData])

  useEffect(() => {
    updatePriceWithorWithoutTax()
  }, [priceWithTax])

  useEffect(() => {
    async function getValuesFromSearchTable(TableName, TableValues) {
      const response = await makeApiCall('/api/utils/autocomplete', {
        SearchTable: TableName,
        SearchValues: TableValues,
      });
      return response.autoCompleteResult;
    }

    async function fetchData() {
      const gstList = await getValuesFromSearchTable("GST_TYPE", []);
      const unitList = await getValuesFromSearchTable("UNIT", []);
      const HSNList = await getValuesFromSearchTable("HSN_DETAILS", []);

      GstListUpdate(gstList);
      UnitListUpdate(unitList);
      HSNListUpdate(HSNList);
    }

    fetchData();

  }, []);

  return (
    <div
      id={"tableContainer"}
      ref={tableContainerRef}
      className="custom-table-container no_select_text"
      style={{ marginLeft: "1vw", marginRight: "1vw" }}>
        
      <Grid container columns={13} >

        <Grid sx={{
          bgcolor: 'background.paper',
          border: 1,
          paddingTop: "15px",

        }}
          item xs={0.5} style={{ textAlign: "center" }}>
          #

          <button
            disabled={undoredostackindexforTable > 0 ? false : true}
            style={{
              fontSize: '70%',
              width: '4vw',
              height: '2.5vh',
              backgroundColor: 'white',
              borderRadius: '10px',
              borderWidth: '1px',
              borderStyle: 'solid',
              cursor: undoredostackindexforTable > 0 ? 'pointer' : '',
              maxWidth: '100%'

            }}
            onClick={handleUndoItemsTable}>
            Undo
          </button>
          <div style={{ height: '2px' }}></div>
          <button
            disabled={undoredostackindexforTable < undoredostackforTable.length - 1 ? false : true}
            style={{
              fontSize: '70%',
              width: '4vw',
              height: '2.5vh',
              backgroundColor: 'white',
              borderRadius: '10px',
              borderWidth: '1px',
              borderStyle: 'solid',
              cursor: undoredostackindexforTable < undoredostackforTable.length - 1 ? 'pointer' : '',
              maxWidth: '100%'

            }}
            onClick={handleRedoItemsTable}>
            Redo
          </button>
        </Grid>
        <Grid sx={{
          bgcolor: 'background.paper',
          borderRight: 1,
          borderTop: 1,
          paddingTop: "15px",
          borderBottom: 1,
        }} item xs={3} style={{ textAlign: "center" }}>
          ITEM
        </Grid>
        <Grid sx={{
          bgcolor: 'background.paper',
          borderRight: 1,
          borderTop: 1,
          paddingTop: "15px",
          borderBottom: 1,
        }} item xs={1} style={{ textAlign: "center" }}>
          QTY
        </Grid>
        <Grid sx={{
          bgcolor: 'background.paper',
          borderRight: 1,
          borderTop: 1,
          paddingTop: "15px",
          borderBottom: 1,
        }} item xs={.9} style={{ textAlign: "center" }}>
          UNIT
        </Grid>
        <Grid sx={{

          bgcolor: 'background.paper',
          borderRight: 1,
          borderTop: 1,
          borderBottom: 1,
        }} item xs={1.2} style={{ textAlign: "center" }}>
          <div>
            <p style={{ marginBottom: "1px" }}>PRICE</p>
            {/* <p style={{ fontSize: "10px", marginBottom: "1px" }}> */}
            {/* <select tabIndex={-1} value={priceWithTax} onChange={handlepricewithtaxchange} style={{ maxWidth: '100%', fontSize: '12px' }}>
                <option value="true">With Tax</option>
                <option value="false">Without Tax</option>
              </select> */}

            <div style={{
              display: "flex",
              justifyContent: "center"
            }}>
              <CustomDropDownBox
                valuesFetched={dropdownOptions} // Pass the options array
                placeholderText="Choose a value" // Placeholder text
                onTextBoxValueChange={handlepricewithtaxchange} // Callback function to handle the selection
                defaultValue={"Including Tax"} // Set the initial selected value
                nextComponentFocus={() => handlenextComponentFocus("TaxDropDown")}

              />
            </div>
            {/* </p> */}
          </div>
        </Grid>
        <Grid sx={{
          bgcolor: 'background.paper',
          borderRight: 1,
          borderTop: 1,
          borderBottom: 1,
        }} item xs={2} style={{ textAlign: "center" }}>
          <div>
            <p style={{ marginBottom: "1px", marginTop: "15px" }}>DISCOUNT</p>
            <div
              style={{
                flexDirection: "row",
                display: "flex",
                fontSize: "12px",
              }}
            >
              <p style={{ paddingLeft: "2.5vw", paddingRight: "5.5vw" }}>%</p>
              <p>Amount</p>
            </div>
          </div>
        </Grid>
        <Grid sx={{
          bgcolor: 'background.paper',
          borderRight: 1,
          borderTop: 1,
          paddingTop: "15px",
          borderBottom: 1,
          fontSize: '14px'
        }} item xs={1.2} style={{ textAlign: "center" }}>
          PRICE <br></br>Before Tax
        </Grid>
        <Grid sx={{
          bgcolor: 'background.paper',
          borderRight: 1,
          borderTop: 1,
          borderBottom: 1,
        }} item xs={2} style={{ textAlign: "center" }}>
          <div>
            <p style={{ marginBottom: "1px", marginTop: "15px" }}>TAX</p>
            <div
              style={{
                flexDirection: "row",
                display: "flex",
                fontSize: "12px",
              }}
            >
              <p style={{ paddingLeft: "2.5vw", paddingRight: "5.5vw" }}>%</p>
              <p>Amount</p>
            </div>
          </div>
        </Grid>
        <Grid sx={{
          bgcolor: 'background.paper',
          borderRight: 1,
          borderTop: 1,
          paddingTop: "15px",
          borderBottom: 1,
        }} item xs={1.2} style={{ textAlign: "center" }}>
          AMOUNT
        </Grid>

        {tableData.map((rowData, rowIndex) => (
          <div key={rowData.id} style={{
            display: 'flex',
            flexDirection: 'row'
          }}>
            <React.Fragment key={rowData.id}>


              <Grid
                sx={{
                  bgcolor: 'background.paper',
                  display: rowIndex === tableData.length - 1 ? 'none' : 'flex',
                  borderRight: 1,
                  borderLeft: 1,
                  borderBottom: 1,
                }} item xs={.5} style={{ textAlign: "center" }}>

                <div key={rowData.id} className="customtable-hover_container" style={{
                  marginTop: '1vh',
                  width: "100%"
                }}>

                  <span className="number"
                    style={{
                      width: "100%"

                    }}>{rowIndex + 1}</span>

                  <span
                    className="itemstable_icon"
                    title="Delete"
                    role="img"
                    onClick={() => {
                      deleteRow(rowData.id);
                    }}
                  >
                    🗑️
                  </span>

                </div>

              </Grid>
              <Grid sx={{
                bgcolor: 'background.paper',
                display: rowIndex === tableData.length - 1 ? 'none' : 'flex',
                borderRight: 1,
                borderBottom: 1,
                paddingRight: '7px'

              }} item xs={3}>
                <AutoCompleteInputBox
                  inputId={"ITEMNAME_" + rowIndex}
                  placeholderText=""
                  textType="text"
                  addWhatText={"Item"}
                  onTextBoxValueChange={handleItemTableValuesUpdate}
                  TextBoxValue={rowData["ITEM_NAME"]}
                  defaultValue={rowData["ITEM_NAME"]}
                  rowValuesinTable={[tableData[rowIndex], rowIndex, "ITEM_NAME"]}
                  SearchTable={"ITEMS"}
                  SearchValues={[]}
                  keytoChooseinList={"ITEM_NAME"}
                  keystoSearchinList={["ITEM_NAME", "ITEM_CODE", "ITEM_BRAND"]}
                  valuesFetched={itemsList}
                  showClearButton={false}
                  valuesUpdate={ItemListUpdate}
                  setsendIDToConfirmChangeForSameName={sameNameItemNameChangeID}
                  inputBoxWidth={"100%"}
                  listDivWidth={"30vw"}
                  previousComponentFocus={() => handlepreviousComponentFocus("ItemName", rowIndex)}
                  nextComponentFocus={() => handlenextComponentFocus("ItemName", rowIndex)}
                  openDialogBox={handleOpenDialogBox}
                  isSnackbarOpen={isSnackbarOpen}
                  setIsSnackbarOpen={setIsSnackbarOpen}
                  seterrormsg={seterrormsg}
                />
              </Grid>
              <Grid sx={{
                bgcolor: 'background.paper',
                display: rowIndex === tableData.length - 1 ? 'none' : 'flex',
                borderRight: 1,
                borderBottom: 1,
                paddingRight: '4px'
              }} item xs={1}>
                <CustomTextBox
                  inputId={"QTY_" + rowIndex}
                  placeholderText=""
                  textType="number"
                  onTextBoxValueChange={handleItemTableValuesUpdate}
                  TextBoxValue={rowData["QTY"]}
                  defaultValue={rowData["QTY"]}
                  rowValuesinTable={[tableData[rowIndex], rowIndex, "QTY"]}
                  allowDecimal={true}
                  inputBoxWidth={"100%"}
                  previousComponentFocus={() => handlepreviousComponentFocus("QTY", rowIndex)}
                  nextComponentFocus={() => handlenextComponentFocus("QTY", rowIndex)}
                  isSnackbarOpen={isSnackbarOpen}
                  setIsSnackbarOpen={setIsSnackbarOpen}
                  seterrormsg={seterrormsg} />
              </Grid>
              <Grid sx={{
                bgcolor: 'background.paper',
                display: rowIndex === tableData.length - 1 ? 'none' : 'flex',
                borderRight: 1,
                borderBottom: 1,
                paddingRight: '7px'
              }} item xs={.9}>
                <AutoCompleteInputBox
                  inputId={"UNIT_" + rowIndex}
                  placeholderText=""
                  textType="text"
                  addWhatText={"Unit"}
                  onTextBoxValueChange={handleItemTableValuesUpdate}
                  TextBoxValue={rowData["UNIT_NAME"]}
                  defaultValue={rowData["UNIT_NAME"]}
                  rowValuesinTable={[tableData[rowIndex], rowIndex, "UNIT_NAME"]}
                  SearchTable={"UNIT"}
                  SearchValues={[]}
                  keytoChooseinList={"UNIT_SHORT_FORM"}
                  keystoSearchinList={["UNIT_NAME", "UNIT_SHORT_FORM"]}
                  valuesFetched={unitList}
                  valuesUpdate={UnitListUpdate}
                  inputBoxWidth={"100%"}
                  showClearButton={false}
                  listDivWidth={"15vw"}
                  // strictlyselectfromlist={true}
                  previousComponentFocus={() => handlepreviousComponentFocus("UNIT_NAME", rowIndex)}
                  nextComponentFocus={() => handlenextComponentFocus("UNIT_NAME", rowIndex)}
                  openDialogBox={handleOpenDialogBox}
                  isSnackbarOpen={isSnackbarOpen}
                  setIsSnackbarOpen={setIsSnackbarOpen}
                  seterrormsg={seterrormsg}
                />
              </Grid>
              <Grid sx={{
                bgcolor: 'background.paper',
                display: rowIndex === tableData.length - 1 ? 'none' : 'flex',
                borderRight: 1,
                borderBottom: 1,
                paddingRight: '4px'
              }} item xs={1.2}>
                <CustomTextBox
                  inputId={"PRICE_" + rowIndex}
                  placeholderText=""
                  textType="number"
                  onTextBoxValueChange={handleItemTableValuesUpdate}
                  TextBoxValue={rowData["PRICE"]}
                  defaultValue={rowData["PRICE"]}
                  rowValuesinTable={[tableData[rowIndex], rowIndex, "PRICE"]}
                  inputBoxWidth={"100%"}
                  allowDecimal={true}
                  previousComponentFocus={() => handlepreviousComponentFocus("Price", rowIndex)}
                  nextComponentFocus={() => handlenextComponentFocus("Price", rowIndex)}
                  isSnackbarOpen={isSnackbarOpen}
                  setIsSnackbarOpen={setIsSnackbarOpen}
                  seterrormsg={seterrormsg} />

              </Grid>
              <Grid sx={{
                bgcolor: 'background.paper',
                display: rowIndex === tableData.length - 1 ? 'none' : 'flex',
                borderRight: 1,
                borderBottom: 1,
                paddingRight: '4px'
              }} item xs={2}>
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <CustomTextBox
                    inputId={"DISPERC_" + rowIndex}
                    placeholderText=""
                    textType="number"
                    maxValueforNumber={100}
                    onTextBoxValueChange={handleItemTableValuesUpdate}
                    TextBoxValue={rowData["DIS_PERC"]}
                    defaultValue={rowData["DIS_PERC"]}
                    rowValuesinTable={[tableData[rowIndex], rowIndex, "DIS_PERC"]}
                    inputBoxWidth={"100%"}
                    allowDecimal={true}
                    previousComponentFocus={() => handlepreviousComponentFocus("DiscountPercentage", rowIndex)}
                    nextComponentFocus={() => handlenextComponentFocus("DiscountPercentage", rowIndex)}
                    isSnackbarOpen={isSnackbarOpen}
                    setIsSnackbarOpen={setIsSnackbarOpen}
                    seterrormsg={seterrormsg} />

                  <CustomTextBox
                    inputId={"DISAMT_" + rowIndex}
                    placeholderText=""
                    textType="number"
                    onTextBoxValueChange={handleItemTableValuesUpdate}
                    maxValueforNumber={parseInteger(rowData["QTY"] * rowData["PRICE"])}
                    defaultValue={(rowData["PRICE"]) == "" ? "" : rowData["DIS_AMT"]}
                    TextBoxValue={rowData["DIS_AMT"]}
                    rowValuesinTable={[tableData[rowIndex], rowIndex, "DIS_AMT"]}
                    inputBoxWidth={"130%"}
                    allowDecimal={true}
                    previousComponentFocus={() => handlepreviousComponentFocus("DiscountAmount", rowIndex)}
                    nextComponentFocus={() => handlenextComponentFocus("DiscountAmount", rowIndex)}
                    isSnackbarOpen={isSnackbarOpen}
                    setIsSnackbarOpen={setIsSnackbarOpen}
                    seterrormsg={seterrormsg} />

                </div>
              </Grid>
              <Grid sx={{
                bgcolor: 'background.paper',
                display: rowIndex === tableData.length - 1 ? 'none' : 'flex',
                borderRight: 1,
                borderBottom: 1,
                paddingRight: '4px'
              }} item xs={1.2}>
                <CustomTextBox
                  placeholderText=""
                  textType="number"
                  texteditable={false}
                  defaultValue={
                    parseInteger(rowData["SUB_TOT"] / (1 + (rowData["TAX_PERC"] / 100))) == 0 ?
                      "" :
                      parseInteger(rowData["SUB_TOT"] / (1 + (rowData["TAX_PERC"] / 100)))}
                  rowValuesinTable={[tableData[rowIndex], rowIndex, "PRICE"]}
                  inputBoxWidth={"100%"}
                  allowDecimal={true}
                  previousComponentFocus={() => handlepreviousComponentFocus("PriceBeforeTax", rowIndex)}
                  isSnackbarOpen={isSnackbarOpen}
                  setIsSnackbarOpen={setIsSnackbarOpen}
                  seterrormsg={seterrormsg} />

              </Grid>
              <Grid sx={{
                bgcolor: 'background.paper',
                display: rowIndex === tableData.length - 1 ? 'none' : 'flex',
                borderRight: 1,
                borderBottom: 1,
                paddingRight: '4px'
              }} item xs={2}>
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <AutoCompleteInputBox
                    inputId={"TAXPERC_" + rowIndex}
                    placeholderText=""
                    texteditable={!rowData["ITEM_HSN_ID"]}
                    textType="number"
                    allowDecimal={true}
                    addWhatText={"Tax Slab"}
                    onTextBoxValueChange={handleItemTableValuesUpdate}
                    TextBoxValue={rowData["TAX_PERC"]}
                    defaultValue={rowData["TAX_PERC"]}
                    rowValuesinTable={[tableData[rowIndex], rowIndex, "TAX_PERC"]}
                    maxValueforNumber={100}
                    SearchTable={"GST_TYPE"}
                    SearchValues={[]}
                    keytoChooseinList={"GST_PERCENTAGE"}
                    valuesFetched={gstList}
                    valuesUpdate={GstListUpdate}
                    inputBoxWidth={"100%"}
                    showClearButton={false}
                    listDivWidth={"15vw"}
                    // strictlyselectfromlist={true}
                    previousComponentFocus={() => handlepreviousComponentFocus("TaxPercentage", rowIndex)}
                    nextComponentFocus={() => handlenextComponentFocus("TaxPercentage", rowIndex)}
                    openDialogBox={handleOpenDialogBox}
                    isSnackbarOpen={isSnackbarOpen}
                    setIsSnackbarOpen={setIsSnackbarOpen}
                    seterrormsg={seterrormsg} />

                  {/* //   seterrormsg={() => seterrormsg("GST rates linked with HSN.")}
                  // /> */}

                  <CustomTextBox
                    inputId={"TAXAMT_" + rowIndex}
                    placeholderText=""
                    texteditable={false}
                    textType="number"
                    onTextBoxValueChange={handleItemTableValuesUpdate}
                    defaultValue={(rowData["PRICE"]) == "" ? "" : rowData["TAX_AMT"]}
                    TextBoxValue={rowData["TAX_AMT"]}
                    rowValuesinTable={[tableData[rowIndex], rowIndex, "TAX_AMT"]}
                    inputBoxWidth={"130%"}
                    allowDecimal={true}
                    previousComponentFocus={() => handlepreviousComponentFocus("TaxAmount", rowIndex)}
                    nextComponentFocus={() => handlenextComponentFocus("TaxAmount", rowIndex)}
                    isSnackbarOpen={isSnackbarOpen}
                    setIsSnackbarOpen={setIsSnackbarOpen}
                    seterrormsg={seterrormsg} />

                </div>
              </Grid>
              <Grid sx={{
                bgcolor: 'background.paper',
                display: rowIndex === tableData.length - 1 ? 'none' : 'flex',
                borderRight: 1,
                borderBottom: 1,
                paddingRight: '4px'
              }} item xs={1.2}>
                <CustomTextBox
                  inputId={"AMOUNT_" + rowIndex}
                  placeholderText=""
                  textType="number"
                  onTextBoxValueChange={handleItemTableValuesUpdate}
                  defaultValue={(rowData["PRICE"]) == "" ? "" : rowData["SUB_TOT"]}
                  TextBoxValue={rowData["SUB_TOT"]}
                  rowValuesinTable={[tableData[rowIndex], rowIndex, "SUB_TOT"]}
                  inputBoxWidth={"100%"}
                  allowDecimal={true}
                  previousComponentFocus={() => handlepreviousComponentFocus("SubTotal", rowIndex)}
                  nextComponentFocus={() => handlenextComponentFocus("SubTotal", rowIndex)}
                  showOverflowEllipsis={false}
                  isSnackbarOpen={isSnackbarOpen}
                  setIsSnackbarOpen={setIsSnackbarOpen}
                  seterrormsg={seterrormsg} />

              </Grid>

            </React.Fragment>
          </div>

        ))}

        <Grid
          sx={{
            bgcolor: 'background.paper',
            borderRight: 1,
            borderBottom: 1,
          }}
          item
          xs={13}
        >
        </Grid>

        <Grid
          sx={{
            bgcolor: 'background.paper',
            borderLeft: 1,
            borderBottom: 1,
          }}
          item
          xs={2.5}
        >
          <div style={{
            display: 'flex',
            flexDirection: 'row'
          }}>
            <button
              style={{
                height: '4vh',
                backgroundColor: 'white',
                borderRadius: '10px',
                borderWidth: '1px',
                borderStyle: 'solid',
                cursor: 'pointer'

              }}
              onClick={addRow}>
              Add Row
            </button>
          </div>
        </Grid>

        <Grid
          sx={{
            bgcolor: 'background.paper',
            borderRight: 1,
            borderBottom: 1,
          }}
          item
          xs={1}
        >
          <div style={{
            display: 'flex',
            flexDirection: 'row'
          }}>
            <p>
              TOTAL
            </p>
          </div>

        </Grid>
        <Grid
          sx={{
            bgcolor: 'background.paper',
            borderBottom: 1,
          }}
          item
          xs={0.12}
        >
        </Grid>

        <Grid
          sx={{
            bgcolor: 'background.paper',
            borderRight: 1,
            borderBottom: 1,
          }}
          item
          xs={0.88}
        >
          <p>
            {totalQuantity == 0 ? "" : totalQuantity}
          </p>
        </Grid>

        <Grid
          sx={{
            bgcolor: 'background.paper',
            borderRight: 1,
            borderBottom: 1,
          }}
          item
          xs={0.9}
        >
        </Grid>

        <Grid
          sx={{
            bgcolor: 'background.paper',
            borderRight: 1,
            borderBottom: 1,
          }}
          item
          xs={1.2}
        >
        </Grid>

        <Grid
          sx={{
            bgcolor: 'background.paper',
            borderBottom: 1,
          }}
          item
          xs={1.1}
        >
        </Grid>

        <Grid
          sx={{
            bgcolor: 'background.paper',
            borderRight: 1,
            borderBottom: 1,
          }}
          item
          xs={.9}
        >
          <p>
            {totalDiscount == 0 ? "" : totalDiscount}
          </p>
        </Grid>

        <Grid
          sx={{
            bgcolor: 'background.paper',
            borderRight: 1,
            borderBottom: 1,
          }}
          item
          xs={1.2}
        >
        </Grid>

        <Grid
          sx={{
            bgcolor: 'background.paper',
            borderBottom: 1,
          }}
          item
          xs={1.1}
        >
        </Grid>

        <Grid
          sx={{
            bgcolor: 'background.paper',
            borderRight: 1,
            borderBottom: 1,
          }}
          item
          xs={.9}
        >
          <p>
            {totalTax == 0 ? "" : totalTax}
          </p>
        </Grid>

        <Grid
          sx={{
            bgcolor: 'background.paper',
            borderRight: 1,
            borderBottom: 1,
            paddingLeft: '10px',
            overflow: 'hidden'
          }}
          item
          xs={1.2}
        >
          <p>
            {subtotalAmount == 0 ? "" : subtotalAmount}
          </p>
        </Grid>
      </Grid>

      {
        openItemsDialog
        &&
        <AddItemsDialogBox
          open={openItemsDialog}
          dialogData={ItemDetails}
          setDialogData={handlesetItemDetails}
          onClose={handleCloseAddItemsDialog}
          onSubmit={handleSubmitAddItemsDialog}

          gstList={gstList}
          setgstList={setgstList}

          unitList={unitList}
          setunitList={setunitList}

          HSNList={HSNList}
          setHSNList={setHSNList}
        />
      }

      {
        openUnitDialog
        &&
        <AddUnitDialogBox
          open={openUnitDialog}
          dialogData={UnitDetails}
          setDialogData={handlesetUnitDetails}
          onClose={handleCloseAddUnitDialog}
          onSubmit={handleSubmitAddUnitDialog}
        />
      }

      {
        openGSTDialog
        &&
        <AddGSTDialogBox
          open={openGSTDialog}
          dialogData={GSTDetails}
          setDialogData={handlesetGSTDetails}
          onClose={handleCloseAddGSTDialog}
          onSubmit={handleSubmitAddGSTDialog}
        />
      }

    </div >
  );
}
