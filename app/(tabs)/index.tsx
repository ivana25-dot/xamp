import { useEffect, useState } from 'react';
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

// Cambia esta URL:
// Android Emulator: http://10.0.2.2:3000/api/posts
// Dispositivo físico: http://TU_IP:3000/api/posts (ejemplo: http://192.168.1.5:3000/api/posts)
const API_URL = 'http://192.168.1.36:3000/api/posts';

interface Post {
  id: number;
  title: string;
  body: string;
  created_at: string;
}

export default function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  // Cargar todas las notas
  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        throw new Error('Error al cargar las notas');
      }
      
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las notas. Verifica que el servidor esté corriendo.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva nota
  const createPost = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'El título es obligatorio');
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: title.trim(), 
          body: body.trim() 
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear la nota');
      }

      Alert.alert('Éxito', 'Nota creada correctamente');
      closeModal();
      loadPosts();
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la nota');
      console.error(error);
    }
  };

  // Actualizar nota
  const updatePost = async () => {
    if (!editingPost || !title.trim()) {
      Alert.alert('Error', 'El título es obligatorio');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${editingPost.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: title.trim(), 
          body: body.trim() 
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la nota');
      }

      Alert.alert('Éxito', 'Nota actualizada correctamente');
      closeModal();
      loadPosts();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la nota');
      console.error(error);
    }
  };

  // Eliminar nota
  const deletePost = (id: number) => {
    Alert.alert(
      'Eliminar nota',
      '¿Estás seguro de que quieres eliminar esta nota?',
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

              if (!response.ok) {
                throw new Error('Error al eliminar la nota');
              }

              Alert.alert('Éxito', 'Nota eliminada');
              loadPosts();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la nota');
              console.error(error);
            }
          },
        },
      ]
    );
  };

  // Buscar notas
  const searchPosts = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      loadPosts();
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/search/${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('Error al buscar');
      }
      
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudo realizar la búsqueda');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (post?: Post) => {
    if (post) {
      setEditingPost(post);
      setTitle(post.title);
      setBody(post.body || '');
    } else {
      setEditingPost(null);
      setTitle('');
      setBody('');
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingPost(null);
    setTitle('');
    setBody('');
  };

  const handleSave = () => {
    if (editingPost) {
      updatePost();
    } else {
      createPost();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => openModal(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <TouchableOpacity
          onPress={() => deletePost(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.deleteIcon}>×</Text>
        </TouchableOpacity>
      </View>
      
      {item.body ? (
        <Text style={styles.cardBody} numberOfLines={3}>
          {item.body}
        </Text>
      ) : null}
      
      <Text style={styles.cardDate}>{formatDate(item.created_at)}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📝 Mis Notas</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => openModal()}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Búsqueda */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar notas..."
          value={searchQuery}
          onChangeText={searchPosts}
          returnKeyType="search"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => searchPosts('')}>
            <Text style={styles.clearSearch}>×</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Lista de notas */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>
                {searchQuery 
                  ? 'No se encontraron notas' 
                  : 'No hay notas aún.\n¡Crea tu primera nota!'}
              </Text>
            </View>
          }
        />
      )}

      {/* Modal crear/editar */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingPost ? 'Editar nota' : 'Nueva nota'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Text style={styles.modalClose}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Título *</Text>
              <TextInput
                style={styles.input}
                placeholder="Título de la nota"
                value={title}
                onChangeText={setTitle}
                maxLength={255}
                autoFocus
              />

              <Text style={styles.label}>Contenido</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="Escribe aquí..."
                value={body}
                onChangeText={setBody}
                multiline
                numberOfLines={10}
                textAlignVertical="top"
              />

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={closeModal}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSave}
                >
                  <Text style={styles.saveButtonText}>
                    {editingPost ? 'Actualizar' : 'Guardar'}
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
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
    marginTop: -2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#212529',
  },
  clearSearch: {
    fontSize: 28,
    color: '#6c757d',
    paddingLeft: 8,
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginRight: 8,
  },
  deleteIcon: {
    fontSize: 32,
    color: '#dc3545',
    fontWeight: '300',
    lineHeight: 28,
  },
  cardBody: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
    marginBottom: 8,
  },
  cardDate: {
    fontSize: 12,
    color: '#adb5bd',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#adb5bd',
    textAlign: 'center',
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  modalClose: {
    fontSize: 36,
    color: '#6c757d',
    fontWeight: '300',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#212529',
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  textarea: {
    height: 200,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});