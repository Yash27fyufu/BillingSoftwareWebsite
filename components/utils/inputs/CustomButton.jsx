import React, { useState } from 'react';

function CustomButton({
    onClick = null,
    label = 'Click Me',
    className = '',
    buttonWidth = '14vw',
    buttonHeight = '4.5vh',
    fontSize = '1.9vh',
    tabIndex = 0,
    buttonRef,
}) {
    const [isHovered, setIsHovered] = useState(false);

    const handleKeyPress = (event) => {
        if (
            (event.key === 'Enter' || event.key === 'Space') &&
            !event.ctrlKey &&
            !event.altKey &&
            !event.shiftKey
        ) {
            event.preventDefault();
            if (onClick) {
                onClick();
            }
        }
    };

    const containerStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    };

    const buttonStyle = {
        textDecoration: 'none',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '1px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        borderRadius: '1.5vh',
        border: '1px solid black',
        minWidth: '120px',
        // minHeight: '30px',
        height: buttonHeight,
        lineHeight: buttonHeight,
        width: buttonWidth,
        backgroundColor: isHovered ? 'var(--secondary-background-color)' : 'var(--primary-light-background-color)',
        color: isHovered ? 'var(--secondary-text-color)' : 'var(--primary-text-color)',
        cursor: isHovered ? 'pointer' : 'default',
        boxShadow: isHovered ? '0 2px 3px 0 var(--primary-background-color)' : '0 1px 3px 0 var(--secondary-light-background-color)',
        fontSize: isHovered ? `calc(${fontSize} + 1px)` : fontSize,
        transform: isHovered ? 'scale(1.05)' : 'scale(1)', // Scale horizontally
        transformOrigin: 'center', // Ensure the center stays fixed during scaling
        transition: 'transform 0.2s ease-in-out', // Smooth transition for scaling
    };

    return (
        <div style={containerStyle}>
            <a
                ref={buttonRef}
                className={`custombutton no_select_text ${className}`}
                onClick={onClick}
                onKeyDown={handleKeyPress}
                tabIndex={tabIndex}
                style={buttonStyle}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {label}
            </a>
        </div>
    );
}

export default CustomButton;
