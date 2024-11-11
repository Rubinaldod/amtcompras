import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import welcomeImage from '@/assets/images/welcome.png';
import Colors from '@/constants/Colors';
import { Slot, Link } from 'expo-router';

const welcome_image = Image.resolveAssetSource(welcomeImage).uri;

const Page = () => {
    const openLink = () => {
        console.log('pressed')
    }

    return (
        <View style={styles.container}>
            <Image source={{ uri: welcome_image }} style={styles.welcome} />
            <Text style={styles.headline}>Welcome to the whatsapp clone</Text>
            <Text style={styles.description}>
                Read our{' '}
                <Text style={styles.links} onPress={openLink}> Privacy Policy </Text>
                . {'Tap "Agree & Continue" to accept the '}

                <Text style={styles.links} onPress={openLink}> Terms of Service</Text>.
            </Text>

            <Link href={'/otp'} asChild replace>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>
                        Agree & Continue
                    </Text>
                </TouchableOpacity>
            </Link>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    welcome: {
        width: '100%',
        height: 300,
        marginBottom: 80
    },
    headline: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 20,
    },
    description: {
        fontSize: 14,
        textAlign: 'center',
        color: Colors.gray,
        marginBottom: 80,
        fontWeight: 'bold'
    },
    links: {
        color: Colors.primary
    },
    button: {
        width: '100%',
        alignItems: 'center'
    },
    buttonText: {
        fontSize: 22,
        color: Colors.primary,
    }
})

export default Page