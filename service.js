// import Config from "react-native-config";
import Axios from 'axios';
import { checkDataIsValid, tokenExpiredError } from '../utils/secure';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules } from "react-native";
const BASE_URL = 'https://';

const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
}
let GuestApi = Axios.create({
    baseURL: `${BASE_URL}`,
    headers: headers,
    timeout: 5000,
});

let AuthApi = Axios.create({
    baseURL: `${BASE_URL}`,
    headers: headers,
    //   timeout: 10000,
});

// Set JSON Web Token in Client to be included in all calls
const setClientToken = (token) => {
    AuthApi.interceptors.request.use(function (config) {
        config.headers.Authorization = `Bearer ${token}`;
        return config;
    });
};

AuthApi.interceptors.response.use((response) => {
    // console.log("################# response - response #############");
    // console.log(response);
    // console.log("#################  response - response #############");
    return response
}, async function (error) {
    let originalRequest = error.config;

    const { response: errRes } = error;
    const { status, data } = errRes;

    if (status === 401 && checkDataIsValid(data) && Object.keys(data).length && checkDataIsValid(data.error)) {
        const { name } = data.error;
        if (name === tokenExpiredError && !originalRequest._retry) {
            originalRequest._retry = true;
            const userData = await AsyncStorage.getItem('user_data');
            const userRefLocalStorage = await JSON.parse(userData);
            const { user_refresh_token_id, refresh_token } = userRefLocalStorage.token;
            const sendData = {
                user_refresh_token_id, refresh_token
            }
            try {
                const tokenResponse = await GuestApi.post(`token`, sendData);
                const { status: ref_status, data: ref_data } = tokenResponse;
                if (ref_status === 201 && ref_data.status) {
                    const { accessToken } = ref_data;
                    originalRequest.headers['Authorization'] = `bearer ${accessToken}`;
                    setClientToken(accessToken);
                    let upData = userRefLocalStorage;
                    upData.token.access_token = accessToken;
                    await AsyncStorage.setItem('user_data', JSON.stringify(upData));
                    return Axios(originalRequest);
                }
            } catch (e) {
                // logout here
                console.log("Logout as refresh token also expired!!!!!");
                await AsyncStorage.removeItem('user_data');
                await NativeModules.DevSettings.reload();
                return Promise.reject(e);
            }
        }
        return Promise.reject(error);
    }

    return Promise.reject(error);
});

// AuthApi.interceptors.request.use(
//     config => {
//         console.log("################# request - config #############");
//         console.log(config);
//         console.log("################# request - config #############");
//         return config;
//     },
//     error => {
//         console.log("################# request error #############");
//         console.log(error);
//         console.log("################# request error #############");
//         return Promise.reject(error);
//     }
// );

// GuestApi.interceptors.request.use(
//     config => {
//         console.log("################# request - config #############");
//         console.log(config);
//         console.log("################# request - config #############");
//         return config;
//     },
//     error => {
//         console.log("################# request error #############");
//         console.log(error);
//         console.log("################# request error #############");
//         return Promise.reject(error);
//     }
// );

// GuestApi.interceptors.response.use((response) => {
//     console.log("################# response - response #############");
//     console.log(response);
//     console.log("#################  response - response #############");
//     return response;
// }, async function (error) {
//     console.log("################# response error #############");
//     console.log(error);
//     console.log("################# response error #############");
//     return Promise.reject(error);
// });

export { BASE_URL, GuestApi, AuthApi, setClientToken };
