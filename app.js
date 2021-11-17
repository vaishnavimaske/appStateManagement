import React, { useEffect, useState, useReducer } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import actions from './state/actions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './context/context';
import { setClientToken } from './services/index';

import Splash from './src/Splash';
import NewLogin from './src/NewLogin';
import Registration from './src/Registration';

const Stack = createStackNavigator();

export default function App() {

    const initialState = {
        isAuthenticated: false,
        user: {
            email_id: null,
            first_name: null,
            id: null,
            last_name: null,
            mobile_no: null,
            ...(other values/key)
        },
        token: {
            access_token: null,
            refresh_token: null,
            role: null,
            user_refresh_token_id: null,
        }
    };

    const updateAsynData = async (upData, logout = false) => {
        try {
            if (logout) {
                await AsyncStorage.removeItem('user_data');
                return;
            }
            await AsyncStorage.setItem('user_data', JSON.stringify(upData));
        } catch (e) {
            console.log(e, 'err');
        }
    };

    const reducer = (prevState, action) => {
        let newState;
        switch (action.type) {
            case actions.SIGN_IN:
                const { user, token } = action.payload;
                newState = {
                    ...prevState,
                    user: {
                        aadhar: user.aadhar,
                        email_id: user.email_id,
                        first_name: user.first_name,
                        id: user.id,
                        last_name: user.last_name,
                        mobile_no: user.mobile_no,
                        ....(other values/keys)
                    },
                    token: {
                        access_token: token.access_token,
                        refresh_token: token.refresh_token,
                        role: token.role,
                        user_refresh_token_id: token.user_refresh_token_id,
                    },
                    isAuthenticated: true
                };
                updateAsynData(newState);
                return newState;

            case actions.SIGN_OUT:
                newState = {
                    ...initialState,
                };
                updateAsynData(newState, true);
                return newState;
        }
        return prevState;
    };

    const [state, dispatch] = useReducer(reducer, initialState);

    const authContext = React.useMemo(() => ({
        signIn: (data) => {
            dispatch({
                type: actions.SIGN_IN,
                payload: { ...data },
            });
        },
        signOut: () => {
            dispatch({
                type: actions.SIGN_OUT
            });
        }
    }), [state]);

    const authValue = React.useMemo(
        () => ({
            appState: state,
            authContext: authContext,
            dispatch: dispatch,
        }),
        [state],
    );

    return (
        <AuthContext.Provider value={authValue}>
            <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerTitleAlign: 'center' }}>
                    {!state.isAuthenticated && (
                        <>
                            <Stack.Screen
                                name="Splash"
                                component={Splash}
                                options={{
                                    header: () => null,
                                }}
                            />
                            <Stack.Screen
                                name="Registration"
                                component={Registration}
                                options={{
                                    title: 'Registration',
                                    headerStyle: {
                                        backgroundColor: '#FFFFFF',
                                    },
                                    headerTintColor: '#841526',
                                    headerTitleStyle: {
                                        fontSize: 18,
                                        fontFamily: 'Rubik-Regular',
                                    },
                                    headerLeft: null,
                                }}
                            />
                            <Stack.Screen
                                name="Registerdsa"
                                component={Registerdsa}
                                options={{
                                    title: 'DSA Agent Registration',
                                    headerStyle: {
                                        backgroundColor: '#FFFFFF',
                                    },
                                    headerTintColor: '#841526',
                                    headerTitleStyle: {
                                        fontSize: 18,
                                        fontFamily: 'Rubik-Regular',
                                    },
                                }}
                            />
                          ....(other stack screens)
                    )}
                </Stack.Navigator>
            </NavigationContainer>
        </AuthContext.Provider>
    );
}
