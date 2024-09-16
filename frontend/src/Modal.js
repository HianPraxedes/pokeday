import React from 'react';
import './Modal.css';

const Modal = ({ pokemon }) => {
  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close">&times;</span>
        <h2>Parabéns, você acertou o Pokémon de hoje!</h2>
        <img src={pokemon.url} alt={pokemon.name} />
        <p>{pokemon.name}</p>
      </div>
    </div>
  );
};

export default Modal;
