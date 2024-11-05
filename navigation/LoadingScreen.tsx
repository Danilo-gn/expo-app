import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

export default function LoadingScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-slate-800">
      <ActivityIndicator size="large" color="#06B6D4" />
      <Text className="mt-4 text-lg text-cyan-200">Carregando...</Text>
    </View>
  );
}