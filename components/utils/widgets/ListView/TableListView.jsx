import React, { useState } from "react";
import PropTypes from "prop-types";

const DataTable = ({ data, fields, columnWidths, menuOptions }) => {
  if (!data || !data.length || !fields || !fields.length) {
    return <p>No data available</p>;
  }

  // Calculate total width and adjustment factor
  const totalWidth = fields.reduce(
    (sum, field) => sum + (columnWidths?.[field] || 0),
    0
  );
  const adjustmentFactor = totalWidth !== 100 ? 100 / totalWidth : 1;

  // Adjust column widths proportionately
  const adjustedColumnWidths = fields.reduce((acc, field) => {
    acc[field] = (columnWidths?.[field] || 0) * adjustmentFactor;
    return acc;
  }, {});

  const handleOptionClick = (option, rowIndex) => {
    if (option.onClick) {
      option.onClick(rowIndex); // Call the function associated with the menu option
    }
  };

  return (
    <table
      style={{
        borderCollapse: "collapse",
        width: "100%",
        tableLayout: "fixed", // Ensures fixed column widths
      }}
    >
      <thead>
        <tr>
          {fields.map((field, index) => (
            <th
              key={index}
              style={{
                border: "1px solid #ddd",
                padding: "8px",
                backgroundColor: "#f2f2f2",
                width: `${adjustedColumnWidths[field]}%`,
                textAlign: "left",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {field.toUpperCase()}
            </th>
          ))}
          <th
            style={{
              border: "1px solid #ddd",
              padding: "8px",
              backgroundColor: "#f2f2f2",
              width: "50px",
              textAlign: "center",
            }}
          >
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((value, colIndex) => (
              <td
                key={colIndex}
                style={{
                  border: "1px solid #ddd",
                  padding: "8px",
                  width: `${adjustedColumnWidths[fields[colIndex]]}%`,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={value || ""}
              >
                {value}
              </td>
            ))}
            <td
              style={{
                border: "1px solid #ddd",
                padding: "8px",
                textAlign: "center",
                position: "relative",
              }}
            >
              <DropdownMenu
                options={menuOptions}
                onOptionSelect={(option) => handleOptionClick(option, rowIndex)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const DropdownMenu = ({ options, onOptionSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "5px",
          fontSize: "16px",
        }}
        aria-label="Menu"
      >
        &#x2022;&#x2022;&#x2022;
      </button>
      {isOpen && (
        <ul
          style={{
            position: "absolute",
            top: "100%",
            right: "0",
            listStyle: "none",
            margin: 0,
            padding: "10px",
            background: "#fff",
            border: "1px solid #ddd",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            borderRadius: "4px",
            zIndex: 10,
          }}
        >
          {options.map((option, index) => (
            <li
              key={index}
              style={{
                padding: "5px 10px",
                cursor: "pointer",
                borderBottom: index < options.length - 1 ? "1px solid #ddd" : "none",
                whiteSpace: "nowrap",
              }}
              onClick={() => {
                onOptionSelect(option);
                setIsOpen(false);
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

DropdownMenu.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func,
    })
  ).isRequired,
  onOptionSelect: PropTypes.func.isRequired,
};

DataTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.array).isRequired,
  fields: PropTypes.arrayOf(PropTypes.string).isRequired,
  columnWidths: PropTypes.object, // Optional prop for column widths
  menuOptions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func,
    })
  ).isRequired,
};

export default DataTable;
