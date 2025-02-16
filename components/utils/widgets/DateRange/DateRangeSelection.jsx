import React, { useEffect, useRef, useState } from 'react';
import CustomDatePicker from '../../inputs/CustomDatePicker';
import CustomRadioButton from '../../inputs/CustomRadioButton';

function DateRangeSelection({
    defaultRange = "Today",
    fromDate,
    handlesetfromDate = null,
    toDate,
    handlesettoDate = null,
    showRadioButtons = false,
}) {

    const today = new Date();

    const isFirstRender = useRef(true);

    const toDateRef = useRef(null);

    const [rangeType, setrangeType] = useState(defaultRange ? [defaultRange] : ["Today"]);

    function handlenextComponentFocus(name) {
        if (name == "FromDate") {
            changeFocusTo(toDateRef);
        } else if (name == "ToDate") {
            toDateRef.current.blur();
        }
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
        }, 200);
    }

    //set date range according to type
    useEffect(() => {

        if (rangeType[0] == "Custom") {
            return
        }
        var tempdate;
        switch (rangeType[0]) {
            case "Today":
                tempdate = today.toLocaleDateString('en-CA').slice(0, 10);
                if (fromDate != tempdate)
                    handlesetfromDate(tempdate)
                if (toDate != tempdate)
                    handlesettoDate(tempdate)
                break;
            case "This Month":
                tempdate = new Date(today.getFullYear(), today.getMonth(), 1).toLocaleDateString('en-CA')
                if (fromDate != tempdate)
                    handlesetfromDate(tempdate)

                tempdate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toLocaleDateString('en-CA')
                if (toDate != tempdate)
                    handlesettoDate(tempdate)
                break;
            case "Financial Year":
                if (today.getMonth() > 2) {
                    tempdate = new Date(today.getFullYear(), 3, 1).toLocaleDateString('en-CA')
                    if (fromDate != tempdate)
                        handlesetfromDate(tempdate)

                    tempdate = new Date(today.getFullYear() + 1, 3, 0).toLocaleDateString('en-CA')
                    if (toDate != tempdate)
                        handlesettoDate(tempdate)

                } else {
                    tempdate = new Date(today.getFullYear() - 1, 3, 1).toLocaleDateString('en-CA')
                    if (fromDate != tempdate)
                        handlesetfromDate(tempdate)

                    tempdate = new Date(today.getFullYear(), 3, 0).toLocaleDateString('en-CA')
                    if (toDate != tempdate)
                        handlesettoDate(tempdate)
                }
                break;
        }
    }, [rangeType])

    //set type according to date range
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return; // Skip execution on initial render
        }
 
        if (fromDate == today.toLocaleDateString('en-CA') && toDate == today.toLocaleDateString('en-CA')) {

            setrangeType(["Today"])
        } else if (
            fromDate == new Date(today.getFullYear(), today.getMonth(), 1).toLocaleDateString('en-CA') &&
            toDate == new Date(today.getFullYear(), today.getMonth() + 1, 0).toLocaleDateString('en-CA')) {

            setrangeType(["This Month"])
        } else if (
            fromDate == new Date(today.getFullYear(), 3, 1).toLocaleDateString('en-CA') &&
            toDate == new Date(today.getFullYear() + 1, 3, 0).toLocaleDateString('en-CA')) {

            setrangeType(["Financial Year"])
        } else if (
            fromDate == new Date(today.getFullYear() - 1, 3, 1).toLocaleDateString('en-CA') &&
            toDate == new Date(today.getFullYear(), 3, 0).toLocaleDateString('en-CA')) {

            setrangeType(["Financial Year"])

        } else {
            setrangeType(["Custom"])
        }
    }, [fromDate, toDate])


    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                overflow: 'hidden',
                width: '100%',
                alignItems: 'center',
            }}>

            <div style={{
                marginTop: '20px'
            }}>

                {showRadioButtons
                    &&
                    <div style={{ display: "flex", alignItems: 'left' }}>
                        <CustomRadioButton
                            maxDisplayWidth='150px'
                            options={["Today", "This Month", "Financial Year"]}
                            setSelectedValues={setrangeType}
                            selectedValues={rangeType}
                            noOfChoices={1}
                        />

                        <div style={{ width: "1rem" }} />
                    </div>}

            </div>

            <div style={{ display: 'flex', marginLeft: '50px' }}>

                <CustomDatePicker
                    labelText={"From"}
                    billDateValue={fromDate}
                    onDateChange={handlesetfromDate}
                    nextComponentFocus={() => handlenextComponentFocus("FromDate")}
                />

                <div style={{ width: "2rem" }} />

                <CustomDatePicker
                    inputRef={toDateRef}
                    labelText={"To"}
                    billDateValue={toDate}
                    onDateChange={handlesettoDate}
                    nextComponentFocus={() => handlenextComponentFocus("ToDate")}
                />

            </div>
        </div>

    );
}

export default DateRangeSelection;