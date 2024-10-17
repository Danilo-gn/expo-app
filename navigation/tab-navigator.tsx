import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StackScreenProps } from '@react-navigation/stack';
import AntDesign from 'react-native-vector-icons/AntDesign'; // Importa a biblioteca de ícones
import { RootStackParamList } from '.';
import One from '../screens/one';
import Two from '../screens/two';
import Three from '../screens/three';

const Tab = createBottomTabNavigator();

type Props = StackScreenProps<RootStackParamList, 'TabNavigator'>;

export default function TabLayout({ navigation }: Props) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: string = 'help';

          if (route.name === 'One') {
            iconName = 'clockcircleo';  // Ícone da tela "One"
          } else if (route.name === 'Two') {
            iconName = 'wallet';  // Ícone da tela "Two"
          } else if (route.name === 'Three') {
            iconName = 'wallet';  // Ícone da tela "Three"
          }

          // Retorna o ícone correspondente com base no nome da rota
          return <AntDesign name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#06B6D4',  // Cyan-500
        tabBarInactiveTintColor: '#CBD5E1',  // Slate-400
        tabBarStyle: {
          backgroundColor: '#1E293B',  // Slate-800
        },
        headerStyle: {
          backgroundColor: '#1E293B', // Slate-800: Cor de fundo do header
        },
        headerTintColor: '#F8FAFC',
      })}
    >
      <Tab.Screen
        name="One"
        component={One}
        options={{ title: 'Rotina' }}
      />
      <Tab.Screen
        name="Two"
        component={Two}
        options={{ title: 'Finanças' }}
      />
      <Tab.Screen
        name="Three"
        component={Three}
        options={{ title: 'Eventos' }}
      />
    </Tab.Navigator>
  );
}
