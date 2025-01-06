const axios = require("axios");
const { initializeApp } = require("firebase/app");
const { getDatabase, ref, set } = require("firebase/database");

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD7dfS8sMmblgpC29lp0yzhMM-qbPFe19U",
  authDomain: "pokeday-95320.firebaseapp.com",
  databaseURL: "https://pokeday-95320-default-rtdb.firebaseio.com",
  projectId: "pokeday-95320",
  storageBucket: "pokeday-95320.appspot.com",
  messagingSenderId: "1083376538339",
  appId: "1:1083376538339:web:71a8706a9e072a65ed6bd6",
  measurementId: "G-4HP8CJ7Z17",
};

// Inicialize o Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Dias da semana
const daysOfWeek = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

// Função para capitalizar a primeira letra de uma string
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Função para buscar um Pokémon aleatório
async function getRandomPokemon() {
  const randomId = Math.floor(Math.random() * 890) + 1; // Gera um número entre 1 e 898
  const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomId}`);

  const types = response.data.types.map((t) => capitalizeFirstLetter(t.type.name));

  const newPokemonData = {
    height: response.data.height / 10, // Converter para metros
    weight: response.data.weight / 10, // Converter para quilogramas
    name: capitalizeFirstLetter(response.data.name),
    game: response.data.game_indices.length
      ? capitalizeFirstLetter(response.data.game_indices[0].version.name)
      : "Unknown",
    url: response.data.sprites.front_default,
    type: types.length === 2 ? types : [types[0], types[0]], // Repete o primeiro tipo se não houver o segundo
  };

  return newPokemonData;
}

// Função para gerar e armazenar Pokémon para cada dia da semana
async function populatePokemonForWeek() {
  const pokemonData = {};

  for (const day of daysOfWeek) {
    const pokemon = await getRandomPokemon(); // Busca um Pokémon aleatório
    pokemonData[day] = pokemon; // Associa o Pokémon ao dia da semana
  }

  // Envia os dados para o Firebase
  await set(ref(database, "pokemons"), pokemonData);
  console.log("Pokémons para cada dia da semana adicionados ao Firebase com sucesso!");
}

// Executar a função de preenchimento
populatePokemonForWeek().catch(console.error);
