import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';

const API_URL = 'https://pokeapi.co/api/v2/pokemon';
const LIMIT = 20;

// Layout: 2 colunas x 2 linhas = 4 Pokémon por tela
const COLUMNS = 2;
const ROWS_PER_SCREEN = 2;
const LIST_PADDING = 8;
const CARD_MARGIN = 6;

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);
const formatNumber = (id) => '#' + String(id).padStart(3, '0');

function PokemonCard({ pokemon, height, imageSize }) {
  return (
    <View style={[styles.card, { height }]}>
      <Text style={styles.number}>{formatNumber(pokemon.id)}</Text>
      <Image
        source={{ uri: pokemon.image }}
        style={{ width: imageSize, height: imageSize }}
        resizeMode="contain"
      />
      <Text style={styles.name}>{capitalize(pokemon.name)}</Text>
      <View style={styles.typesRow}>
        {pokemon.types.map((type) => (
          <View key={type} style={styles.typeBadge}>
            <Text style={styles.typeText}>{capitalize(type)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function App() {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [listHeight, setListHeight] = useState(0);
  const { width } = useWindowDimensions();

  // useRef evita que o onEndReached dispare várias requisições ao mesmo tempo
  const offsetRef = useRef(0);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);

  // Tamanho dos cards calculado a partir da área da lista,
  // para caberem exatamente 4 Pokémon (2 x 2) por tela
  const cardHeight = (listHeight - LIST_PADDING * 2) / ROWS_PER_SCREEN - CARD_MARGIN * 2;
  const cardWidth = (width - LIST_PADDING * 2) / COLUMNS - CARD_MARGIN * 2;
  const imageSize = Math.max(0, Math.min(cardWidth - 24, cardHeight - 100));

  const loadPokemons = async () => {
    if (loadingRef.current || !hasMoreRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      // 1) Busca a lista de 20 Pokémon a partir do offset atual
      const response = await fetch(`${API_URL}?limit=${LIMIT}&offset=${offsetRef.current}`);
      const data = await response.json();

      // 2) Para cada um, busca os detalhes (imagem e tipos)
      const details = await Promise.all(
        data.results.map((item) => fetch(item.url).then((res) => res.json()))
      );

      const newPokemons = details.map((p) => ({
        id: p.id,
        name: p.name,
        image: p.sprites.other['official-artwork'].front_default || p.sprites.front_default,
        types: p.types.map((t) => t.type.name),
      }));

      setPokemons((prev) => [...prev, ...newPokemons]);
      offsetRef.current += LIMIT;
      hasMoreRef.current = data.next !== null;
    } catch (e) {
      setError('Não foi possível carregar os Pokémon. Verifique sua conexão.');
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  // Carrega os 20 primeiros ao abrir o app
  useEffect(() => {
    loadPokemons();
  }, []);

  const renderFooter = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#E3350D" style={{ marginVertical: 20 }} />;
    }
    if (error) {
      return (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadPokemons}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#E3350D" />
      <View style={styles.header}>
        <Text style={styles.title}>Pokédex</Text>
      </View>

      <FlatList
        style={{ flex: 1 }}
        onLayout={(e) => setListHeight(e.nativeEvent.layout.height)}
        data={listHeight > 0 ? pokemons : []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <PokemonCard pokemon={item} height={cardHeight} imageSize={imageSize} />
        )}
        numColumns={COLUMNS}
        contentContainerStyle={styles.list}
        onEndReached={loadPokemons}      // ao chegar no fim dos 20, busca os próximos 20
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  header: {
    backgroundColor: '#E3350D',
    paddingTop: 50,
    paddingBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  list: {
    padding: LIST_PADDING,
  },
  card: {
    flex: 1,
    margin: CARD_MARGIN,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  number: {
    position: 'absolute',
    top: 10,
    right: 12,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#888',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 8,
  },
  typesRow: {
    flexDirection: 'row',
    marginTop: 6,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  typeBadge: {
    backgroundColor: '#EEE',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    margin: 2,
  },
  typeText: {
    color: '#444',
    fontSize: 12,
    fontWeight: '600',
  },
  errorBox: {
    alignItems: 'center',
    marginVertical: 20,
  },
  errorText: {
    color: '#C00',
    marginBottom: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#E3350D',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
