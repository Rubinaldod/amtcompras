import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Stack, useLocalSearchParams } from 'expo-router'
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field'
import Colors from '@/constants/Colors'
import { isClerkAPIResponseError, useSignIn, useSignUp } from '@clerk/clerk-expo'
const CELL_COUNT = 6;
const Page = () => {

    const { phone, signin } = useLocalSearchParams<{ phone: string, signin: string }>();
    const [code, setCode] = useState('');

    const { signUp, setActive } = useSignUp();
    const { signIn } = useSignIn();
    //console.log(phone)

    const ref = useBlurOnFulfill({ value: code, cellCount: CELL_COUNT })
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        value: code,
        setValue: setCode,
    });

    useEffect(() => {
        if (code.length === 6) {
            console.log('code', code);
            if (signin === 'true') {
                veryifySignIn()
            } else {
                verifyCode()
            }

        }
    }, [code])

    const resendCode = async () => {
        try {
            if (signin === 'true') {
                const { supportedFirstFactors } = await signIn!.create({
                    identifier: phone,
                });

                const firstPhoneFactor: any = supportedFirstFactors.find((factor: any) => {
                    return factor.strategy === 'phone_code';
                });

                const { phoneNumberId } = firstPhoneFactor;

                await signIn!.prepareFirstFactor({
                    strategy: 'phone_code',
                    phoneNumberId,
                });
            } else {
                await signUp!.create({
                    phoneNumber: phone,
                });
                signUp!.preparePhoneNumberVerification();
            }
        } catch (err) {
            console.log('error', JSON.stringify(err, null, 2));
            if (isClerkAPIResponseError(err)) {
                Alert.alert('Error', err.errors[0].message);
            }
        }
    };

    const verifyCode = async () => {
        try {
            await signUp!.attemptPhoneNumberVerification({
                code,
            });

            await setActive!({ session: signUp!.createdSessionId });
        } catch (err) {
            console.log('error', JSON.stringify(err, null, 2));
            if (isClerkAPIResponseError(err)) {
                Alert.alert('Error', err.errors[0].message);
            }
        }
    };

    const veryifySignIn = async () => {
        try {
            await signIn!.attemptFirstFactor({
                strategy: 'phone_code',
                code,
            });

            await setActive!({ session: signIn!.createdSessionId });
        } catch (err) {
            console.log('error', JSON.stringify(err, null, 2));
            if (isClerkAPIResponseError(err)) {
                Alert.alert('Error', err.errors[0].message);
            }
        }
    };


    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerTitle: phone }} />
            <Text style={styles.legal}>We have sent you an SMS with a code to the number above.</Text>
            <Text style={styles.legal}>
                To complete your phone number verification, please enter the 6-digit activation code.
            </Text>

            <CodeField
                ref={ref}
                {...props}
                // Use `caretHidden={false}` when users can't paste a text value, because context menu doesn't appear
                value={code}
                onChangeText={setCode}
                cellCount={CELL_COUNT}
                rootStyle={styles.codeFieldRoot}
                keyboardType="number-pad"
                textContentType="oneTimeCode"

                testID="my-code-input"
                renderCell={({ index, symbol, isFocused }) => (
                    <View
                        key={index}
                        style={[styles.cellRoot, isFocused && styles.focusCell]}
                        onLayout={getCellOnLayoutHandler(index)}>
                        <Text style={styles.cellText}>
                            {symbol || (isFocused ? <Cursor /> : null)}

                        </Text>
                    </View>
                )}
            />

            <TouchableOpacity onPress={resendCode}>
                <Text style={styles.buttonText}>
                    Didn't recieve a code?
                </Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    button: {
        width: '100%',
        alignItems: 'center'
    },
    buttonText: {
        fontSize: 18,
        marginTop: 10,
        color: Colors.primary,
    },
    legal: {
        fontSize: 14,
        textAlign: 'center',
        color: '#000'
    },
    codeFieldRoot: {
        marginTop: 20,
        width: 260,
        marginLeft: 'auto',
        marginRight: 'auto',
        gap: 10
    },
    cellRoot: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
    },
    cellText: {
        color: '#000',
        fontSize: 36,
        textAlign: 'center'
    },
    focusCell: {
        padding: 4,
        borderColor: '#000',
        borderBottomWidth: 2
    }

})

export default Page