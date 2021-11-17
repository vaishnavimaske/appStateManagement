import CryptoJS from "react-native-crypto-js";
// import Config from "react-native-config";
ENC_KEY = "somekey";
const { AES, enc } = CryptoJS;
export const encryptData = (data, dataTypeObj = false) => {
    const encData = (dataTypeObj === true) ? JSON.stringify(data) : data.toString();
    return encodeURIComponent(AES.encrypt(encData, ENC_KEY).toString());
}

export const decryptData = async (data, dataTypeObj = false) => {
    try {
        const decodeData = decodeURIComponent(data);
        const bytes = AES.decrypt(decodeData, ENC_KEY);
        const { words } = bytes;
        if(words.length < 1) return false;
        const decData = bytes.toString(enc.Utf8);
        if(dataTypeObj === true) return await JSON.parse(decData);
        return decData;
    } catch (e) {
        console.log(e, 'err');
        return false;
    }
}

export const checkDataIsValid = (data) => {
    if(data !== null && data !== undefined && data !== ''){
        return true;
    }
    return false;
}

export const tokenExpiredError = 'TokenExpiredError';

// Speed up calls to hasOwnProperty
let hasOwnProperty = Object.prototype.hasOwnProperty;

export const isEmpty = (obj) => {

    // null and undefined are "empty"
    if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;

    // If it isn't an object at this point
    // it is empty, but it can't be anything *but* empty
    // Is it empty?  Depends on your application.
    if (typeof obj !== "object") return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
}
