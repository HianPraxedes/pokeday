import { useState, useEffect } from 'react';
import { TiSocialInstagramCircular } from 'react-icons/ti';
import './styles.css';

import api from './services/api';

function App() {
  const [input, setInput] = useState('');
  const [pokemonData, setPokemonData] = useState(null);
  const [pokemonNames, setPokemonNames] = useState([]);

  async function handleSearch() {
    if (input === '') {
      alert('Escreva um Pokémon');
      return;
    }

    try {
      const response = await api.get(`${input.toLowerCase()}`);
      const data = {
        height: response.data.height,
        weight: response.data.weight,
        name: capitalizeFirstLetter(response.data.name),  // Capitalize the first letter
        game: response.data.game_indices[0].version.name,
        url: response.data.sprites.front_default,
        type: [response.data.types[0].type.name],
      };

      if (typeof response.data.types[1] !== 'undefined') {
        data.type.push(response.data.types[1].type.name);
      } else {
        data.type.push(response.data.types[0].type.name);
      }

      setPokemonData(data);
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

    const response = await fetch(
      'https://pokeapi.co/api/v2/pokemon/?offset=0&limit=1025'
    );
    const data = await response.json();
    const pokemonResults = data.results;

    const filteredPokemonResults = pokemonResults.filter((pokemon) =>
      pokemon.name.includes(searchTerm)
    );

    const filteredPokemonNames = filteredPokemonResults.map((pokemon) => pokemon.name);

    setPokemonNames(filteredPokemonNames);
  }

  function handleSuggestionClick(name) {
    setInput(name);
    setPokemonNames([]);
  }

  return (
    <div className="container">
      <h1>Pokéday</h1>
  
      <div className="containerInput">
        <input
          type="text"
          placeholder="Digite um Pokémon"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onInput={handleInput}
        />
  
        <button className="buttonSearch" onClick={handleSearch}>
          <TiSocialInstagramCircular size={25} color="#FF0000" />
        </button>
      </div>
  
      <div className="suggestions">
        <ul>
          {pokemonNames.map((name) => (
            <li key={name} onClick={() => handleSuggestionClick(name)}>
              {name}
            </li>
          ))}
        </ul>
      </div>
  
      {pokemonData && (
        <div className="pokemonInfo">
          <img src={pokemonData.url} alt={pokemonData.name} />
          <div className="infoContainer">
            <div className="infoBox">
              <p>Name:</p>
              <p>{pokemonData.name}</p>
            </div>
            <div className="infoBox">
              <p>Game:</p>
              <p>{pokemonData.game}</p>
            </div>
            <div className="infoBox">
              <p>Height:</p>
              <p>{pokemonData.height}</p>
            </div>
            <div className="infoBox">
              <p>Weight:</p>
              <p>{pokemonData.weight}</p>
            </div>
            <div className="infoBox">
              <p>Type 1:</p>
              <p>{pokemonData.type[0]}</p>
            </div>
            <div className="infoBox">
              <p>Type 2:</p>
              <p>{pokemonData.type[1]}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
