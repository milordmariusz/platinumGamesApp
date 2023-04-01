import { KeyboardAvoidingView, View, StyleSheet, Text, TextInput, Button, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native'
import React, { useEffect, useState } from 'react'
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { useNavigation } from '@react-navigation/core';
import { StackActions } from '@react-navigation/native';

const Login = ({ navigation }: any) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignUp = async () => {
        navigation.navigate('Sign Up');
    }

    const handleLogin = () => {
        if (password === '' || email === '') {
            alert("Please fill in the login fields.");
            return;
        }

        signInWithEmailAndPassword(auth, email, password).then(userCredential => {
            const user = userCredential.user;
            console.log("Logged in with:", user.email);
            const resetAction = StackActions.replace('Platinum Games');
            navigation.dispatch(resetAction);
        }).catch((error) => {
            let errorMessage = "An error occurred. Please try again.";
            switch (error.code) {
                case "auth/user-not-found":
                    errorMessage = "User not found. Please check your email and try again.";
                    break;
                case 'auth/invalid-email':
                    errorMessage = "The email address is not valid.";
                    break;
                case "auth/wrong-password":
                    errorMessage = "Invalid password. Please check your password and try again.";
                    break;
                case "auth/too-many-requests":
                    errorMessage =
                        "Too many unsuccessful login attempts. Please try again later.";
                    break;
                case "auth/network-request-failed":
                    errorMessage =
                        "A network error occurred. Please check your internet connection and try again.";
                    break;
                default:
                    break;
            }
            alert(errorMessage);
        });
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <KeyboardAvoidingView style={styles.container} behavior='padding'>
                <View style={styles.inputContainer}>
                    <TextInput placeholder="Email" value={email} onChangeText={text => setEmail(text)} style={styles.input} />
                    <TextInput placeholder="Password" value={password} onChangeText={text => setPassword(text)} style={styles.input} secureTextEntry />
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        onPress={handleLogin}
                        style={styles.button}
                    >
                        <Text style={styles.buttonText}>Login</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleSignUp}
                        style={[styles.button, styles.buttonOutline]}>
                        <Text style={styles.buttonOutlineText}>Register</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    )
}

export default Login

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputContainer: {
        width: '80%'
    },
    input: {
        backgroundColor: 'white',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 5,
    },
    buttonContainer: {
        width: '60%',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40
    },
    button: {
        backgroundColor: '#0782F9',
        width: '100%',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
    },
    buttonOutline: {
        backgroundColor: 'white',
        marginTop: 5,
        borderColor: '#0782F9',
        borderWidth: 2,
    },
    buttonOutlineText: {
        color: '#0782F9',
        fontWeight: '700',
        fontSize: 16,
    }
});