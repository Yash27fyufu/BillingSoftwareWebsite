import React, { useEffect, useRef, useState } from 'react';
import ConfirmationDialog from '../widgets/DialogBoxes/ConfirmationDialog';

function CustomToggle({
    toggleRef,
    toggleWidth = "100px",
    isOn,
    handleToggle,
    askForConfirmation = false, // confirm toggle
    setopenYesNoDialog,
    setconfirmationDialogMsg,
    confirmationMessage = "Are you sure ?", // till this for toggle confirmation part
    allowToggle = true,
    toggleText = "Yes or No",
    nextComponentFocus = null,
    onText = "YES",
    offText = "NO"
}) {
    const [textWidth, setTextWidth] = useState(0);
    const toggleTextRef = useRef(null);
    const isFirstRender = useRef(true);


    // const knobStyle = {
    //     alignItems: 'center',
    //     justifyContent: 'center',
    //     display: 'flex',
    //     position: 'absolute',
    //     color: '#fff',
    //     fontSize: '35%',
    //     fontWeight: 'bold',
    //     padding: '10% 5%',
    //     borderRadius: '50%',
    //     whiteSpace: 'nowrap'
    // };

    function handleToggleFunction() {
        if (allowToggle) {
            if(askForConfirmation){
                setconfirmationDialogMsg(confirmationMessage)
                setopenYesNoDialog(true)

            }else{
                handleToggle()
            }
        } else {
            // toggle not allowed some snackbar or so also change the css for the button 
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
        }, 20);
    }

    useEffect(() => {
        if (toggleTextRef.current) {
            setTextWidth(toggleTextRef.current.offsetWidth);
        }
    }, [toggleText]);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return; // Skip execution on initial render
        }
        const handleKeyDown = (event) => {

            if (!(document.activeElement === toggleRef.current)) {
                return
            }
            
            if (event.code === 'Space') {
                if (!event.ctrlKey && !event.altKey && !event.shiftKey) {
                    event.preventDefault(); // Prevent the default spacebar scrolling behavior
                    handleToggleFunction(); // Trigger the toggle function
                }
            } else if (event.code === 'Enter') {
                if (!event.ctrlKey && !event.altKey && !event.shiftKey) {
                    event.preventDefault(); // Prevent the default spacebar scrolling behavior
                    if (nextComponentFocus) {
                        nextComponentFocus();
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleToggle]);

    return (
        <div
            style={{
                height: `calc(${toggleWidth} / 3)`,
                width: `calc(${toggleWidth} + ${textWidth}px)`,
                minHeight: '15px',
                display: 'flex',
                flexDirection: 'row',
                position: 'relative'
            }}>
           {toggleText && <div
                ref={toggleTextRef}
                className='customtoggle-text'
            >
                {toggleText}
            </div>}

            <div className="customtoggle-button">
                <input
                    ref={toggleRef}
                    className="customtoggle-checkbox"
                    type="checkbox"
                    checked={isOn}
                    onChange={handleToggleFunction}
                />
                <div className="customtoggle-knobs">
                    <span className='customtoggle-knob no_select_text'
                        style={{
                            left: isOn ? 'auto' : '5%',
                            right: isOn ? '5%' : 'auto',
                            backgroundColor: isOn ? '#03a9f4' : '#f44336',

                        }}
                    >
                        {isOn ? onText : offText}
                    </span>
                </div>
                <div className="customtoggle-layer"></div>
            </div>
        </div>
    );
}

export default CustomToggle;
