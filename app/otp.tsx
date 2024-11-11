import { View, Text, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaskInput from 'react-native-mask-input';
import { isClerkAPIResponseError, useSignIn, useSignUp } from '@clerk/clerk-expo';



const Page = () => {

    const [loading, setLoading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const router = useRouter();
    const keyboardVerticalOffset = Platform.OS === 'ios' ? 90 : 0;
    const { bottom } = useSafeAreaInsets()
    const { signUp, setActive } = useSignUp();
    const { signIn } = useSignIn();
    const openLink = () => { }

    const AO_PHONE = [`+`, '(', /\d/, /\d/, /\d/, ')', /\d/, /\d/, /\d/, '', /\d/, /\d/, /\d/, '', /\d/, /\d/, /\d/]

    const sendOpt = async () => {
        console.log('sendOTP', phoneNumber);
        setLoading(true);
        try {
            await signUp!.create({
                phoneNumber,
            });
            console.log('TESafter createT: ', signUp!.createdSessionId);

            signUp!.preparePhoneNumberVerification();

            console.log('after prepare: ');
            router.push(`/verify/${phoneNumber}`);
        } catch (err) {
            console.log('error', JSON.stringify(err, null, 2));

            if (isClerkAPIResponseError(err)) {
                if (err.errors[0].code === 'form_identifier_exists') {
                    // User signed up before
                    console.log('User signed up before');
                    await trySignIn();
                } else {
                    setLoading(false);
                    Alert.alert('Error', err.errors[0].message);
                }
            }
        }

    };

    const trySignIn = async () => {
        console.log('trySignIn', phoneNumber);

        const { supportedFirstFactors } = await signIn!.create({
            identifier: phoneNumber,
        });

        const firstPhoneFactor: any = supportedFirstFactors.find((factor: any) => {
            return factor.strategy === 'phone_code';
        });

        const { phoneNumberId } = firstPhoneFactor;

        await signIn!.prepareFirstFactor({
            strategy: 'phone_code',
            phoneNumberId,
        });

        router.push(`/verify/${phoneNumber}?signin=true`);
        setLoading(false);


    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }}>

            {loading && (<View style={[StyleSheet.absoluteFill, styles.loading]}>
                <ActivityIndicator size={'large'} color={Colors.primary} />
                <Text style={{ fontSize: 18, padding: 10 }}>Enviando o codigo...</Text>
            </View>)}


            <View style={styles.container}>

                <Text style={styles.description}>
                    Whatsapp will need to verify your account. Carrier charges might apply.
                </Text>

                <View style={styles.list}>
                    <View style={styles.listItem}>
                        <Text style={styles.listItemText}>Angola</Text>
                        <Ionicons name='chevron-forward' size={20} color={Colors.gray} />
                    </View>
                    <View style={styles.separator} />

                    <MaskInput
                        keyboardType='numeric'
                        autoFocus
                        placeholder='+244 teu numero'
                        style={styles.input}
                        value={phoneNumber}
                        onChangeText={(masked, unmasked) => {
                            setPhoneNumber(masked); // you can use the unmasked value as well

                            // assuming you typed "9" all the way:
                            // console.log(masked); // (99) 99999-9999
                            // console.log(unmasked); // 99999999999
                        }}
                        mask={AO_PHONE}
                    />


                </View>

                <Text style={styles.legal}>
                    You must be{' '}
                    <Text style={styles.link} onPress={openLink}>
                        at least 16 years old
                    </Text>{' '}
                    to register. Learn how WhatsApp works with the{' '}
                    <Text style={styles.link} onPress={openLink}>
                        Meta Companies
                    </Text>
                    .
                </Text>
                <View style={{ flex: 1 }} />
                <TouchableOpacity style={[styles.button, phoneNumber !== '' ? styles.enable : null, { marginBottom: bottom }]} disabled={phoneNumber === ''} onPress={sendOpt}>

                    <Text style={[styles.buttonText, phoneNumber !== '' ? styles.enable : null]}>
                        Next
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
        backgroundColor: Colors.backgorund,
        gap: 20
    },
    description: {
        fontSize: 14,
        color: Colors.gray,
    },
    list: {
        backgroundColor: '#fff',
        width: '100%',
        borderRadius: 10,
        padding: 10,
    },
    listItem: {

        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 6,
        marginBottom: 10,
    },
    listItemText: {
        fontSize: 14,
        color: Colors.primary
    },
    separator: {
        width: '100%',
        height: StyleSheet.hairlineWidth,
        backgroundColor: Colors.gray,
        opacity: 0.3,

    },
    link: {
        color: Colors.primary
    },
    legal: {
        fontSize: 12,
        textAlign: 'center',
        color: '#000',
    },
    button: {
        width: '100%',
        backgroundColor: Colors.lightGray,
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10
    },
    buttonText: {
        color: '#fff',
        fontWeight: '500',
        fontSize: 16,

    },
    enable: {
        backgroundColor: Colors.primary,
        color: '#fff',
    },
    input: {
        backgroundColor: '#fff',
        width: '100%',
        fontSize: 16,
        padding: 6,
        marginTop: 10,
    },
    loading: {
        zIndex: 10,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    }

})

export default Page