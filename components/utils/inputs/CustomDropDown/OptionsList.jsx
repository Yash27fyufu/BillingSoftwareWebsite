import React from 'react';

const OptionsList = ({
    showDiv,
    anySpecificStyle = "regular",
    listDivWidth,
    listDivHeight,
    highlightedIndex,
    handleItemClick,
    filteredValuesFetched
}) => {
    if (!showDiv) return null;

    const renderRegularStyle = () => (
        filteredValuesFetched.map((item, index) => (
            <div
                key={index}
                title={item}
                className={`dropdownbox-list_item ${highlightedIndex === index ? 'dropdownbox-list_item_highlighted' : ''} no_select_text`}
                onClick={() => handleItemClick(item)}
                style={{
                    minWidth: `calc(${listDivWidth} - 1.8vw)`,
                    textAlign:"left",
                    fontSize:"13px",
                }}
            >
                {item}
            </div>
        ))
    );

    const renderDefaultStyle = () => (
        <p>Please assign some content</p>
    );

    const content = anySpecificStyle === "regular" ? renderRegularStyle() : renderDefaultStyle();

    return (
        <div
            className="dropdownbox-list_div"
            style={{
                minWidth: `calc(${listDivWidth} + 1.8vw)`,
                maxHeight: listDivHeight,
            }}
        >
            {content}
        </div>
    );
};

export default OptionsList;
