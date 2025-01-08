import { Button } from '@mui/material';
import React, { useEffect, useRef } from 'react';
import FocusLock from 'react-focus-lock';

function InfoDialog({ open, onClose, message }) {

    const noButtonref = useRef(null);

    const handleClickYesNoDialog = (event) => {
        changeFocusTo(noButtonref)
    }

    const handleKeyDown = (event) => {
        if (event.key === 'ArrowLeft') {
            changeFocusTo(noButtonref);
        } else if (event.key === 'ArrowRight') {
            changeFocusTo(noButtonref);
        } else if (event.key == "Escape") {
            onClose()
        }
    };

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
        }, 20);
    }

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        if (open) {
            changeFocusTo(noButtonref)
        }
    }, [open]);

    return (
        <div>
            <FocusLock>
                <div className={`modal ${open ? 'open' : ''}`} onClick={onClose}>
                    <div className="modal-for-yesno">
                        <div onClick={handleClickYesNoDialog} className="modal-content">

                            <div className="modal-body">
                                <p dangerouslySetInnerHTML={{ __html: message.replace(/\n/g, '<br>') }}></p>
                            </div>
                            <div className="modal-footer" style={{
                                justifyContent:"center"
                            }}>
                                <Button ref={noButtonref} onClick={onClose} color="primary">
                                    Okay
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </FocusLock>
        </div>
    );
}

export default InfoDialog;
