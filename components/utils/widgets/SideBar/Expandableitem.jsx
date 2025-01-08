import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { event } from 'jquery';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';


const ExpandableItem = ({
  highlightThis = false,
  title,
  options = ['Option 1', 'Option 2', 'Option 3'],
  handleOptionClick
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();


  const toggleExpansion = (event) => {
    // Use currentTarget to always reference the div with the onClick handler
    const text = event.currentTarget.textContent.trim();

    switch (text) {
      case "Sales":
        if (router.pathname !== "/sales/invoice/view") {
          router.push("/sales/invoice/view");
        }
        break;
      case "Purchase":
        if (router.pathname !== "/purchase/invoice/view") {
          router.push("/purchase/invoice/view");
        }
        break;
      default:
        break;
    }

    setIsExpanded((prev) => !prev);
  };


  useEffect(() => {
    if (highlightThis) {
      setIsExpanded(true)
    }
  }, [highlightThis])

  return (
    <div className="expandable-item">
      
      <div className={`item-header expandable-link ${highlightThis ? 'active' : ''}`} onClick={toggleExpansion}>
        {title}
        <FontAwesomeIcon
          icon={faCaretDown}
          style={{ marginLeft: "1vh" }}
          className="custom-icon"
        />
      </div>


      {isExpanded && (
        <div className="options">
          {options.map((option, index) => (
            <div
              className="option expandable-link"
              key={index}
              onClick={() => handleOptionClick(index)}
              style={{ marginLeft: "2vh" }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );

};

export default ExpandableItem;

