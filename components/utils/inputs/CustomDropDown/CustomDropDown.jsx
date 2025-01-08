import React, { useEffect, useRef, useState } from 'react';
import { convertToUpperCase, parseString } from "../../global/commonfrontendfuncs";
import OptionsList from './OptionsList';

function CustomDropDownBox({
    inputId = "",
    inputRef = null,
    labelFontSize = "15px",
    placeholderText = "",
    onlyCaps = false,
    autoFocus = false,
    onTextBoxValueChange = null,
    TextBoxValue = "assign some var",
    nextComponentFocus = null,
    defaultValue = "",
    valuesFetched = [],
    valuesUpdate = null,
    inputBoxWidth = "90%",
    inputBoxHeight = '1.7vh',
    listDivHeight = "40vh",
    labelText = "",
    showOverflowEllipsis = true,
    setIsSnackbarOpen
}) {

    const isFirstRender = useRef(true);
    const containerRef = useRef(null);
    const [showDiv, setShowDiv] = useState(false);
    const [selectedItem, setSelectedItem] = useState(TextBoxValue);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const [isFocused, setIsFocused] = useState(false);

    const handleDocumentClick = (event) => {
        if (containerRef.current && !containerRef.current.contains(event.target)) {
            handleOutsideClick();
        }
    };

    const handleOutsideClick = () => {
        setShowDiv(false);
        setHighlightedIndex(0);
    };

    const handleBlur = () => {
        setIsFocused(false);
        setTimeout(() => setShowDiv(false), 200);
    };

    const handleFocus = () => {
        if (valuesUpdate && valuesFetched.length === 0) {
            valuesUpdate();
        }
        setIsFocused(true);
    };

    const handleItemClick = (itemName) => {
        const newItem = onlyCaps ? convertToUpperCase(itemName) : itemName;
        setSelectedItem(newItem);
        setShowDiv(false);
        const firstInput = containerRef.current.querySelector("input");
        if (firstInput) {
            firstInput.focus();
        }
    };

    const handleKeyDown = (event) => {
        if (!isFocused) return;

        if (showDiv) {
            switch (event.key) {
                case "ArrowDown":
                    event.preventDefault();
                    setHighlightedIndex((prev) => (prev < valuesFetched.length - 1 ? prev + 1 : 0));
                    break;
                case "ArrowUp":
                    event.preventDefault();
                    setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : valuesFetched.length - 1));
                    break;
                case "Enter":
                    event.preventDefault();
                    if (highlightedIndex === -1) {
                        handleItemClick(selectedItem);
                    } else {
                        handleItemClick(valuesFetched[highlightedIndex]);
                    }
                    break;
                case "Escape":
                    setShowDiv(false);
                    setHighlightedIndex(0);
                    break;
                case "Tab":
                    setShowDiv(false);
                    break;
                default:
                    break;
            }
        } else if (event.key === "Enter") {
            if (nextComponentFocus) {
                nextComponentFocus()
            }
        }
    };

    const handleInputBoxClick = async () => {
        if (showDiv) {
            setShowDiv(false);
        } else if (valuesUpdate && valuesFetched.length === 0) {
            try {
                await valuesUpdate();
            } catch (error) {
                setIsSnackbarOpen(true);
            }
        } else if (isFocused && !showDiv) {
            setShowDiv(true);
        }
    };

    const scrollToHighlightedItem = () => {
        const highlightedItem = document.querySelector(".dropdownbox-list_item_highlighted");
        if (highlightedItem) {
            setTimeout(() => {
                highlightedItem.scrollIntoView({ behavior: 'instant', block: 'nearest' });
            }, 200);
        }
    };

    useEffect(() => {
        scrollToHighlightedItem();
    }, [highlightedIndex]);

    useEffect(() => {
        if (defaultValue !== selectedItem) {
            setSelectedItem(onlyCaps ? convertToUpperCase(parseString(defaultValue)) : parseString(defaultValue));
        }
    }, [defaultValue]);

    useEffect(() => {
        if (!isFocused) return;

        document.addEventListener('click', handleDocumentClick);
        return () => {
            document.removeEventListener('click', handleDocumentClick);
        };
    }, [isFocused]);

    useEffect(() => {
        setHighlightedIndex(0);
    }, [showDiv]);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (TextBoxValue !== selectedItem && onTextBoxValueChange) {
            onTextBoxValueChange(selectedItem);
        }
    }, [selectedItem]);

    return (
        <div
            ref={containerRef}
            className="dropdownbox-div"
            style={{ width: inputBoxWidth, paddingBottom: '5px' }}
        >
            {labelText && (
                <div className="dropdownbox-label_for_input_box no_select_text" style={{ fontSize: labelFontSize }}>
                    {labelText}
                </div>
            )}
            <div className="dropdownbox-input_box_div" style={{ marginTop: "3px" }}>
                <input
                    readOnly
                    dropdownbox='new-password'
                    title={TextBoxValue || ""}
                    ref={inputRef}
                    id={inputId}
                    placeholder={placeholderText}
                    value={selectedItem || ""}
                    onClick={handleInputBoxClick}
                    autoFocus={autoFocus}
                    type='text'
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    onKeyDown={handleKeyDown}
                    className="dropdownbox-input_box"
                    style={{
                        width: '100%',
                        // minHeight: '30px',
                        height: `${inputBoxHeight}`,
                        backgroundColor: "white",
                        textOverflow: showOverflowEllipsis ? 'ellipsis' : "clip",
                        fontSize: '12px',
                        textAlign: "center"
                    }}
                />
            </div>

            {showDiv && (
                <OptionsList
                    showDiv={showDiv}
                    listDivWidth={inputBoxWidth}
                    listDivHeight={listDivHeight}
                    selectedItem={selectedItem ? parseString(selectedItem) : ""}
                    highlightedIndex={highlightedIndex}
                    handleItemClick={handleItemClick}
                    filteredValuesFetched={valuesFetched}
                />
            )}
        </div>
    );
}

export default CustomDropDownBox;
