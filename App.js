import React, { useState, useEffect } from 'react';
import { TiSocialInstagramCircular, TiArrowUpThick, TiArrowDownThick } from 'react-icons/ti';
import './styles.css';
import logo from './assets/logo.png';
import api from './services/api';

function App() {
  const [input, setInput] = useState('');
  const [pokemonDataList, setPokemonDataList] = useState([]);
  const [pokemonNames, setPokemonNames] = useState([]);
  const [randomPokemon, setRandomPokemon] = useState(null);
  const [correctGuess, setCorrectGuess] = useState(false);
  const [attempts, setAttempts] = useState(0);

  async function handleSearch() {
    if (input === '') {
      alert('Escreva um Pokémon');
      return;
    }

    try {
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
        const type1Match = newPokemonData.type[0] === randomPokemon.type[0];
        const type2Match = newPokemonData.type[1] === randomPokemon.type[1];

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

        // Update the state when the guess is correct
        if (isMatch) {
          setCorrectGuess(true);
          setAttempts((prevAttempts) => prevAttempts + 1);
        }
      }

      setPokemonDataList((prevList) => [...prevList, newPokemonData]);

      // Clear input only if the guess is not correct
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
          const maxRetries = 3;
          let retryCount = 0;

          while (retryCount < maxRetries) {
            const randomPokemonId = Math.floor(Math.random() * 898);

            try {
              const response = await api.get(`/${randomPokemonId}/`);

              const randomPokemonData = {
                height: response.data.height / 10,
                weight: response.data.weight / 10,
                name: capitalizeFirstLetter(response.data.name),
                game: capitalizeFirstLetter(
                  response.data.game_indices[0].version.name
                ),
                type: [
                  capitalizeFirstLetter(response.data.types[0].type.name),
                ],
              };

              if (typeof response.data.types[1] !== 'undefined') {
                randomPokemonData.type.push(
                  capitalizeFirstLetter(response.data.types[1].type.name)
                );
              } else {
                randomPokemonData.type.push(
                  capitalizeFirstLetter(response.data.types[0].type.name)
                );
              }

              setRandomPokemon(randomPokemonData);
              break;
            } catch (error) {
              console.error(
                'Erro ao buscar Pokémon aleatório:',
                error
              );
              retryCount++;
            }
          }

          if (retryCount === maxRetries) {
            console.error(
              'Número máximo de tentativas atingido. Falha ao buscar Pokémon aleatório.'
            );
          }
        }
      } catch (error) {
        console.error(
          'Erro ao buscar Pokémon aleatório:',
          error
        );
      }
    }

    fetchRandomPokemon();
  }, [randomPokemon]);

  useEffect(() => {
    if (correctGuess) {
      alert(`Parabéns! Você acertou o Pokémon em ${attempts + 1} tentativas.`);
    }
  }, [correctGuess, attempts]);

  return (
    <div className="container">
      <div className="header">
        <img src={logo} alt="Pokeday" className="logo-image" />
      </div>

      <div className="containerInput">
        {/* Add the containerInput::before styles to create space for the input */}
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
    </div>
  );
}

export default App;
