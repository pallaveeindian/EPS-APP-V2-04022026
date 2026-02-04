import React from 'react';
import { FlatList, TouchableOpacity, Text } from 'react-native';

export default function SimpleTable({ data, columns, onRowPress }) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item, index) => item.id ? String(item.id) : String(index)}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => onRowPress && onRowPress(item)} style={{ padding:12, borderBottomWidth:1, borderColor:'#eee' }}>
          {columns.map(col => <Text key={col.key} style={{ marginBottom:4 }}>{col.label}: {String(item[col.key] || '')}</Text>)}
        </TouchableOpacity>
      )}
    />
  );
}
