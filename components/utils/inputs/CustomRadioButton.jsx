import React, { useState, useEffect } from 'react';

const CustomRadioButton = ({
    enableCheckBox = true,
    options = [],
    displayVertical = false,
    noOfChoices = 1,
    selectedValues = [],// use list of strings only be it single or multi choice
    setSelectedValues,
    maxDisplayWidth = "100px"
}) => {
    const [tempselectedValues, settempSelectedValues] = useState(selectedValues);

    const handleChange = (event, itemName) => {
        event.currentTarget.blur() // blurring in order to maintain the color
        settempSelectedValues((prevSelectedValues) => {
            if (prevSelectedValues.includes(itemName)) {
                if (noOfChoices == 1) {
                    return [itemName];
                } else {
                    return prevSelectedValues.filter((item) => item !== itemName);
                }
            } else {
                if (tempselectedValues.length == noOfChoices) {
                    if (noOfChoices == 1) {
                        return [itemName];
                    } else {
                        return [...prevSelectedValues,];
                    }
                } else {
                    return [...prevSelectedValues, itemName];
                }
            }
        });

    };


    useEffect(() => {
        if (selectedValues != tempselectedValues) {
            setSelectedValues(tempselectedValues)
        }
    }, [tempselectedValues])

    useEffect(() => {
        if (tempselectedValues != selectedValues) {
            settempSelectedValues(selectedValues)
        }
    }, [selectedValues])

    return (
        <div style={{
            display: "flex",
            flexDirection: displayVertical ? "column" : "row"
        }}>
            {options.map((item, index) => (
                <div key={index} className='custom_radio_button-div' style={{ maxWidth: maxDisplayWidth }}>
                    <label className='custom_radio_button-label'>
                        <input
                            className='custom_radio_button-input'
                            type={'checkbox'}
                            onChange={(event) => handleChange(event, item)}
                            checked={tempselectedValues.includes(item)}
                            disabled={!enableCheckBox}
                        />
                        <span className='custom_radio_button-span'>{item}</span>
                    </label>
                </div>
            ))}
        </div>
    );
};

export default CustomRadioButton;
