import React, { useState, useEffect } from 'react';
import { TiSocialInstagramCircular, TiArrowUpThick, TiArrowDownThick } from 'react-icons/ti';
import './styles.css';
import logo from './assets/logo.png';
import api from './services/api';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

function App() {
  const [input, setInput] = useState('');
  const [pokemonDataList, setPokemonDataList] = useState([]);
  const [pokemonNames, setPokemonNames] = useState([]);
  const [randomPokemon, setRandomPokemon] = useState(null);
  const [correctGuess, setCorrectGuess] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [guessedPokemon, setGuessedPokemon] = useState(null);
  const [guessedToday, setGuessedToday] = useState(false);

  const firebaseConfig = {
    apiKey: "AIzaSyD7dfS8sMmblgpC29lp0yzhMM-qbPFe19U",
    authDomain: "pokeday-95320.firebaseapp.com",
    databaseURL: "https://pokeday-95320-default-rtdb.firebaseio.com",
    projectId: "pokeday-95320",
    storageBucket: "pokeday-95320.appspot.com",
    messagingSenderId: "1083376538339",
    appId: "1:1083376538339:web:71a8706a9e072a65ed6bd6",
    measurementId: "G-4HP8CJ7Z17"
  };
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  const db = firebase.database();

  useEffect(() => {
    checkIfGuessedToday();
  }, []);

  async function handleSearch() {
    if (input === '') {
      alert('Escreva um Pokémon');
      return;
    }

    try {
      if (guessedToday) {
        setInput('');
        setModalOpen(true);
        return;
      }

      const response = await api.get(`${input.toLowerCase()}/`);
      const newPokemonData = {
        height: response.data.height / 10,
        weight: response.data.weight / 10,
        name: capitalizeFirstLetter(response.data.name),
        game: capitalizeFirstLetter(response.data.game_indices[0].version.name),
        url: response.data.sprites.front_default,
        type: [capitalizeFirstLetter(response.data.types[0].type.name)],
      };

      if (typeof response.data.types[1] !== 'undefined') {
        newPokemonData.type.push(
          capitalizeFirstLetter(response.data.types[1].type.name)
        );
      } else {
        newPokemonData.type.push(
          capitalizeFirstLetter(response.data.types[0].type.name)
        );
      }

      if (randomPokemon) {
        const heightMatch = newPokemonData.height === randomPokemon.height;
        const weightMatch = newPokemonData.weight === randomPokemon.weight;
        const nameMatch = newPokemonData.name === randomPokemon.name;
        const gameMatch = newPokemonData.game === randomPokemon.game;
        const type1Match = newPokemonData.type[0].toLowerCase() === randomPokemon.type[0].toLowerCase();
        const type2Match = newPokemonData.type[1].toLowerCase() === randomPokemon.type[1].toLowerCase();
        const isMatch =
          heightMatch &&
          weightMatch &&
          nameMatch &&
          gameMatch &&
          type1Match &&
          type2Match;

        const bgColorClass = isMatch ? 'match' : 'no-match';
        const textColorClass = isMatch ? 'text-match' : 'text-no-match';
        const type1ColorClass = type1Match ? 'type-match' : 'type-no-match';
        const type2ColorClass = type2Match ? 'type-match' : 'type-no-match';
        const nameColorClass = nameMatch ? 'type-match' : 'type-no-match';
        const gameColorClass = gameMatch ? 'type-match' : 'type-no-match';
        const heightColorClass = heightMatch ? 'type-match' : 'type-no-match';
        const weightColorClass = weightMatch ? 'type-match' : 'type-no-match';

        newPokemonData.bgColorClass = bgColorClass;
        newPokemonData.textColorClass = textColorClass;
        newPokemonData.type1ColorClass = type1ColorClass;
        newPokemonData.type2ColorClass = type2ColorClass;
        newPokemonData.nameColorClass = nameColorClass;
        newPokemonData.gameColorClass = gameColorClass;
        newPokemonData.heightColorClass = heightColorClass;
        newPokemonData.weightColorClass = weightColorClass;

        newPokemonData.heightArrowIcon = (
          <span className="arrow-icon">
            {heightMatch ? null : newPokemonData.height < randomPokemon.height ? (
              <TiArrowUpThick />
            ) : (
              <TiArrowDownThick />
            )}
          </span>
        );
        newPokemonData.weightArrowIcon = (
          <span className="arrow-icon">
            {weightMatch ? null : newPokemonData.weight < randomPokemon.weight ? (
              <TiArrowUpThick />
            ) : (
              <TiArrowDownThick />
            )}
          </span>
        );

        if (isMatch) {
          setCorrectGuess(true);
          setAttempts((prevAttempts) => prevAttempts + 1);

          const today = new Date().toISOString().split('T')[0];
          localStorage.setItem('lastGuessData', JSON.stringify({ date: today, guessed: true }));

          setGuessedPokemon(newPokemonData);
          setModalOpen(true);
        }
      }

      setPokemonDataList((prevList) => [...prevList, newPokemonData]);

      if (!correctGuess) {
        setInput('');
      }

    } catch {
      alert('Deu erro mané');
    }
  }

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  useEffect(() => {
    if (input.trim() === '' && pokemonNames.length > 0) {
      setPokemonNames([]);
    }
  }, [input, pokemonNames]);

  async function handleInput() {
    const searchTerm = input.toLowerCase();

    if (searchTerm === '') {
      setPokemonNames([]);
      return;
    }

    const response = await fetch('https://pokeapi.co/api/v2/pokemon/?offset=0&limit=898');
    const data = await response.json();
    const pokemonResults = data.results;

    const filteredPokemonResults = pokemonResults.filter((pokemon) =>
      pokemon.name.startsWith(searchTerm)
    );

    const filteredPokemonNames = filteredPokemonResults.map((pokemon) => pokemon.name);

    setPokemonNames(filteredPokemonNames);
  }

  function handleSuggestionClick(name) {
    setInput(name);
    setPokemonNames([]);
  }

  useEffect(() => {
    async function fetchRandomPokemon() {
      try {
        if (!randomPokemon) {
          const today = new Date();
          const dayIndex = today.getDay();
          const daysOfWeek = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
          const currentDay = daysOfWeek[dayIndex];

          const pokemonRef = db.ref(`pokemons/${currentDay}`);

          // Puxando os dados do banco
          pokemonRef.limitToFirst(6).once('value', (snapshot) => {
            const pokemonSnapshot = snapshot.val(); // Pega o valor do snapshot

            if (pokemonSnapshot) {
              // Organizar os detalhes, verificando se os dados estão presentes
              const pokemonDetails = {
                name: pokemonSnapshot.name || 'Desconhecido',
                height: pokemonSnapshot.height || 'N/A',
                weight: pokemonSnapshot.weight || 'N/A',
                game: pokemonSnapshot.game || 'Desconhecido',
                url: pokemonSnapshot.url || '',
                type: Array.isArray(pokemonSnapshot.type)
                  ? [
                      pokemonSnapshot.type[0] || 'Desconhecido',
                      pokemonSnapshot.type[1] || 'Desconhecido'
                    ]
                  : ['Desconhecido', 'Desconhecido'],
              };

              // Log dos detalhes organizados

              setRandomPokemon(pokemonDetails); // Atualiza o estado com os dados
            } else {
            }
          });
        }
      } catch (error) {
        console.error('Erro ao buscar Pokémon do dia:', error);
      }
    }

    fetchRandomPokemon();
  }, [randomPokemon, db]);
  
  function checkIfGuessedToday() {
    const today = new Date().toISOString().split('T')[0];
    const lastGuessData = JSON.parse(localStorage.getItem('lastGuessData'));
    const hasGuessedToday = lastGuessData && lastGuessData.date === today && lastGuessData.guessed;

    if (hasGuessedToday) {
      setCorrectGuess(true);
    } else {
      setCorrectGuess(false);
    }

    // Reset correct guess if it's a new day
    if (lastGuessData && lastGuessData.date !== today) {
      setCorrectGuess(false);
    }

    setGuessedToday(hasGuessedToday);
  }

  return (
    <div className="container">
      <div className="header">
        <img src={logo} alt="Pokeday" className="logo-image" />
      </div>

      <div className="containerInput">
        <input
          type="text"
          placeholder={
            correctGuess
              ? 'Você acertou!'
              : 'Digite um Pokémon'
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onInput={handleInput}
          disabled={correctGuess}
        />
      </div>
      <button className="buttonSearch" onClick={handleSearch}>
        <TiSocialInstagramCircular size={25} color="rgba(255, 0, 0, 0)" />
      </button>
      <div className="suggestions">
        <ul>
          {pokemonNames.map((name) => (
            <li key={name} onClick={() => handleSuggestionClick(name)}>
              {name}
            </li>
          ))}
        </ul>
      </div>

      <div className="pokemonList">
        {pokemonDataList.slice().reverse().map((pokemonData, index) => (
          <div key={index} className={`pokemonInfo ${pokemonData.bgColorClass}`}>
            <img src={pokemonData.url} alt={pokemonData.name} />
            <div className="infoContainer">
              <div
                className={`infoBox ${pokemonData.textColorClass} ${pokemonData.nameColorClass}`}
              >
                <p
                  className={
                    pokemonData.nameColorClass === 'type-match'
                      ? 'background-match'
                      : 'background-no-match'
                  }
                >
                  Nome
                </p>
                <p
                  className={
                    pokemonData.nameColorClass === 'type-match'
                      ? 'background-match'
                      : 'background-no-match'
                  }
                >
                  {pokemonData.name}
                </p>
              </div>

              <div
                className={`infoBox ${pokemonData.textColorClass} ${pokemonData.gameColorClass}`}
              >
                <p
                  className={
                    pokemonData.gameColorClass === 'type-match'
                      ? 'background-match'
                      : 'background-no-match'
                  }
                >
                  Jogo
                </p>
                <p
                  className={
                    pokemonData.gameColorClass === 'type-match'
                      ? 'background-match'
                      : 'background-no-match'
                  }
                >
                  {pokemonData.game}
                </p>
              </div>

              <div
                className={`infoBox ${pokemonData.textColorClass} ${pokemonData.heightColorClass}`}
              >
                <p
                  className={
                    pokemonData.heightColorClass === 'type-match'
                      ? 'background-match'
                      : 'background-no-match'
                  }
                >
                  Altura
                </p>
                <p
                  className={
                    pokemonData.heightColorClass === 'type-match'
                      ? 'background-match'
                      : 'background-no-match'
                  }
                >
                  {pokemonData.height} M{pokemonData.heightArrowIcon}
                </p>
              </div>

              <div
                className={`infoBox ${pokemonData.textColorClass} ${pokemonData.weightColorClass}`}
              >
                <p
                  className={
                    pokemonData.weightColorClass === 'type-match'
                      ? 'background-match'
                      : 'background-no-match'
                  }
                >
                  Peso
                </p>
                <p
                  className={
                    pokemonData.weightColorClass === 'type-match'
                      ? 'background-match'
                      : 'background-no-match'
                  }
                >
                  {pokemonData.weight} Kg{pokemonData.weightArrowIcon}
                </p>
              </div>

              <div
                className={`infoBox ${pokemonData.textColorClass} ${pokemonData.type1ColorClass}`}
              >
                <p
                  className={
                    pokemonData.type1ColorClass === 'type-match'
                      ? 'background-match'
                      : 'background-no-match'
                  }
                >
                  Tipo 1
                </p>
                <p
                  className={
                    pokemonData.type1ColorClass === 'type-match'
                      ? 'background-match'
                      : 'background-no-match'
                  }
                >
                  {pokemonData.type[0]}
                </p>
              </div>

              <div
                className={`infoBox ${pokemonData.textColorClass} ${pokemonData.type2ColorClass}`}
              >
                <p
                  className={
                    pokemonData.type2ColorClass === 'type-match'
                      ? 'background-match'
                      : 'background-no-match'
                  }
                >
                  Tipo 2
                </p>
                <p
                  className={
                    pokemonData.type2ColorClass === 'type-match'
                      ? 'background-match'
                      : 'background-no-match'
                  }
                >
                  {pokemonData.type[1]}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && guessedPokemon && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setModalOpen(false)}>&times;</span>
            {guessedPokemon && (
              <>
                <img src={guessedPokemon.url} alt={guessedPokemon.name} />
                <h2>Parabéns!</h2>
                <p>Você acertou o Pokémon {guessedPokemon.name}!</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
