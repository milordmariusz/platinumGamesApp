import { View, Text, StyleSheet, FlatList, TouchableOpacity, TouchableWithoutFeedback, Keyboard, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'
import { FIREBASE_AUTH, FIREBASE_DB, auth } from '../../firebaseConfig';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import Ionicons from '@expo/vector-icons/Ionicons'
import { Entypo } from '@expo/vector-icons'
import { signOut } from 'firebase/auth';
import { StackActions } from '@react-navigation/native';
import AutocompleteInput from 'react-native-autocomplete-input';
import { API_KEY } from '@env';


export interface Game {
    title: string;
    completed: boolean;
    id: string;
}

const List = ({ navigation }: any) => {
    const [games, setGames] = useState<Game[]>([]);
    const [gamesCopy, setGamesCopy] = useState<Game[]>([]);
    const [game, setGame] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const handleSignOut = async () => {
        signOut(auth).then(() => {
            const resetAction = StackActions.replace('Login');
            navigation.dispatch(resetAction);
        }).catch(error => alert(error.message));

    }

    useEffect(() => {
        const user = FIREBASE_AUTH.currentUser;
        if (user) {
            const gameRef = collection(FIREBASE_DB, 'users', user.uid, 'games');
            const subscriber = onSnapshot(
                query(gameRef, orderBy('createdAt', 'desc')),
                {
                    next: (snapshot) => {
                        const games: Game[] = [];
                        snapshot.docs.forEach((doc) => {
                            games.push({
                                id: doc.id,
                                ...doc.data(),
                            } as Game);
                        });
                        setGames(games);
                        setGamesCopy(games);
                    },
                    error: (error) => console.log(error),
                }
            );
            return () => subscriber();
        }
    }, []);


    const addGame = async () => {
        if (isSaving) {
            return;
        }

        setIsSaving(true);

        try {
            const user = FIREBASE_AUTH.currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            const gameTitle = game;
            setGame('');
            Keyboard.dismiss();
            setSearchResults([]);

            await addDoc(collection(FIREBASE_DB, 'users', user.uid, 'games'), {
                title: gameTitle,
                completed: false,
                createdAt: serverTimestamp(),
            });
        } catch (error) {
            console.error('Error adding game:', error);
        }

        setIsSaving(false);
    };

    const renderGame = ({ item }: any) => {
        const user = FIREBASE_AUTH.currentUser;
        const ref = doc(FIREBASE_DB, `users/${user!.uid}/games/${item.id}`);

        const toggleCompleted = async () => {
            updateDoc(ref, { completed: !item.completed });
        };

        const deleteItem = async () => {
            deleteDoc(ref);
        };
        return (
            <View style={styles.gameContainer}>
                {item.completed && <Ionicons name='md-checkmark-circle' size={32} color="green" onPress={toggleCompleted} />}
                {!item.completed && <Entypo name='circle' size={32} color="black" onPress={toggleCompleted} />}
                <TouchableOpacity style={styles.game} onPress={() => navigation.navigate('Game Details', { gameId: item.id, gameTitle: item.title })}>
                    <Text style={styles.gameText}>{item.title}</Text>
                </TouchableOpacity>
                <Ionicons name='trash-bin-outline' size={24} color='red' onPress={deleteItem} />
            </View>
        )
    }

    const capitalizeFirst = (str: string | null | undefined) => {
        if (str === null || str === undefined) {
            return "";
        }
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const handleChangeText = async (value: string) => {
        if (value.length > 1) {
            fetch(`https://api.rawg.io/api/games?search=${value}&key=${API_KEY}`)
                .then((response) => response.json())
                .then((json) => {
                    const results = json.results
                    setSearchResults(results);
                })
                .catch(function (error) {
                    console.log('There has been a problem with your fetch operation: ' + error.message);
                    throw error;
                });
        }
        setGame(value);
    }

    const searchGame = async (value: string) => {
        if(value.length < 1){
            setGames(gamesCopy);
        } else {
            console.log(value,"dddd");
            const gamesFiltered = games.filter(game => {
                return game.title.toLowerCase().includes(value.toLowerCase());
            })
            setGames(gamesFiltered);
        }
    }


    return (
        <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss; setSearchResults([]); }} accessible={false}>
            <View style={styles.container}>
                <View style={styles.account}>
                    <Text style={styles.accountName}>{capitalizeFirst(FIREBASE_AUTH.currentUser?.displayName)}</Text>
                    <TouchableOpacity
                        onPress={handleSignOut}
                        style={[styles.button, styles.buttonOutline]}>
                        <Text style={styles.buttonOutlineText}>Log out</Text>
                    </TouchableOpacity>
                </View>
                <View style={[styles.form, { zIndex: 1 }]}>
                    <AutocompleteInput
                        inputContainerStyle={styles.input}
                        listContainerStyle={{ zIndex: 1, position: 'absolute', paddingTop: 50, paddingLeft: 5 }}
                        data={searchResults.slice(0, 4).map(result => result.name)}
                        placeholder='Add new game'
                        onChangeText={(text: string) => {
                            handleChangeText(text)
                            if (text.length < 2) {
                                setSearchResults([]);
                            }
                        }
                        }
                        value={game}
                        renderResultList={(item: any) => {

                            return <FlatList
                                keyboardShouldPersistTaps='handled'
                                data={item.data}
                                renderItem={(game) => {
                                    return <TouchableOpacity style={styles.autocompleteItem}
                                        onPress={() => {
                                            setGame(game.item);
                                            setSearchResults([]);
                                        }}>
                                        <Text style={styles.buttonOutlineText}>
                                            {game.item}
                                        </Text>
                                    </TouchableOpacity>;
                                }}
                            />;

                        }
                        } />
                    <TouchableOpacity
                        onPress={addGame}
                        style={game === '' ? [styles.buttonDisabled, styles.buttonOutlineDisabled] : [styles.button, styles.buttonOutline]} disabled={game === ''}>
                        <Text style={game === '' ? styles.buttonOutlineTextDisabled : styles.buttonOutlineText}>Add game</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.searchForm}>
                    <Ionicons name='search-outline' size={20} color="black" style={{paddingRight: 5}}/>
                    <TextInput 
                        style={styles.searchInput} 
                        onChangeText={(text: string) => {
                            searchGame(text);
                        }
                    } />
                </View>
                {games.length > 0 && (
                    <FlatList
                        keyboardShouldPersistTaps='handled'
                        data={games}
                        renderItem={(item) => renderGame(item)}
                        keyExtractor={(game: Game) => game.id}
                    />

                )}
            </View>
        </TouchableWithoutFeedback>
    )
}

export default List;



const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        flex: 1
    },
    account: {
        marginVertical: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    accountName: {
        flex: 1,
        fontWeight: '700',
        fontSize: 30,
    },
    button: {
        backgroundColor: '#0782F9',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#C0C0C0',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonOutline: {
        backgroundColor: 'white',
        borderColor: '#0782F9',
        borderWidth: 2,
    },
    buttonOutlineDisabled: {
        backgroundColor: 'white',
        borderColor: '#C0C0C0',
        borderWidth: 2,
    },
    buttonOutlineText: {
        color: '#0782F9',
        fontWeight: '700',
        fontSize: 16,
    },
    buttonOutlineTextDisabled: {
        color: '#C0C0C0',
        fontWeight: '700',
        fontSize: 16,
    },
    form: {
        marginVertical: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchForm: {
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        backgroundColor: 'white',
        paddingHorizontal: 15,
        borderRadius: 10,
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 10,
        paddingLeft: 10,
    },
    gameContainer: {
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 10,
        marginVertical: 4,
    },
    gameText: {
        flex: 1,
        paddingHorizontal: 4,
    },
    game: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    autocompleteItem: {
        backgroundColor: "#ffffff",
        padding: 5,
        borderColor: '#C0C0C0',
        borderWidth: 1,
    }
});