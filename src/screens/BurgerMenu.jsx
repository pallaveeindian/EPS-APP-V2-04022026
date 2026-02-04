// src/components/BurgerMenu.jsx
import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  Text,
} from 'react-native';

const screenWidth = Dimensions.get('window').width;

export default function BurgerMenu({
  visible,
  onClose,
  menuItems = [], // [{ label: 'Logout', onPress: () => {} }]
}) {
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const [selectedIndex, setSelectedIndex] = useState(null);

  // Slide animation
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : screenWidth,
      duration: visible ? 280 : 200,
      useNativeDriver: true,
    }).start();
  }, [visible, slideAnim]);

  const handlePress = (item, index) => {
    setSelectedIndex(index); // set selected item
    onClose();
    item.onPress && item.onPress();
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View style={[styles.menu, { transform: [{ translateX: slideAnim }] }]}>
          {menuItems.map((item, idx) => (
            <React.Fragment key={idx}>
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  selectedIndex === idx ? styles.selectedItem : null, // highlight selected
                ]}
                onPress={() => handlePress(item, idx)}
              >
                <Text
                  style={[
                    styles.menuText,
                    selectedIndex === idx ? { color: '#EE6969' } : item.color ? { color: item.color } : {},
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
              {idx < menuItems.length - 1 && <View style={styles.menuDivider} />}
            </React.Fragment>
          ))}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menu: {
    marginTop: 50,
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    paddingVertical: 8,
    width: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  selectedItem: {
    backgroundColor: '#FFECEC', // light red shade for selection
    borderRadius: 6,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 6,
    width: '85%',
    alignSelf: 'center',
  },
});
