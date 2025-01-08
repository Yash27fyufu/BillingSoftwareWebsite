
import Axios from 'axios';

export async function makeApiCall(url, data, type = "databaseTransaction") {
  try {
    if (!checkData(data)) {
      return { error: "Incomplete data sent" }
    }
    data.token = localStorage .getItem("usertoken");  // use this token in every api to first verify the validity of the request
    const response = await Axios.post(url, data);
    return response.data;
  } catch (error) {
    throw error;
  }
}

function checkData(){
return true
}


// add transaction checkpoint, rollback & commit properly either in the server side 
// or have it as api calls and then make those call from here by directly using Axios and calling those functions
// 2nd method will create 3 files for each kind of transaction


