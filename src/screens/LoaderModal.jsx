// .\src\screens\LoaderModal.jsx
import React from 'react';
import { Modal, View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export default function LoaderModal({ visible, message }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => {}}>
      <View style={styles.loaderOverlay}>
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color="#EE6969" />
          <Text style={styles.loaderText}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  loaderOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderBox: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowOffset: { width: 1, height: 4 },
    shadowRadius: 8,
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
    color: '#EE6969',
    fontWeight: '600',
  },
});
