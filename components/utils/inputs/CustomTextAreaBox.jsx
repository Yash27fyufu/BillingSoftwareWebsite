import React, { useEffect, useState } from 'react';
import { parseInteger, matchPattern, convertToUpperCase, parseString, } from "../global/commonfrontendfuncs";
import { height } from '@fortawesome/free-solid-svg-icons/fa0';

function CustomTextAreaBox({
    resizeDirection = 'vertical', // horizontal, vertical or both
    inputId = "", // this is must to avoid unnecessary errors 
    inputRef = null, // don't give ref to all since it creates load
    labelFontSize = "15px",
    texteditable = true,
    placeholderText = "",
    allownegative = false,
    allowDecimal = false,
    prefixZeroAllowed = false,
    allowspecialcharacters = /[^a-zA-Z0-9@!\-_(){}\[\],\/\\:<># $=&+%*"'.?`~|\^\n]/,
    minValueforNumber = -10000000000,
    maxValueforNumber = 100000000000,
    textType = "text",
    onlyCaps = true,
    autoFocushere = false,
    allowUndoRedo = true,
    showClearButton = false,
    onTextBoxValueChange = null,
    clickingWhenNotEditable = null, //if some kind of function is to be excuted
    rowValuesinTable = null,// for invoices and similar places where it is used in a table
    TextBoxValue = "",
    defaultValue = "",
    inputBoxWidth,
    inputBoxHeight = '3.35vh',
    maxInputBoxHeight = "20vh",
    labelText,
    nextComponentFocus = null,
    previousComponentFocus = null,
    showOverflowEllipsis = true,
    isSnackbarOpen,
    setIsSnackbarOpen = null,
    seterrormsg = "",
    textPattern = "",// n - number , a - alphabet , * - anything ,  
    maxcharacters = textPattern == "" ? 10000 : textPattern.length,

}) {

    const [selectedItem, setSelectedItem] = useState(textType == "number" ? isNaN(TextBoxValue) ? "" : TextBoxValue : TextBoxValue);

    const [undoredostack, setundoredostack] = defaultValue ? useState([defaultValue]) : useState([""]);
    const [undoredostackindex, setundoredostackindex] = defaultValue ? useState(1) : useState(0);
    const [IsFocused, setIsFocused] = useState(false);
    const [onceChanged, setonceChanged] = useState(false);


    const handleBlur = () => {
        setIsFocused(false);
    };

    const handleFocus = (event) => {
        if (!texteditable) {
            if (nextComponentFocus) {
                nextComponentFocus()
            }
            return
        }
        event.target.select()

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

        if (textPattern) {
            if (!matchPattern(temptextvar, textPattern)) {
                return;
            }
        } else if (textType == "number") {
            temptextvar = parseInteger(temptextvar, minValueforNumber, maxValueforNumber, prefixZeroAllowed, allownegative, allowDecimal)
        } else if (onlyCaps) {
            if (allowspecialcharacters.test(temptextvar)) {
                return
            }
            temptextvar = convertToUpperCase(temptextvar)
        }
        if (inputRef) {
            const textarea = inputRef.current;
            textarea.style.height = 'auto';  // Reset height to auto to calculate new scrollHeight
            textarea.style.height = `${textarea.scrollHeight}px`;  // Set new height
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
    };

    const handleInputClear = () => {
        setSelectedItem("");

        const firstInput = containerRef.current.querySelector("input");
        if (firstInput) {
            firstInput.focus();
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
        } else if (event.ctrlKey && !event.altKey && allowUndoRedo) {
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
        } else if (event.key === "Escape") {
            document.activeElement.blur()

        } else if (event.key === "Enter") {
            if (!event.ctrlKey && !event.altKey && !event.shiftKey) {
                event.preventDefault();
                if (nextComponentFocus) {
                    nextComponentFocus();
                }
            }
        }

    };

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
            }
        }
    };

    const handleClickWhenUneditable = () => {
        if (clickingWhenNotEditable) {
            // call that function which you want to be executed when uneditable
            clickingWhenNotEditable()
            console.error("No clicks allowed.");
        }
        else if (!isSnackbarOpen) {
            if (seterrormsg) {
                seterrormsg("You cannot edit this field.");
                setIsSnackbarOpen(true)
                if (previousComponentFocus) {
                    previousComponentFocus()
                }
            }
        }
    }
    if (inputId == "") {
        console.error("Error : Textarea id not found");

    }
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
        if ((rowValuesinTable ? selectedItem == rowValuesinTable[0][rowValuesinTable[2]] : false) || TextBoxValue == selectedItem) {
            return
        } else if (rowValuesinTable) {
            if (onTextBoxValueChange)
                onTextBoxValueChange(selectedItem, rowValuesinTable[1], rowValuesinTable[2]);
        } else {
            if (onTextBoxValueChange)
                onTextBoxValueChange(selectedItem);
        }
        if (inputId == "") {
            console.error("Error : textarea id not found");

        }
    }, [selectedItem]);

    useEffect(() => {
        if (resizeDirection != 'both') {
            return
        }

        var textareaElement = document.getElementById(
            rowValuesinTable ? rowValuesinTable[2] + rowValuesinTable[1] : inputId
        );

        if (inputId == "") {
            console.error("Error : textarea id not found");
        }

        if (!textareaElement) return;

        const resizeObserver = new MutationObserver(() => {
            setonceChanged(true)
            resizeObserver.disconnect();

        });

        resizeObserver.observe(textareaElement, {
            attributes: true,
            attributeFilter: ['style', 'class'],
            subtree: false,
        });

        return () => resizeObserver.disconnect();
    }, []);

    return (
        <div
            tabIndex={!texteditable ? -1 : undefined}
            className="customtextareabox-div"
            style={{
                marginLeft: rowValuesinTable ? "3px" : "",
                maxWidth: `calc(${inputBoxWidth} + 18vw)`,
                paddingBottom: '5px',
                marginRight: rowValuesinTable ? '3px' : "",
                width: resizeDirection != 'both' ? `${inputBoxWidth} ` : onceChanged ? "" : `${inputBoxWidth} `,

            }}
        >
            {labelText && <div
                className='customtextareabox-label_for_input_box no_select_text'
                style={{
                    fontSize: `${labelFontSize}`,
                }}
            >
                {labelText}
            </div>}

            <div
                className="customtextareabox-input_box_div"
                style={{
                    marginTop: rowValuesinTable ? "8px" : "3px",
                    border: rowValuesinTable ? IsFocused ? "" : "none" : texteditable ? "" : "dashed grey",
                }}
            >
                <textarea
                    ref={inputRef}
                    tabIndex={!texteditable ? -1 : undefined}
                    readOnly={!texteditable}
                    autoComplete='new-password'
                    name='randomstuff'// to avoid auto suggestions by browser
                    title={textType == "number" ? isNaN(selectedItem) ? 0 : selectedItem : selectedItem}
                    id={inputId ? inputId : rowValuesinTable ? rowValuesinTable[2] + rowValuesinTable[1] : placeholderText ? placeholderText : ""}
                    maxLength={maxcharacters}
                    placeholder={placeholderText}
                    value={selectedItem ? textType == "number" ? isNaN(selectedItem) ? selectedItem == "-" ? selectedItem : "" : selectedItem : selectedItem : ""}
                    onChange={handleInputChange}
                    onClick={handleInputBoxClick}
                    autoFocus={autoFocushere}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className='customtextareabox-input_box'
                    style={{
                        resize: resizeDirection,
                        minWidth: onceChanged ? '8vw' : "",
                        // minHeight: '26.5px', 
                        maxHeight: `${maxInputBoxHeight}`,
                        width: '100%',
                        backgroundColor: rowValuesinTable ? "" : "white",
                        textOverflow: showOverflowEllipsis ? "ellipsis" : "none",
                        overflow: 'auto',
                        fontFamily: 'sans-serif',
                        paddingTop: '5px',
                        fontSize: texteditable ? "" : '16px',
                        height: "3.45vh"
                    }}
                />

                {textType != "number" && showClearButton && selectedItem && (
                    <button
                        tabIndex={-1}
                        title='Clear'
                        onClick={handleInputClear}
                        className='customtextareabox-clear_button no_select_text'
                        style={{
                            marginLeft: "auto"
                        }}
                    >
                        X
                    </button>
                )}
            </div>
        </div>
    );
}

export default CustomTextAreaBox;
