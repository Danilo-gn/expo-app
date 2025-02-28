import React, { useState, useEffect } from 'react';
import { View, FlatList, Alert, TextInput, Text, Modal, Animated, TouchableOpacity } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Checkbox } from 'react-native-paper';
import { db, authenticateUser } from 'firebaseConfig';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';

interface FinanceItem {
  title: string;
  value: number;
  month: number;
  done: boolean;
}

const monthsData = [ 
  { label: 'Janeiro', value: 1},
  { label: 'Fevereiro', value: 2},
  { label: 'Março', value: 3},
  { label: 'Abril', value: 4},
  { label: 'Maio', value: 5},
  { label: 'Junho', value: 6},
  { label: 'Julho', value: 7},
  { label: 'Agosto', value: 8},
  { label: 'Setembro', value: 9},
  { label: 'Outubro', value: 10},
  { label: 'Novembro', value: 11},
  { label: 'Dezembro', value: 12},
];

export default function FinanceScreen() {
  const [items, setItems] = useState<FinanceItem[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [price, setPrice] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString());
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showCreateFinance, setShowCreateFinance] = useState(false);
  const [animationOpacity] = useState(new Animated.Value(0));
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const authenticateAndLoadData = async () => {
      try {
        const user = await authenticateUser();
        setUserId(user.uid);
        loadItemsFromFirestore(user.uid);
      } catch (error) {
        console.error('Erro ao autenticar usuário: ', error);
      }
    };

    authenticateAndLoadData();
  }, []);

  const loadItemsFromFirestore = async (uid: string) => {
    try {
      const docRef = doc(db, 'finance', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && data.items) {
          setItems(data.items);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar itens do Firestore: ', error);
    }
  };

  const saveItemsToFirestore = async (updatedItems: FinanceItem[], uid: string) => {
    try {
      await setDoc(doc(db, 'finance', uid), { items: updatedItems });
    } catch (error) {
      console.error('Erro ao salvar itens no Firestore: ', error);
    }
  };

  const addItem = () => {
    const value = parseFloat(price);
    if (inputValue.trim() && !isNaN(value)) {
      const newItem = {
        title: inputValue.trim(),
        value,
        month: parseInt(selectedMonth, 10), // Convertendo de volta para número
        done: false,
      };
      const updatedItems = [...items, newItem];
      setItems(sortItemsByMonthAndValue(updatedItems));
      setInputValue('');
      setPrice('');
      setShowCreateFinance(false);

      if (userId) {
        saveItemsToFirestore(updatedItems, userId);
      }
    } else {
      Alert.alert('Digite um nome válido e um valor numérico!');
    }
  };

  const sortItemsByMonthAndValue = (items: FinanceItem[]) => {
    const currentMonth = new Date().getMonth() + 1;
    return items.sort((a, b) => {
      const adjustedMonthA = a.month < currentMonth ? a.month + 12 : a.month;
      const adjustedMonthB = b.month < currentMonth ? b.month + 12 : b.month;

      if (adjustedMonthA !== adjustedMonthB) {
        return adjustedMonthA - adjustedMonthB;
      }
      return b.value - a.value;
    });
  };

  const toggleDone = (index: number) => {
    const updatedItems = items.map((item, idx) =>
      idx === index ? { ...item, done: !item.done } : item
    );
    setItems(sortItemsByMonthAndValue(updatedItems));

    if (userId) {
      saveItemsToFirestore(updatedItems, userId);
    }
  };

  const deleteItem = (index: number) => {
    const updatedItems = items.filter((_, idx) => idx !== index);
    setItems(sortItemsByMonthAndValue(updatedItems));

    if (userId) {
      saveItemsToFirestore(updatedItems, userId);
    }
  };

  return (
    <View className="flex px-4 h-screen bg-slate-800 justify-start items-stretch">
      <View className="p-5">

        <TouchableOpacity
          onPress={() => setShowCreateFinance(!showCreateFinance)}
          className="bg-cyan-500 p-3 rounded-xl mt-4"
        >
          <Text className="text-slate-800 text-center">
            {showCreateFinance ? 'Fechar' : 'Adicionar Finança'}
          </Text>
        </TouchableOpacity>

        {showCreateFinance && (
          <View className="mt-4">
            <TextInput
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="Descrição"
              className="border border-cyan-500 p-3 rounded-xl text-cyan-500 placeholder-cyan-500"
              placeholderTextColor="#CBD5E1"
            />
            <TextInput
              value={price}
              onChangeText={setPrice}
              placeholder="Valor"
              keyboardType="numeric"
              className="border border-cyan-500 p-3 mt-4 rounded-xl text-cyan-500 placeholder-cyan-500"
              placeholderTextColor="#CBD5E1"
            />

            {/* Picker para seleção do mês */}
            <Dropdown
              data={monthsData}
              labelField="label"
              valueField="value"
              placeholder="Selecione o mes"
              value={selectedMonth}
              onChange={(item) => setSelectedMonth(item.value)}
              style={{
                backgroundColor: '#334155',
                padding: 10,
                borderRadius: 10,
                marginTop: 10,
              }}
              placeholderStyle={{ color: '#CBD5E1' }}
              selectedTextStyle={{ color: '#06B6D4' }}
              itemTextStyle={{ color: '#CBD5E1' }}
              itemContainerStyle={{ backgroundColor: '#334155' }}
              activeColor="#1E293B"
              />

            <TouchableOpacity onPress={addItem} className="bg-cyan-500 p-3 rounded-xl mt-4">
              <Text className="text-slate-800 text-center">Adicionar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <FlatList
        className="flex-1 mt-8"
        data={items}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
            <View style={{ backgroundColor: '#334155', borderRadius: 100 }}>
              <Checkbox
                status={item.done ? 'checked' : 'unchecked'}
                onPress={() => toggleDone(index)}
                color="#06B6D4"
                uncheckedColor="#CBD5E1"
              />
            </View>
            <Text className={`text-white ${item.done ? 'line-through' : ''}`}>
              {item.title} - R${item.value.toFixed(2)} - Mês: {item.month}
            </Text>
            <TouchableOpacity onPress={() => deleteItem(index)} className="bg-slate-100 p-2 rounded-xl">
              <Text className="text-slate-800">Excluir</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}