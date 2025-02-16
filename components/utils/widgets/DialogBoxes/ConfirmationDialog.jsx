import { Button } from '@mui/material';
import React, { useEffect, useRef } from 'react';
import FocusLock from 'react-focus-lock';

function ConfirmationDialog({ open, onClose, onConfirm, message }) {

    const yesButtonref = useRef(null);
    const noButtonref = useRef(null);

    const handleClickYesNoDialog = (event) => {
        changeFocusTo(yesButtonref)
    }

    const handleKeyDown = (event) => {
        if (event.key === 'ArrowLeft') {
            changeFocusTo(noButtonref);
        } else if (event.key === 'ArrowRight') {
            changeFocusTo(yesButtonref);
        } else if (event.key == "Escape") {
            onClose()
        }
    };

    function handleClickOutside(event) {
        if (!event.target.closest('.modal-content')) {
            onClose();
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
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        if (open) {
            changeFocusTo(yesButtonref)
        }
    }, [open]);

    return (
        <div>
            <FocusLock>
                <div className={`modal ${open ? 'open' : ''}`}>
                    <div className="modal-for-yesno">
                        <div onClick={handleClickYesNoDialog} className="modal-content">

                            <div className="modal-body">
                                <p dangerouslySetInnerHTML={{ __html: message.replace(/\n/g, '<br>') }}></p>
                            </div>
                            <div className="modal-footer">
                                <Button ref={noButtonref} onClick={onClose} color="primary">
                                    No
                                </Button>
                                <Button ref={yesButtonref} onClick={onConfirm} color="primary">
                                    Yes
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </FocusLock>
        </div>
    );
}

export default ConfirmationDialog;
