import React, { useEffect, useState } from 'react';
import ConfirmationDialog from '../widgets/DialogBoxes/ConfirmationDialog';

function Customdatepicker({
    inputRef = null,
    labelFontSize = "15px",
    onDateChange,
    askConfirmation = false,
    billDateValue = new Date().toLocaleDateString('en-CA').slice(0, 10),
    inputBoxWidth = "10vw",
    defaultValue = null,
    labelText,
    nextComponentFocus,
    previousComponentFocus,
    topMargintoAdjust = '2.5px',
    dateeditable = true,
    //for confirmation dialog
    // setopenYesNoDialog = null,
    setmsg = "",
}) {
    const [selectedDate, setSelectedDate] = useState(billDateValue || new Date().toLocaleDateString('en-CA').slice(0, 10));
    const [pressedOnce, setpressedOnce] = useState(false);
    const [allowDiffDate, setallowDiffDate] = useState(false);

    const [openYesNoDialog, setopenYesNoDialog] = useState(false);

    const handleDateChange = (event) => {
        const enteredDate = event.target.value;
        const currentDate = selectedDate;

        // Check if the entered date is valid (a valid date format: YYYY-MM-DD)
        if (/^\d{4}-\d{2}-\d{2}$/.test(enteredDate)) {
            setSelectedDate(enteredDate);
        } else {
            // If the entered date is not valid, reset to the current date
            setSelectedDate(currentDate);
        }
        setallowDiffDate(false)


    };

    const handleFocus = (event) => {
        if (!dateeditable) {
            if (nextComponentFocus) {
                nextComponentFocus()
            }
        }
    }

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            if (!event.ctrlKey && !event.altKey && !event.shiftKey) {
                event.preventDefault();
                if (askConfirmation && checkConfirmation()) {
                    if (onDateChange) {
                        onDateChange(selectedDate);
                    }

                    if (nextComponentFocus) {
                        nextComponentFocus();
                    }
                } else {
                    if (nextComponentFocus) {
                        nextComponentFocus();
                    }
                }
            }
        } else if (event.key === "Backspace") {
            if (!event.ctrlKey && !event.altKey && !event.shiftKey) {
                if (pressedOnce) {
                    setpressedOnce(false)
                    if (previousComponentFocus) {
                        previousComponentFocus()
                    }
                } else {
                    setpressedOnce(true)
                    event.preventDefault();
                    if (inputRef) {
                        inputRef.current.blur();
                        inputRef.current.focus();
                    }
                }

            }
        }
    }

    function checkConfirmation() {
        if (setmsg == "" || allowDiffDate) {
            return true
        }
        if (new Date().toLocaleDateString('en-CA').slice(0, 10) == selectedDate) {
            return true

        } else {
            setopenYesNoDialog(true)

        }

    }

    async function handleConfirmYesNo() {
        setallowDiffDate(true)
        setopenYesNoDialog(false)
        if (onDateChange) {
            onDateChange(selectedDate);
        }
        setTimeout(() => {
            nextComponentFocus();

        }, 200);
    }

    function handleCancelYesNo() {
        setopenYesNoDialog(false)
        changeFocusTo(inputRef)

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


    useEffect(() => {
        if (billDateValue != selectedDate) {
            setSelectedDate(billDateValue)
        }
    }, [billDateValue])

    useEffect(() => {
        if (defaultValue && defaultValue != selectedDate) {
            setSelectedDate(defaultValue);
        }
    }, [defaultValue]);

    useEffect(() => {
        if (!askConfirmation) {
            if (onDateChange) {
                onDateChange(selectedDate);
            }
        }
    }, [selectedDate])

    return (
        <div
            tabIndex={!dateeditable ? -1 : undefined}
            className="customdatepicker-div"
            style={{
                minWidth: "120px",
                width: `${inputBoxWidth}`,
                paddingBottom: '5px',
            }}
        >
            {labelText && <label
                className='customdatepicker-label_for_input_box no_select_text'
                style={{
                    fontSize: `${labelFontSize}`,
                }}
            >
                {labelText}
            </label>}

            <div
                className="customdatepicker-input_box_div"
                style={{
                    marginTop: topMargintoAdjust,
                    border: !dateeditable ? "dashed grey" : ""
                }}
            >
                <input
                    onFocus={handleFocus}
                    tabIndex={!dateeditable ? -1 : undefined}
                    readOnly={!dateeditable}
                    ref={inputRef}
                    className='customdatepicker-input_box no_select_text'
                    title={selectedDate}
                    type="date"
                    value={askConfirmation ? selectedDate : billDateValue}
                    onChange={handleDateChange}
                    onKeyDown={handleKeyDown}
                    style={{
                        // minHeight: '32px',
                        minWidth: "100px",
                        width: '100%',
                        backgroundColor: !dateeditable ? "#f0f0f0" : "white", // Light gray when not editable
                        color: !dateeditable ? "#a0a0a0" : "#000", // Gray text color when not editable
                        cursor: !dateeditable ? "not-allowed" : "pointer" // Not allowed cursor when not editable
                    }}
                />
            </div>

            {openYesNoDialog && (
                <ConfirmationDialog
                    open={openYesNoDialog}
                    message={setmsg}
                    onConfirm={handleConfirmYesNo}
                    onClose={handleCancelYesNo}
                />
            )}
        </div>
    );
}

export default Customdatepicker;
