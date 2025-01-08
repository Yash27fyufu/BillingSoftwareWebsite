import React from 'react';

const ConditionalList = ({ showDiv, anySpecificStyle = "", listDivWidth, listDivHeight, selectedItem, highlightedIndex, handleItemClick, filteredValuesFetched, keytoChooseinList, addWhatText }) => {
    if (!showDiv) return null;
    let content;
    switch (anySpecificStyle) {
        // specific styles like showing many details alongside in each row
        case "":
            content = (
                <>
                    {
                    addWhatText
                     && 
                    <div
                    id="ConditionalList"
                        title={selectedItem.trim() != "" ? `Add "${selectedItem}"` : `Add ${addWhatText}`}
                        className={(highlightedIndex === -1 ? "autocomplete-list_item_highlighted" : "autocomplete-list_item") + " no_select_text"}
                        onClick={() => handleItemClick(selectedItem, "ADD_NEW")}
                        style={{
                            minWidth: `calc(${listDivWidth} - 1.8vw)`,
                        }}
                    >
                        {selectedItem.trim() != "" ? `Add "${selectedItem}"` : `Add ${addWhatText}`}
                    </div>}
                    {filteredValuesFetched.map((item, index) => (
                        <div
                            title={keytoChooseinList ? item[keytoChooseinList] : item}
                            key={index}
                            className={(highlightedIndex === index ? "autocomplete-list_item_highlighted" : "autocomplete-list_item") + " no_select_text"}
                            onClick={() => handleItemClick(item)}
                            style={{
                                minWidth: `calc(${listDivWidth} - 1.8vw)`,
                            }}
                        >
                            {item[keytoChooseinList] ? item[keytoChooseinList] : item}
                        </div>
                    ))}
                </>
            );
            break;
        default:
            content = (
                <>
                    <p>
                        please assign some content
                    </p>
                </>
            );
            break;
    }

    return (
        <div className="autocomplete-list_div" style={{
            minWidth: listDivWidth,
            maxWidth: listDivWidth,
            maxHeight: listDivHeight,
        }}>
            {content}
        </div>
    );
};

export default ConditionalList;
