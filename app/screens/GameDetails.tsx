import { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native'
import { FIREBASE_AUTH, FIREBASE_DB } from "../../firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";

const GameDetails = ({ route, navigation }: { route: any, navigation: any }) => {
  const [gameTitle, setGameTitle] = useState(route.params.gameTitle);
  const [isSaving, setIsSaving] = useState(false);

  // const handleSaveChanges = async () => {
  //   const user = FIREBASE_AUTH.currentUser;
  //   if (user) {
  //     const ref = doc(FIREBASE_DB, `users/${user.uid}/games/${route.params.gameId}`);
  //     await updateDoc(ref, { title: gameTitle });
  //     navigation.goBack();
  //   }
  // };

  const handleSaveChanges = async () => {
    if (isSaving) {
      return;
    }

    try {
      setIsSaving(true);

      const user = FIREBASE_AUTH.currentUser;
      if (user) {
        const ref = doc(FIREBASE_DB, `users/${user.uid}/games/${route.params.gameId}`);
        await updateDoc(ref, { title: gameTitle });
        navigation.goBack();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView style={styles.container} behavior='padding'>
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} placeholder='Game Title'
            onChangeText={(text: string) => setGameTitle(text)}
            value={gameTitle} />
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleSaveChanges} style={styles.button}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  )
};

export default GameDetails

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
});
