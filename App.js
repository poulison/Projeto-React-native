import * as React from 'react';
import { Vibration, TextInput, Text, View, TouchableOpacity, FlatList, StyleSheet, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {WebView} from 'react-native-webview';
import {useState, useEffect} from 'react';
import {Button, SafeAreaView} from 'react-native';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Contexto para controlar o estado de login
const AuthContext = React.createContext();


// Tela de Login
function Principal({ navigation }) {
  const [usuario, setUsuario] = React.useState('');
  const [senha, setSenha] = React.useState('');
  const { setLoggedIn } = React.useContext(AuthContext);

  async function ler() {
    try {
      let senhaArmazenada = await AsyncStorage.getItem(usuario);
      if (senhaArmazenada != null && senhaArmazenada === senha) {
        alert("Logado com sucesso!");
        setLoggedIn(true); // Atualiza o estado global de login
      } else {
        alert("Usuário ou senha incorretos!");
      }
    } catch (erro) {
      console.log(erro);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      
      <Text style={styles.label}>Usuário:</Text>
      <TextInput
        style={styles.input}
        onChangeText={setUsuario}
        placeholder="Digite seu usuário"
        placeholderTextColor="#aaa"
      />
      
      <Text style={styles.label}>Senha:</Text>
      <TextInput
        style={styles.input}
        onChangeText={setSenha}
        placeholder="Digite sua senha"
        placeholderTextColor="#aaa"
        secureTextEntry={true}
      />
      
      <TouchableOpacity style={styles.button} onPress={ler}>
        <Text style={styles.buttonText}>Logar</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
        <Text style={styles.linkText}>Não tem uma conta? Cadastre-se</Text>
      </TouchableOpacity>
    </View>
  );
}

// Tela de Cadastro
function Cadastro({ navigation }) {
  const [user, setUser] = React.useState('');
  const [password, setPassword] = React.useState('');

  async function gravar() {
    try {
      await AsyncStorage.setItem(user, password);
      alert("Cadastro realizado com sucesso!");
      navigation.goBack();
    } catch (erro) {
      alert("Erro ao cadastrar!");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro</Text>
      
      <Text style={styles.label}>Usuário:</Text>
      <TextInput 
        style={styles.input}
        onChangeText={setUser}
        placeholder="Digite seu usuário"
        placeholderTextColor="#aaa"
      />
      
      <Text style={styles.label}>Senha:</Text>
      <TextInput 
        style={styles.input}
        onChangeText={setPassword}
        placeholder="Digite sua senha"
        placeholderTextColor="#aaa"
        secureTextEntry={true}
      />
      
      <TouchableOpacity style={styles.button} onPress={gravar}>
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>
    </View>
  );
}


// Navigator com as telas de navegação principal, exibido apenas após o login
// Navbar com as telas de navegação principal, exibido apenas após o login
function Abas() {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Principal" 
        component={Site} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }} 
      />
      <Tab.Screen 
        name="Anotações" 
        component={Notas} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="book" color={color} size={size} />
          ),
        }} 
      />
     
    </Tab.Navigator>
  );
}

// Tela do site
const Site = () => {
  const [showWebView, setShowWebView] = React.useState(false); 
  
  const handleButtonPress = () => {
    setShowWebView(true);
  };

  const handleCloseWebView = () => {
    setShowWebView(false);
  }
  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={{flex: 1}}>
        {showWebView ? (
          <WebView
            source={{uri: 'https://moodle.fei.edu.br/login/index.php'}}
            style={{flex: 1}}
            />
        ) : (
          <TouchableOpacity  onPress={handleButtonPress} >
          <Image style={styles.logo} source={require('./assets/FEI.png')} />
          </TouchableOpacity>
        )}
        </View>
      </SafeAreaView>
  );
};

const Notas = () => {
  const [nota, setNota] = useState('');
  const [notas, setNotas] = useState([]);

  // Carrega as anotações salvas ao iniciar o componente
  useEffect(() => {
    carregarNotas();
  }, []);

  // Função para carregar anotações do AsyncStorage
  const carregarNotas = async () => {
    try {
      const notasSalvas = await AsyncStorage.getItem('notas');
      if (notasSalvas !== null) {
        setNotas(JSON.parse(notasSalvas));
      }
    } catch (error) {
      console.log('Erro ao carregar anotações:', error);
    }
  };

  // Função para salvar as anotações no AsyncStorage
  const salvarNotas = async (novasNotas) => {
    try {
      await AsyncStorage.setItem('notas', JSON.stringify(novasNotas));
      setNotas(novasNotas);
    } catch (error) {
      console.log('Erro ao salvar anotações:', error);
    }
  };

  // Função para adicionar uma nova anotação
  const adicionarNota = () => {
    if (nota.trim() !== '') {
      const novasNotas = [...notas, nota];
      salvarNotas(novasNotas);
      setNota('');
      Vibration.vibrate(200); // Vibra por 200ms quando adicionar uma nota
    }
  };

  // Função para deletar uma anotação
  const deletarNota = (index) => {
    const novasNotas = notas.filter((_, i) => i !== index);
    salvarNotas(novasNotas);
    Vibration.vibrate(100); // Vibra por 100ms quando remover uma nota
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <Text style={styles.title}>Bloco de Notas</Text>
      <TextInput
        style={styles.input}
        placeholder="Escreva sua nota aqui..."
        value={nota}
        onChangeText={setNota}
      />
      <TouchableOpacity style={styles.button} onPress={adicionarNota}>
        <Text style={styles.buttonText}>Adicionar Nota</Text>
      </TouchableOpacity>

      <FlatList
        data={notas}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.notaContainer}>
            <Text style={styles.notaText}>{item}</Text>
            <TouchableOpacity onPress={() => deletarNota(index)}>
              <Text style={styles.deletarText}>Deletar</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

// Navegação principal
function App() {
  const [loggedIn, setLoggedIn] = React.useState(false);

  return (
    <AuthContext.Provider value={{ loggedIn, setLoggedIn }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {loggedIn ? (
            <Stack.Screen name="Abas" component={Abas} />
          ) : (
            <>
              <Stack.Screen name="Principal" component={Principal} />
              <Stack.Screen name="Cadastro" component={Cadastro} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}



// Estilos
const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },

  label: {
    alignSelf: 'flex-start',
    color: '#666',
    marginBottom: 5,
  },

  input: {
    width: '100%',
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
    backgroundColor: '#fff',
  },

  button: {
    width: '100%',
    backgroundColor: '#4A90E2',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },

  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  linkText: {
    color: '#4A90E2',
    fontSize: 16,
    marginTop: 15,
    textDecorationLine: 'underline',
  },

   notaContainer: {
    padding: 10,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  notaText: {
    fontSize: 16,
    flex: 1,
  },
  
  deletarText: {
    color: 'red',
    fontSize: 16,
  },

  logo: {
    Maxheight: 50, 
    Maxwidth: 40,
    marginTop: 120,
    marginLeft: 'auto', /* aqui */
    marginRight: 'auto', /* e aqui */
    alignItems: 'center',
  }
});

export default App;
