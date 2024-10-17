import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, Modal } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { db, authenticateUser } from 'firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface Event {
  date: string;
  description: string;
}

export default function EventosScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const authenticateAndLoadData = async () => {
      try {
        const user = await authenticateUser();
        setUserId(user.uid);
        loadEventsFromFirestore(user.uid);
      } catch (error) {
        console.error('Erro ao autenticar usuário: ', error);
      }
    };

    authenticateAndLoadData();
  }, []);

  const loadEventsFromFirestore = async (uid: string) => {
    try {
      const docRef = doc(db, 'events', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && data.events) {
          setEvents(data.events);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar eventos do Firestore: ', error);
    }
  };

  const saveEventsToFirestore = async (updatedEvents: Event[], uid: string) => {
    try {
      await setDoc(doc(db, 'events', uid), { events: updatedEvents });
    } catch (error) {
      console.error('Erro ao salvar eventos no Firestore: ', error);
    }
  };

  const addEvent = () => {
    if (selectedDate && description.trim()) {
      const newEvent: Event = { date: selectedDate, description: description.trim() };
      const updatedEvents = [...events, newEvent];
      setEvents(updatedEvents);
      setDescription('');
      setModalVisible(false);

      if (userId) saveEventsToFirestore(updatedEvents, userId);
    } else {
      Alert.alert('Erro', 'Selecione uma data e digite uma descrição válida.');
    }
  };

  const deleteEvent = (index: number) => {
    const updatedEvents = events.filter((_, idx) => idx !== index);
    setEvents(updatedEvents);

    if (userId) saveEventsToFirestore(updatedEvents, userId);
  };

  const renderEvent = ({ item, index }: { item: Event; index: number }) => (
    <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
      <Text className="text-white">{`${item.date} - ${item.description}`}</Text>
      <TouchableOpacity
        onPress={() => deleteEvent(index)}
        className="bg-red-500 p-2 rounded-xl"
      >
        <Text className="text-white">Excluir</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex h-screen bg-slate-800 px-4">
      <Text className="text-white text-2xl text-center mt-5 mb-4">Eventos</Text>

      <Calendar
        onDayPress={(day: DateData) => {
          setSelectedDate(day.dateString);
          setModalVisible(true);
        }}
        markedDates={{
          ...(events.reduce((acc, event) => {
            acc[event.date] = { marked: true, dotColor: 'cyan' };
            return acc;
          }, {} as Record<string, { marked: boolean; dotColor: string }>)),
        }}
        theme={{
          calendarBackground: '#1E293B',
          dayTextColor: '#E2E8F0',
          monthTextColor: '#94A3B8',
          arrowColor: '#06B6D4',
          selectedDayBackgroundColor: '#06B6D4',
          selectedDayTextColor: '#1E293B',
        }}
      />

      <FlatList
        className="mt-4"
        data={events}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderEvent}
      />

      <Modal visible={modalVisible} transparent onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-slate-700 p-5 rounded w-4/5">
            <Text className="text-white text-lg mb-4">Adicionar Evento em {selectedDate}</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Descrição do evento"
              className="border border-cyan-500 p-3 rounded-xl text-cyan-500 placeholder-cyan-500"
              placeholderTextColor="#CBD5E1"
            />
            <TouchableOpacity onPress={addEvent} className="bg-cyan-500 p-3 rounded-xl mt-4">
              <Text className="text-slate-800 text-center">Adicionar Evento</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} className="bg-rose-400 p-3 rounded-xl mt-4">
              <Text className="text-slate-800 text-center">Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
