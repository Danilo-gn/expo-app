import React, { useState } from 'react';
import { View, FlatList, Alert, TextInput, Text, Modal, Animated, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Checkbox } from 'react-native-paper';
import { ScreenContent } from 'components/ScreenContent';

interface Item {
  title: string;
  time: Date;
  done: boolean;
}

export default function TabOneScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [tempTime, setTempTime] = useState(new Date());
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [animationOpacity] = useState(new Animated.Value(0));  // Valor de opacidade animado

  const addItem = () => {
    if (inputValue.trim()) {
      const newItem = {
        title: inputValue.trim(),
        time: selectedTime,
        done: false,
      };
      setItems((prevItems) => [...prevItems, newItem]);
      setInputValue('');
      setShowTimePicker(false);
    } else {
      Alert.alert("Digite um valor válido!");
    }
  };

  const openEditModal = (index: number) => {
    setEditIndex(index);
    setInputValue(items[index].title);
    setSelectedTime(items[index].time);
    setTempTime(items[index].time);
    setModalVisible(true);
  };

  const saveEdit = () => {
    if (inputValue.trim()) {
      const updatedItems = items.map((item, idx) => 
        idx === editIndex ? { ...item, title: inputValue.trim(), time: selectedTime } : item
      );
      setItems(updatedItems);
      setInputValue('');
      setModalVisible(false);
      setEditIndex(null);
    } else {
      Alert.alert("Digite um valor válido!");
    }
  };

  const deleteItem = (index: number) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Você tem certeza que deseja excluir este item?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          onPress: () => {
            const updatedItems = items.filter((_, idx) => idx !== index);
            setItems(updatedItems);
          },
        },
      ]
    );
  };

  const toggleDone = (index: number) => {
    const updatedItems = items.map((item, idx) => 
      idx === index ? { ...item, done: !item.done } : item
    );
    setItems(updatedItems);
  };

  const confirmTime = () => {
    setSelectedTime(tempTime);
    hideDateTimePickerWithAnimation();
  };

  // Função para mostrar o DateTimePicker com animação
  const showDateTimePickerWithAnimation = () => {
    setShowTimePicker(true);
    Animated.timing(animationOpacity, {
      toValue: 1,   // Define a opacidade como 1 (visível)
      duration: 300, // Duração de 300ms
      useNativeDriver: true,
    }).start();
  };

  // Função para ocultar o DateTimePicker com animação
  const hideDateTimePickerWithAnimation = () => {
    Animated.timing(animationOpacity, {
      toValue: 0,   // Define a opacidade como 0 (invisível)
      duration: 300, // Duração de 300ms
      useNativeDriver: true,
    }).start(() => setShowTimePicker(false));  // Após a animação, oculta o picker
  };

  return (
    <View className="flex-1 p-5 bg-slate-800">
      <ScreenContent path="screens/one.tsx" title="Rotina" />

      <TextInput
        value={inputValue}
        onChangeText={setInputValue}
        placeholder="Digite um novo item"
        className="border border-cyan-500 p-3 mt-4 rounded-xl text-cyan-500 placeholder-cyan-500"
        placeholderTextColor="#CBD5E1"
      />

      <TouchableOpacity onPress={showDateTimePickerWithAnimation} className="bg-cyan-500 p-3 rounded-xl mt-4">
        <Text className="text-slate-800 text-center">Selecionar Horário</Text>
      </TouchableOpacity>

      {showTimePicker && (
        <Animated.View style={{ opacity: animationOpacity }} className="mt-4 items-center flex flex-row justify-center mx-8">
          <DateTimePicker
            value={tempTime}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={(event, date) => {
              if (date) setTempTime(date);
            }}
          />
          <TouchableOpacity onPress={confirmTime} className="bg-rose-400 p-3 rounded-xl mx-8 w-24">
            <Text className="text-slate-800 text-center">OK</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={hideDateTimePickerWithAnimation} className="bg-rose-400 p-3 rounded-xl w-24">
            <Text className="text-slate-800 text-center">Cancelar</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <TouchableOpacity onPress={addItem} className="bg-cyan-500 p-3 rounded-xl mt-4">
        <Text className="text-slate-800 text-center">Adicionar Item</Text>
      </TouchableOpacity>

      <FlatList
        className='mt-8'
        data={items}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
            <View style={{ backgroundColor: '#334155', borderRadius: 100 }}>
              <Checkbox
                status={item.done ? 'checked' : 'unchecked'}
                onPress={() => toggleDone(index)}
                color="#06B6D4" // Cyan-500 quando marcada
                uncheckedColor="#CBD5E1" // Slate-400 quando desmarcada
              />
            </View>
            <Text className={`text-white ${item.done ? 'line-through' : ''}`}>
              {item.title} - {item.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <View className="flex-row">
              <TouchableOpacity onPress={() => openEditModal(index)} className="bg-slate-100 p-2 rounded-xl">
                <Text className="text-slate-800">Editar</Text>
              </TouchableOpacity>
              <View className="mx-2" />
              <TouchableOpacity onPress={() => deleteItem(index)} className="bg-slate-100 p-2 rounded-xl">
                <Text className="text-slate-800">Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Modal para edição */}
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white p-5 rounded w-4/5">
            <TextInput
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="Digite o novo valor"
              className="border border-gray-300 p-3 mb-4 rounded"
            />
            <TouchableOpacity onPress={() => setShowTimePicker(true)} className="bg-blue-500 p-3 rounded mt-4">
              <Text className="text-white text-center">Selecionar Horário</Text>
            </TouchableOpacity>

            {showTimePicker && (
              <View className="mt-4">
                <DateTimePicker
                  value={tempTime}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={(event, date) => {
                    if (date) setTempTime(date);
                  }}
                />
                <TouchableOpacity onPress={confirmTime} className="bg-green-500 p-3 rounded mt-3">
                  <Text className="text-white text-center">OK</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowTimePicker(false)} className="bg-red-500 p-3 rounded mt-2">
                  <Text className="text-white text-center">Cancelar</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity onPress={saveEdit} className="bg-green-500 p-3 rounded mt-4">
              <Text className="text-white text-center">Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} className="bg-red-500 p-3 rounded mt-2">
              <Text className="text-white text-center">Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
