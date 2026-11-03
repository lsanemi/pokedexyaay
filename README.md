# Pokédex

App de Pokédex feito em React Native com Expo, usando a [PokeAPI](https://pokeapi.co/).

## Funcionalidades

- Lista os 20 primeiros Pokémon ao abrir o app
- Ao arrastar até o fim da lista, carrega os próximos 20 (scroll infinito com `FlatList` + `onEndReached`)
- Cada card mostra a imagem, o número, o nome e a tipagem do Pokémon
- Indicador de carregamento e botão de "Tentar novamente" em caso de erro de conexão

## Como rodar

```bash
npm install
npx expo start
```

Depois é só escanear o QR code com o app Expo Go (Android) ou com a Câmera (iOS).
