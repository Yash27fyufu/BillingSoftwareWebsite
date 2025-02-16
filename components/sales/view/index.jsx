import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { convertToDate } from '../../utils/global/commonfrontendfuncs';
import DateRangeSelection from '../../utils/widgets/DateRange/DateRangeSelection';
import DataTable from '../../utils/widgets/ListView/TableListView';
import Sidebar from '../../utils/widgets/SideBar/SideNavBar';

function SalesView(data) {
    const router = useRouter();
    const [fromDate, setFromDate] = useState();
    const [toDate, setToDate] = useState();

    function handleSetFromDate(value) {
        setFromDate(value);
    }

    function handleSetToDate(value) {
        setToDate(value);
    }

    useEffect(() => {
        // If there's an error passed from the server-side, clear localStorage and redirect
        if (router.query.error) {
            localStorage.clear();
            router.push('/');
        }
    }, [router.query.error]);

    const jsonData = data.data;

    // Internal field names from the data (for reference in the table rows)
    const fields = [
        "BILL NUMBER",
        "BILL_DATE",
        "BILLING NAME",
        "TOTAL",
        "AMOUNT PAID",
        "BALANCE"
    ];

    // Column widths - these are percentages of width for each column 10 means 10% 
    // (total adjusted proportionately in tableListView)

    const columnWidths = {
        'BILL NUMBER': 5,
        'BILL_DATE': 5,
        'BILLING NAME': 20,
        'PARTY_NAME': 10,
        'TOTAL': 5,
        'AMOUNT PAID': 5,
        'BALANCE': 5,
        "Actions": 5,
    };

    // Creating rowValues using a for loop
    const rowValues = [];
    for (let i = 0; i < jsonData.length; i++) {
        const item = jsonData[i];
        rowValues.push([
            item.BILL_SERIES + "" + item.BILL_NUMBER,
            convertToDate(item.BILL_DATE),
            item.BILLING_NAME,
            item.TOTAL,
            item.AMOUNT_SETTLED ?? 0,
            item.TOTAL - item.AMOUNT_SETTLED,
        ]);
    }









    // change the menu view such that if clicked somewhere else it must be closed
    //                       or
    // use the dialog but change the size and make it reusable









    const menuOptions = [
        { label: "Edit", onClick: (rowIndex) => console.log(`Edit row ${rowIndex}`) },
        { label: "Delete", onClick: (rowIndex) => console.log(`Delete row ${rowIndex}`) },
    ];

    return (
        <div>
            <Sidebar highlightItem='sales' />
            <div className='content'>
                <div style={{ display: "flex", borderRadius: '10px', borderWidth: '2px', borderStyle: 'solid' }}>
                    <DateRangeSelection
                        fromDate={fromDate}
                        handlesetfromDate={handleSetFromDate}
                        toDate={toDate}
                        handlesettoDate={handleSetToDate}
                        showRadioButtons={true}
                    />
                </div>
                <div style={{ height: "1rem" }} />
                <DataTable data={rowValues} fields={fields} columnWidths={columnWidths} menuOptions={menuOptions}
                />
            </div>
        </div>
    );
};

export default SalesView;
