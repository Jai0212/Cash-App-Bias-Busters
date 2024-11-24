import React from 'react';
import { FaVolumeUp } from 'react-icons/fa';
import './SpeakerButton.css';


const SpeakerButton = ({ message }) => {
  const speakMessage = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = 'en-US'; 
      utterance.rate = 1; 
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-Speech is not supported in this browser.');
    }
  };

  return (
    <button
      className="btn rounded-circle p-3 speaker-button"
      onClick={speakMessage}
      aria-label="Read message aloud"
      title="Read message aloud"
    >
      <FaVolumeUp aria-hidden="true" />
    </button>
  );
};

export default SpeakerButton;
