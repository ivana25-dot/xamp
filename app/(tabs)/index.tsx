import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Cambia esta URL por la de tu servidor Node.js
// Para Android Emulator usa: http://10.0.2.2:3000/api/posts
// Para dispositivo físico usa: http://TU_IP_LOCAL:3000/api/posts
const API_URL = 'http://10.0.2.2:3000/api/posts';

interface Note {
  id: number;
  title: string;
  body: string;
  created_at: string;
}

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  // READ - Obtener todas las notas
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las notas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // CREATE - Crear nueva nota
  const createNote = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'El título es requerido');
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, body }),
      });

      if (response.ok) {
        Alert.alert('Éxito', 'Nota creada correctamente');
        resetForm();
        fetchNotes();
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la nota');
      console.error(error);
    }
  };

  // UPDATE - Actualizar nota existente
  const updateNote = async () => {
    if (!currentNote || !title.trim()) {
      Alert.alert('Error', 'El título es requerido');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${currentNote.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, body }),
      });

      if (response.ok) {
        Alert.alert('Éxito', 'Nota actualizada correctamente');
        resetForm();
        fetchNotes();
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la nota');
      console.error(error);
    }
  };

  // DELETE - Eliminar nota
  const deleteNote = async (id: number) => {
    Alert.alert(
      'Confirmar',
      '¿Estás seguro de eliminar esta nota?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
              });

              if (response.ok) {
                Alert.alert('Éxito', 'Nota eliminada correctamente');
                fetchNotes();
              }
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la nota');
              console.error(error);
            }
          },
        },
      ]
    );
  };

  const openModal = (note?: Note) => {
    if (note) {
      setCurrentNote(note);
      setTitle(note.title);
      setBody(note.body);
    }
    setModalVisible(true);
  };

  const resetForm = () => {
    setTitle('');
    setBody('');
    setCurrentNote(null);
    setModalVisible(false);
  };

  const handleSubmit = () => {
    if (currentNote) {
      updateNote();
    } else {
      createNote();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderNote = ({ item }: { item: Note }) => (
    <View style={styles.noteCard}>
      <TouchableOpacity
        onPress={() => openModal(item)}
        style={styles.noteContent}
      >
        <Text style={styles.noteTitle}>{item.title}</Text>
        {item.body ? (
          <Text style={styles.noteBody} numberOfLines={2}>
            {item.body}
          </Text>
        ) : null}
        <Text style={styles.noteDate}>{formatDate(item.created_at)}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => deleteNote(item.id)}
        style={styles.deleteButton}
      >
        <Text style={styles.deleteButtonText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Notas</Text>
        <TouchableOpacity
          onPress={() => openModal()}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>+ Nueva</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <FlatList
          data={notes}
          renderItem={renderNote}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No hay notas. ¡Crea una nueva!
            </Text>
          }
        />
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={resetForm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {currentNote ? 'Editar Nota' : 'Nueva Nota'}
            </Text>

            <ScrollView style={styles.formContainer}>
              <Text style={styles.label}>Título *</Text>
              <TextInput
                style={styles.input}
                placeholder="Título de la nota"
                value={title}
                onChangeText={setTitle}
                maxLength={255}
              />

              <Text style={styles.label}>Contenido</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Escribe el contenido de tu nota..."
                value={body}
                onChangeText={setBody}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
              />

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={resetForm}
                  style={[styles.button, styles.cancelButton]}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSubmit}
                  style={[styles.button, styles.saveButton]}
                >
                  <Text style={styles.saveButtonText}>
                    {currentNote ? 'Actualizar' : 'Guardar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  noteBody: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 24,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  formContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 150,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});