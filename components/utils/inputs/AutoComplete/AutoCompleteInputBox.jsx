import React, { useEffect, useRef, useState } from 'react';

import { makeApiCall } from '../../functions/ApiCallGateway';
import { convertToUpperCase, matchPattern, parseInteger, parseString, } from "../../global/commonfrontendfuncs";
import ConditionalList from './ConditionalList';

function AutoCompleteInputBox({

    // here for every functions like onfocus,oninputchange ... and others make it take a function from the place calling this component
    // like onfocus={somefunction if needed to do something other than usual so might come in handy}


    inputId = "",
    inputRef = null,    // helps in focusing the input box
    fieldCompulsory = true, // show div on pressing enter if true else go to next 
    texteditable = true,
    labelFontSize = "15px",
    placeholderText = "",
    textType = "text",
    onlyCaps = true,
    allowDecimal = false,
    allownegative = false,
    prefixZeroAllowed = false, // for ex. bill series like 0001 or so
    allowspecialcharacters = /[^a-zA-Z0-9@!\-_(){}\[\],\/\\:<># &$+%*"'.?`=~|\^\n]/, // only these are allowed by default
    maxValueforNumber = 10000000000,
    minValueforNumber = -10000000000,
    addWhatText = "", // to display add "this"
    allowUndoRedo = true,
    autoFocushere = false, // when screen is rendered which component to be focused
    showClearButton = true,
    clickingWhenNotEditable = null,//for some other function to be executed other than displaying a snackbar
    onTextBoxValueChange = null,
    TextBoxValue = "assign some var",
    defaultValue = "",
    rowValuesinTable = null, // for inter related data i.e. in a table
    SearchTable, // table name to look for
    SearchValues, // columns to select in that table (select searchvalues from table)
    valuesFetched, // data from database
    keytoChooseinList = "", // particular key to be chosen from the valuesFetched data to display
    keystoSearchinList = [], // this is used while searching so if a dict has many keys and you want to search in any of those keys 
    valuesUpdate,// when the list is updated
    setsendIDToConfirmChangeForSameName = null, // helps in identifyingsame name but different values in remaining fields
    inputBoxWidth,
    inputBoxHeight = '4vh',
    listDivWidth = "15vw",
    listDivHeight = "40vh",
    labelText = "",
    strictlyselectfromlist = false,
    previousComponentFocus = null,
    nextComponentFocus = null,
    showOverflowEllipsis = true, // sometimes text overflow has to be avoided in order to show complete text hence this
    openDialogBox = null,// this is for the dialog box to add a value in the list 
    isSnackbarOpen,
    setIsSnackbarOpen,
    textToShowWhenUneditableAndClicked = "",
    seterrormsg,
    textPattern = "",// n - number , a - alphabet , * - anything ,  pattern ex. - nnaaa**na*
    maxcharacters = textPattern == "" ? 10000 : textPattern.length,

}) {

    const isFirstRender = useRef(true);

    const containerRef = useRef(null);

    const [showDiv, setShowDiv] = useState(false);
    const [selectedItem, setSelectedItem] = useState(textType == "number" ? isNaN(TextBoxValue) ? "" : TextBoxValue : TextBoxValue);
    const [highlightedIndex, setHighlightedIndex] = useState(0);

    const [undoredostack, setundoredostack] = defaultValue ? useState([defaultValue]) : useState([""]);
    const [undoredostackindex, setundoredostackindex] = defaultValue ? useState(1) : useState(0);

    const [IsFocused, setIsFocused] = useState(false);

    // const [tempRowVar, settempRowVar] = useState({}); // this is used to send the entire dictionary of the selected item


    const [filteredValuesFetched, setfilteredValuesFetched] = useState(valuesFetched)

    const handleDocumentClick = (event) => {

        if (containerRef.current && !containerRef.current.contains(event.target)) {
            handleOutsideClick();
        }
    };

    function changehighlightindex() {

        if (!showDiv) {
            setHighlightedIndex(0)
        } else {
            if (filteredValuesFetched.length == 0) {
                setHighlightedIndex(-1)

            } else {
                setHighlightedIndex(0)

            }
        }

    }


    const handleOutsideClick = () => {
        setShowDiv(false)
        setHighlightedIndex(0);
    };

    const handleBlur = () => {
        setIsFocused(false)
        setTimeout(() => {
            setShowDiv(false);

        }, 200)
    };

    const handleFocus = async (event) => {
        if (!texteditable) {
            if (nextComponentFocus) {
                nextComponentFocus()
            }
            return
        }
        if (valuesUpdate) {
            if (valuesFetched.length == 0) {
                valuesUpdate(await getValuesFromSearchTable());
            }
        }
        event.target.select();   // to select the entire text in the input box when focused

        setIsFocused(true);

        if (rowValuesinTable && rowValuesinTable[0]["ITEM_NAME"] == "" && previousComponentFocus && rowValuesinTable[2] != "ITEM_NAME") {
            previousComponentFocus();
        }
    };

    const handleInputChange = (event) => {
        if (!texteditable) {
            return;
        }

        var temptextvar = event.target.value;

        if (textType == "number") {
            temptextvar = parseInteger(temptextvar, minValueforNumber, maxValueforNumber, prefixZeroAllowed, allownegative, allowDecimal)
        } else if (onlyCaps) {
            if (allowspecialcharacters.test(temptextvar)) {
                return
            }
            temptextvar = convertToUpperCase(temptextvar)
        }

        if (textPattern != "") {
            if (!matchPattern(temptextvar, textPattern)) {
                return;
            }
        }

        setSelectedItem(temptextvar);

        if (allowUndoRedo) {
            if (undoredostackindex === 0) {
                setundoredostack(['', parseString(temptextvar)]);

            } else {
                const updatedStack = undoredostack.slice(0, undoredostackindex + 1);
                updatedStack.push(parseString(temptextvar));
                setundoredostack(updatedStack);
            }
            setundoredostackindex(undoredostackindex + 1);
        }

        if (setsendIDToConfirmChangeForSameName) {
            setsendIDToConfirmChangeForSameName([])
        }
        setShowDiv(true);
    };

    const handleInputClear = () => {
        setSelectedItem("");
        setShowDiv(false)
        const firstInput = containerRef.current.querySelector("input");
        if (firstInput) {
            firstInput.focus();
        }
    };

    const handleItemClick = (itemName, valuetype = "OLD") => {
        var tempselecteditem;
        if (valuetype == "ADD_NEW") {

            if (openDialogBox) {
                if (rowValuesinTable) {
                    openDialogBox(placeholderText == "" ? addWhatText : placeholderText, selectedItem, rowValuesinTable[1])
                } else {
                    openDialogBox(placeholderText == "" ? addWhatText : placeholderText, selectedItem)
                }
            } else {
                seterrormsg("Cannot insert new data");
                setIsSnackbarOpen(true)
            }
        } else {

            if (textType != "number" && onlyCaps) {
                tempselecteditem = convertToUpperCase(itemName[keytoChooseinList]) || convertToUpperCase(itemName);

            } else {
                tempselecteditem = itemName[keytoChooseinList] || itemName;

            }
        }

        if (setsendIDToConfirmChangeForSameName) {
            if (rowValuesinTable) {
                setsendIDToConfirmChangeForSameName(itemName, rowValuesinTable[1], rowValuesinTable[2])

            } else {
                setsendIDToConfirmChangeForSameName(itemName)
            }
        }

        if (valuetype != "ADD_NEW") {
            setSelectedItem(tempselecteditem)
            const firstInput = containerRef.current.querySelector("input");
            if (firstInput) {
                firstInput.focus();
            }
        }

        setShowDiv(false);
        setHighlightedIndex(0);


        if (allowUndoRedo) {
            if (tempselecteditem) {
                if (undoredostackindex === 0) {
                    setundoredostack(['', tempselecteditem]);

                } else {
                    const updatedStack = undoredostack.slice(0, undoredostackindex + 1);
                    updatedStack.push(tempselecteditem);
                    setundoredostack(updatedStack);

                }
            }
            setundoredostackindex(undoredostackindex + 1);
        }

    };

    const handleUndo = () => {
        if (undoredostackindex > 0) {
            setundoredostackindex(undoredostackindex - 1);
            setSelectedItem(undoredostack[undoredostackindex - 1]);
        }
    }

    const handleRedo = () => {
        if (undoredostackindex < undoredostack.length - 1) {
            setundoredostackindex(undoredostackindex + 1);
            setSelectedItem(undoredostack[undoredostackindex + 1]);
        }
    }

    const handleKeyDown = (event) => {
        if (!IsFocused) {
            return
        }
        if (event.key === 'Backspace' && (!selectedItem || ((textType == "number" && selectedItem === 0) || selectedItem.length == 0))) {
            setSelectedItem("")
            event.preventDefault();
            if (previousComponentFocus) {
                previousComponentFocus()
            }
        }
        if (event.ctrlKey && !event.altKey && allowUndoRedo) {
            if (event.shiftKey) {
                if (event.key === 'Z') {
                    // Ctrl+Shift+Z for redo
                    event.preventDefault();
                    handleRedo();
                }
            }
            else if (event.key === 'z') {
                // Ctrl+Z for undo
                event.preventDefault();
                handleUndo();
            }
            else if (event.key === 'y' || event.key === 'Y') {
                // Ctrl+Y for redo
                event.preventDefault();
                handleRedo();
            }
        }

        if (showDiv) {
            if (event.key === "ArrowDown") {
                event.preventDefault();
                setHighlightedIndex((prevIndex) =>
                    (prevIndex < filteredValuesFetched.length - 1) ? prevIndex + 1 : -1
                );
            } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setHighlightedIndex((prevIndex) =>
                    (prevIndex > -1) ? prevIndex - 1 : filteredValuesFetched.length - 1
                );
            } else if (event.key === "Enter") {
                if (!event.ctrlKey && !event.altKey && !event.shiftKey) {
                    event.preventDefault();
                    if (highlightedIndex === -1) {
                        handleItemClick(selectedItem, "ADD_NEW");
                    } else if (highlightedIndex >= 0) {
                        handleItemClick(filteredValuesFetched[highlightedIndex]);
                    }
                }
            } else if (event.key == "Escape") {
                setShowDiv(false);
                setHighlightedIndex(0);
            } else if (event.key === 'Tab') {
                setShowDiv(false);
            }
        } else {
            if (event.key === "Enter") {
                if (!event.ctrlKey && !event.altKey && !event.shiftKey) {
                    if (selectedItem) {

                        if (strictlyselectfromlist) {
                            if (checkValueinList()) {
                                if (nextComponentFocus) {
                                    nextComponentFocus()
                                }
                            } else {
                                seterrormsg("Value not in db");
                                setIsSnackbarOpen(true);
                                setShowDiv(true)
                            }
                        } else {
                            if (nextComponentFocus) {
                                nextComponentFocus()
                            }
                        }

                    } else {
                        if (fieldCompulsory) {
                            setShowDiv(true);
                        } else {
                            if (nextComponentFocus) {
                                nextComponentFocus()
                            }
                        }
                    }

                }
            } else if (event.key === "Escape") {
                document.activeElement.blur()

            }
        }

    };

    function checkValueinList() {
        if (parseString(selectedItem).trim() == "") {
            return true;
        }
        if (Array.isArray(valuesFetched) && valuesFetched.length > 0 && typeof valuesFetched[0] === 'string') {
            return parseString(valuesFetched).toLowerCase().includes(parseString(selectedItem).toLowerCase())

        } else {
            return valuesFetched.some(dict => {
                const valueToCheck = dict[keytoChooseinList];
                return String(parseString(valueToCheck).toLowerCase()).includes(parseString(selectedItem).toLowerCase());
            });


        }
    }





    function matchInput(optionsItem) {
        if (typeof (optionsItem) === 'string') {
            return doesStringContainAllSubstrings(parseString(selectedItem).toLowerCase(), parseString(optionsItem).toLowerCase());

        } else if (optionsItem) {
            if (keystoSearchinList.length == 0) {
                if (keytoChooseinList == "") {
                    return doesStringContainAllSubstrings(parseString(selectedItem).toLowerCase(), parseString(optionsItem).toLowerCase());

                } else if (keytoChooseinList != "") {
                    return doesStringContainAllSubstrings(parseString(selectedItem).toLowerCase(), parseString(optionsItem[keytoChooseinList]).toLowerCase());

                }
            } else {
                if (keytoChooseinList != "") {
                    for (var i = 0; i < keystoSearchinList.length; i++) {
                        if (doesStringContainAllSubstrings(parseString(selectedItem).toLowerCase(), parseString(optionsItem[keystoSearchinList[i]]).toLowerCase())) {
                            return true
                        }
                    }
                    return false

                }
            }
        }
        //if no condition matched i mean it escaped due to some glitch
        return true
    }

    function doesStringContainAllSubstrings(input, searchString) {
        if (searchString == "") {
            return
        }
        if (textType == "number" && input == 0) {
            return true
        }
        const inputSubstrings = input.split(" ");
        return inputSubstrings.every((substring) => searchString.includes(substring));
    }

    async function getValuesFromSearchTable() {
        const response = await makeApiCall('/api/utils/autocomplete', {
            SearchTable: SearchTable,
            SearchValues: SearchValues,
        });
        const data = response;
        return data.autoCompleteResult;
    }

    const handleClickWhenUneditable = () => {
        if (clickingWhenNotEditable) {
            console.error("No clicks allowed.");
            clickingWhenNotEditable()
        }
        else if (!isSnackbarOpen) {
            if (seterrormsg) {
                if (textToShowWhenUneditableAndClicked) {

                } else {
                    seterrormsg("You cannot edit this field.");
                }
                setIsSnackbarOpen(true)
                if (previousComponentFocus) {
                    previousComponentFocus()
                }
            }
        }
    }

    const handleInputBoxClick = async () => {
        if (!texteditable) {
            handleClickWhenUneditable()
            return;
        }
        if (rowValuesinTable) {
            if (rowValuesinTable[0]["ITEM_NAME"] == "" && rowValuesinTable[2] != "ITEM_NAME") {
                if (!isSnackbarOpen) {
                    seterrormsg("Enter Item Name");
                    setIsSnackbarOpen(true)
                    if (previousComponentFocus) {
                        previousComponentFocus()
                    }
                }
            } else {
                if (showDiv) {
                    setShowDiv(false)
                    return;
                }
            }
        } else {
            if (showDiv) {
                setShowDiv(false)
                return;
            } else if (SearchTable && valuesUpdate && valuesFetched.length == 0) {
                try {
                    valuesUpdate(await getValuesFromSearchTable());
                } catch (error) {
                    seterrormsg("Server Error : Search Table Not Found " + error);
                    setIsSnackbarOpen(true);
                    return;
                }
            }
        }
        if (IsFocused && !showDiv) {
            setShowDiv(true)
        }
    };

    const scrollToHighlightedItem = () => {
        const highlightedItem = document.querySelector(".autocomplete-list_item_highlighted");
        if (highlightedItem) {
            setTimeout(() => {
                highlightedItem.scrollIntoView({
                    behavior: 'instant',
                    // block: 'center',
                    block: 'nearest'
                });
            }, 200);
        }
    }

    useEffect(() => {
        if (selectedItem == "") {
            setfilteredValuesFetched(valuesFetched)
        } else {
            setfilteredValuesFetched(valuesFetched.filter(matchInput))

            //sorting is not required since the list is sorted on every update outside this but keep the function as might come handy
            // setfilteredValuesFetched(valuesFetched.filter(matchInput).sort(customSort))

        }
    }, [selectedItem, valuesFetched])

    // const customSort = (a, b) => {
    //     // Function to check if a dictionary's value starts with the search string
    //     const startsWithSearchString = (dict) => parseString(dict[keytoChooseinList]).toLowerCase().startsWith(parseString(selectedItem).toLowerCase());

    //     const startsWithA = startsWithSearchString(a);
    //     const startsWithB = startsWithSearchString(b);

    //     if (startsWithA === startsWithB) {
    //         return parseString(a[keytoChooseinList]).toLowerCase() < parseString(b[keytoChooseinList]).toLowerCase() ? -1 : 1;
    //     } else {
    //         return startsWithB - startsWithA;
    //     }
    // };

    useEffect(() => {
        scrollToHighlightedItem();

    }, [highlightedIndex])

    useEffect(() => {
        if (defaultValue != selectedItem) {
            if (textType == "number") {
                setSelectedItem(parseInteger(defaultValue, minValueforNumber, maxValueforNumber, prefixZeroAllowed, allownegative, allowDecimal))
            } else if (onlyCaps) {
                setSelectedItem(convertToUpperCase(parseString(defaultValue)));
            } else {
                setSelectedItem(parseString(defaultValue));
            }
            if (allowUndoRedo) {
                const updatedStack = undoredostack.slice(0, undoredostackindex + 1);
                updatedStack.push(defaultValue);
                setundoredostack(updatedStack);
                setundoredostackindex(undoredostackindex + 1);
            }
        }
    }, [defaultValue]);

    useEffect(() => {
        if (!IsFocused) {
            return
        }
        document.addEventListener('click', handleDocumentClick);
        return () => {
            document.removeEventListener('click', handleDocumentClick);
        };

    }, [IsFocused]);


    useEffect(() => {
        changehighlightindex()

    }, [showDiv, selectedItem, filteredValuesFetched])


    function handleupdatesproperly() {


    }

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return; // Skip execution on initial render
        }

        if (rowValuesinTable ? selectedItem == rowValuesinTable[0][rowValuesinTable[2]] : TextBoxValue == selectedItem) {
            return
        } else if (rowValuesinTable) {
            if (onTextBoxValueChange)
                onTextBoxValueChange(selectedItem, rowValuesinTable[1], rowValuesinTable[2]);
        } else {
            if (onTextBoxValueChange)
                onTextBoxValueChange(selectedItem);
        }
    }, [selectedItem]);



    return (

        <div
            ref={containerRef}
            tabIndex={!texteditable ? -1 : undefined}
            className="autocomplete-div"
            style={{
                marginLeft: rowValuesinTable ? "3px" : "",
                width: `${inputBoxWidth}`,
                paddingBottom: '5px',
                marginRight: rowValuesinTable ? '3px' : ""
            }}
        >
            {labelText && <div
                className='autocomplete-label_for_input_box no_select_text'
                style={{
                    fontSize: `${labelFontSize}`,
                }}
            >
                {labelText}
            </div>}

            <div
                className="autocomplete-input_box_div"
                style={{
                    marginTop: rowValuesinTable ? "8px" : "3px",
                    border: rowValuesinTable ? IsFocused ? "" : "none" : texteditable ? "" : "dashed grey",
                }}
            >
                <input

                    tabIndex={!texteditable ? -1 : undefined}
                    readOnly={!texteditable}
                    autoComplete='off'
                    name='randomstuff'// to avoid auto suggestions by browser
                    title={TextBoxValue ? TextBoxValue : ""}
                    ref={inputRef}
                    id={inputId ? inputId : rowValuesinTable ? rowValuesinTable[2] + rowValuesinTable[1] : placeholderText ? placeholderText : ""}
                    maxLength={maxcharacters}
                    placeholder={placeholderText}
                    value={selectedItem ? textType == "number" ? isNaN(selectedItem) ? 0 : selectedItem : selectedItem : ""}
                    onChange={handleInputChange}
                    onClick={handleInputBoxClick}
                    autoFocus={autoFocushere}
                    type='text'
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    onKeyDown={handleKeyDown}
                    className='autocomplete-input_box '
                    style={{
                        width: '100%',
                        // minHeight: '30px', // minheight leads to overlapping in some cases
                        height: `${inputBoxHeight}`,
                        backgroundColor: rowValuesinTable ? "" : "white",
                        textOverflow: showOverflowEllipsis ? 'ellipsis' : "none",
                        color: texteditable ? "" : '#565656',
                        fontSize: texteditable ? "" : '16px',
                    }}
                />

                {texteditable && showClearButton && selectedItem && (
                    <button
                        tabIndex={-1}
                        title='Clear'
                        onClick={handleInputClear}
                        className='autocomplete-clear_button no_select_text'
                        style={{
                            marginLeft: "auto"
                        }}
                    >
                        X
                    </button>
                )}
            </div>



            {showDiv &&

                <ConditionalList
                    showDiv={showDiv}
                    listDivWidth={listDivWidth}
                    listDivHeight={listDivHeight}
                    selectedItem={selectedItem ? parseString(selectedItem) : ""}
                    highlightedIndex={highlightedIndex}
                    handleItemClick={handleItemClick}
                    filteredValuesFetched={filteredValuesFetched}
                    keytoChooseinList={keytoChooseinList}
                    addWhatText={addWhatText}
                />

            }


        </div>
    );
}

export default AutoCompleteInputBox;
