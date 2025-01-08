import { makeApiCall } from "../functions/ApiCallGateway";


function checkCharsinInteger(temp, allowDecimal, allowNegative) {
  // this function checks for each character for better working rather than just last character
  let result = '';

  for (let i = 0; i < temp.length; i++) {
    const char = temp[i];

    if (!/[0-9]/.test(char)) {
      if (!allowDecimal && char === ".") {
        continue;
      }

      if (!allowNegative && char === "-") {
        continue;
      }

      if (char !== "." && char !== "-") {
        continue;
      }
    }

    result += char;
  }

  return result;
}

export function parseString(str) {
  if (str == null || str == undefined) {
    return ""
  } else {
    return str.toString()
  }
}

export function compareStrings(strA, strB, matchcase = false){
  if(matchcase){
    return strA == strB
  }else{
    return convertToUpperCase(strA) == convertToUpperCase(strB)
  }
}

export function convertToUpperCase(str) {
  if (!str) {
    return ""
  }
  let result = "";
  for (let i = 0; i < str.length; i++) {
    let charCode = str.charCodeAt(i);
    if (charCode >= 97 && charCode <= 122) {
      // Convert lowercase letters to uppercase by subtracting 32 from their character code
      result += String.fromCharCode(charCode - 32);
    } else {
      result += str.charAt(i);
    }
  }
  return result;
}

export function parseInteger(temptextvar, minValueforNumber = -10000000000, maxValueforNumber = 10000000000, prefixZeroAllowed = false, allowNegative = false, allowDecimal = false) {

  let temp = parseString(temptextvar);

  if (temp == "0" || temp.trim() == "" || !temp) {
    return 0
  }

  temp = checkCharsinInteger(temp, allowDecimal, allowNegative)

  if (temp.includes("-")) {
    if (temp === "-") {
      return "-";
    } else if (temp === "-.") {
      return "-0."
    } else if (temp.lastIndexOf("-") > 0) {
      if (temp == "0-") {
        return "-"
      }
      return temp.slice(0, temp.lastIndexOf("-"));
    }
  }

  if (temp.includes(".")) {

    if (temp === "." || temp === "0.") {
      return "0.";
    }
    if (temp.split(".").length > 2) {
      // Ignore the second dot
      return temp.slice(0, -1);
    }
    if (temp.slice(temp.indexOf(".") + 1).length > 2) {
      // Limit decimal places to 2
      return temp.slice(0, temp.indexOf(".") + 3);
    }
  }

  if (temp == null || temp === "") {
    return "";
  }

  if (prefixZeroAllowed) {
    if (parseFloat(temp) > maxValueforNumber) {
      return temp.slice(0, -1);
    }
  } else {
    if (parseFloat(temp) > maxValueforNumber) {
      temp = Math.floor(temp / 10);  // Return the previous valid value
    }

    if (parseFloat(temp) < minValueforNumber) {
      temp = minValueforNumber;
    }

    if (parseFloat(temp) / 10 == 0) {
      temp = "0"
    }
  }


  // Finally return the result
  return temp;
}

export function roundOffIntegers(decinum, withDecimal = true) {
  if (withDecimal) {
    if (parseInt(decinum * 100) == 0) { //if num is too small like 0.009999
      return 0;
    }
    var temnum = (Math.round(decinum * 100)) / 100;
    return /*isNaN(temnum) ? 0 : */ temnum;

  } else {

    var temnum = (Math.ceil(decinum));
    return temnum;
  }


}

export function findIndexUsingItemName(listOfDicts, valueToMatch, parameterNamesToLookFor) {

  if (!valueToMatch) {
    // if the value is empty 
    return []
  }

  if (!parameterNamesToLookFor || parameterNamesToLookFor.length === 0) {
    // If parameterNamesToLookFor is empty, search across all keys
    return listOfDicts.filter(obj =>
      Object.keys(obj).some(key =>
      (typeof valueToMatch === "string"
        ? convertToUpperCase(obj[key]) === convertToUpperCase(valueToMatch)
        : obj[key] === valueToMatch)
      )
    );
  }

  if (typeof parameterNamesToLookFor === "string") {
    // If parameterNamesToLookFor is a string, convert it to an array
    parameterNamesToLookFor = [parameterNamesToLookFor];
  }

  if (typeof (valueToMatch) == "string") {
    // Search only within the specified keys

    return listOfDicts.filter(obj =>
      parameterNamesToLookFor.some(param => convertToUpperCase(obj[param]) === convertToUpperCase(valueToMatch))
    );
  } else {
    return listOfDicts.filter(obj =>
      parameterNamesToLookFor.some(param => obj[param] === valueToMatch)
    );
  }
}

export function matchPattern(text, pattern, onlyCaps = true) {
  for (let i = 0; i < pattern.length; i++) {
    if (i >= text.length) {
      break;
    }

    const textChar = text[i];
    const patternChar = pattern[i];

    switch (patternChar) {
      case 'n':
        if (!isNaN(parseInt(textChar))) {
          continue;
        } else {
          return false;
        }
      case 'a':
        if (textChar.match(/[a-zA-Z]/)) {
          continue;
        } else {
          return false;
        }
      case '*':
        continue;
      default: // if pattern has some character other than above 
        continue;
    }
  }

  // If the loop completes without any mismatches, return true
  return true;
}

export async function getLastBillNumber(tableName, billYear = new Date().getFullYear() + (new Date().getMonth() < 4 ? -1 : 0), billSeriesId) {
  const response = await makeApiCall('/api/sales/getlastbillnum', {
    tableName: tableName,
    billYear: billYear,
    billSeriesId: billSeriesId,
  });
  const data = response;
  if (data.error) {
    console.error("Problem in getting last bill number.");

  } else {
    return data.result;

  }
}

export function convertToDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0'); // Adds leading zero for day
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Adds leading zero for month (months are 0-indexed)
  const year = date.getFullYear();
  
  return `${day}-${month}-${year}`; // Format as DD-MM-YYYY
}

export function compareDates(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  if (d1 < d2) {
      return -1; // date1 is earlier than date2
  } else if (d1 > d2) {
      return 1; // date1 is later than date2
  } else {
      return 0; // date1 is equal to date2
  }
}




