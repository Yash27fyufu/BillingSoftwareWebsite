export var gst_states_data = [
    { "STATE": "JAMMU AND KASHMIR", "TIN": "01", "STATECODE": "JK" },
    { "STATE": "HIMACHAL PRADESH", "TIN": "02", "STATECODE": "HP" },
    { "STATE": "PUNJAB", "TIN": "03", "STATECODE": "PB" },
    { "STATE": "CHANDIGARH", "TIN": "04", "STATECODE": "CH" },
    { "STATE": "UTTARAKHAND", "TIN": "05", "STATECODE": "UK" },
    { "STATE": "HARYANA", "TIN": "06", "STATECODE": "HR" },
    { "STATE": "DELHI", "TIN": "07", "STATECODE": "DL" },
    { "STATE": "RAJASTHAN", "TIN": "08", "STATECODE": "RJ" },
    { "STATE": "UTTAR PRADESH", "TIN": "09", "STATECODE": "UP" },
    { "STATE": "BIHAR", "TIN": "10", "STATECODE": "BR" },
    { "STATE": "SIKKIM", "TIN": "11", "STATECODE": "SK" },
    { "STATE": "ARUNACHAL PRADESH", "TIN": "12", "STATECODE": "AR" },
    { "STATE": "NAGALAND", "TIN": "13", "STATECODE": "NL" },
    { "STATE": "MANIPUR", "TIN": "14", "STATECODE": "MN" },
    { "STATE": "MIZORAM", "TIN": "15", "STATECODE": "MZ" },
    { "STATE": "TRIPURA", "TIN": "16", "STATECODE": "TR" },
    { "STATE": "MEGHALAYA", "TIN": "17", "STATECODE": "ML" },
    { "STATE": "ASSAM", "TIN": "18", "STATECODE": "AS" },
    { "STATE": "WEST BENGAL", "TIN": "19", "STATECODE": "WB" },
    { "STATE": "JHARKHAND", "TIN": "20", "STATECODE": "JH" },
    { "STATE": "ODISHA", "TIN": "21", "STATECODE": "OD" },
    { "STATE": "CHATTISGARH", "TIN": "22", "STATECODE": "CG" },
    { "STATE": "MADHYA PRADESH", "TIN": "23", "STATECODE": "MP" },
    { "STATE": "GUJARAT", "TIN": "24", "STATECODE": "GJ" },
    { "STATE": "DADRA & NAGAR HAVELI AND DAMAN & DIU", "TIN": "26", "STATECODE": "DN" },
    { "STATE": "MAHARASHTRA", "TIN": "27", "STATECODE": "MH" },
    { "STATE": "KARNATAKA", "TIN": "29", "STATECODE": "KA" },
    { "STATE": "GOA", "TIN": "30", "STATECODE": "GA" },
    { "STATE": "LAKSHADWEEP ISLANDS", "TIN": "31", "STATECODE": "LD" },
    { "STATE": "KERALA", "TIN": "32", "STATECODE": "KL" },
    { "STATE": "TAMIL NADU", "TIN": "33", "STATECODE": "TN" },
    { "STATE": "PONDICHERRY", "TIN": "34", "STATECODE": "PY" },
    { "STATE": "ANDAMAN AND NICOBAR ISLANDS", "TIN": "35", "STATECODE": "AN" },
    { "STATE": "TELANGANA", "TIN": "36", "STATECODE": "TS" },
    { "STATE": "ANDHRA PRADESH", "TIN": "37", "STATECODE": "AD" },
    { "STATE": "LADAKH", "TIN": "38", "STATECODE": "LA" },
    { "STATE": "OTHER TERRITORY", "TIN": "97", "STATECODE": "OT" }
  ].sort(customSort);

export function getStateNamefromGST(twoDigits) {
    const state = gst_states_data.find(state => state.TIN == twoDigits);
    return state ? state.STATE : "State not found";
}

export function getGSTinfromState(stateName) {
    const state = gst_states_data.find(state => state.STATE == stateName);
    return state ? state.TIN : null;
}

function customSort(a, b, key="STATE") {
    const valueA = a[key].toLowerCase();
    const valueB = b[key].toLowerCase();
    
    return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
}