import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyABRziXFwqS2uiKTu2eD9AbCGQIDPOO_1I",
    authDomain: "expo-app-5b672.firebaseapp.com",
    projectId: "expo-app-5b672",
    storageBucket: "expo-app-5b672.appspot.com",
    messagingSenderId: "172062207792",
    appId: "1:172062207792:web:4d92f0a9f5ad4ece80e2f5",
    measurementId: "G-CNE3CE9EEQ"
  };

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Função para autenticação anônima e persistência manual usando AsyncStorage
const authenticateUser = async () => {
  try {
    // Verificar se já existe um usuário autenticado no AsyncStorage
    const storedUser = await AsyncStorage.getItem('firebaseUser');
    if (storedUser) {
      console.log('Usuário encontrado no AsyncStorage: ', JSON.parse(storedUser));
      return JSON.parse(storedUser);
    }

    // Se não houver, autentica anonimamente
    const result = await signInAnonymously(auth);
    console.log('Usuário autenticado anonimamente: ', result.user);

    // Armazenar o usuário no AsyncStorage
    await AsyncStorage.setItem('firebaseUser', JSON.stringify(result.user));
    return result.user;
  } catch (error) {
    console.error('Erro ao autenticar ou persistir o usuário: ', error);
  }
};

export { db, auth, authenticateUser };
