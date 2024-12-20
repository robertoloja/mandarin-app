import React from 'react';
import './Definition.css';
import Hanzi from './Hanzi';

function Definition(props: {
  word: string,
  onclick: any,
  definitions: string[],
  character_definitions: Record<string, {english: string, pinyin: string, simplified: string}>
}) {
  return (
    <div className="definition">
      <div className="close-button" onClick={props.onclick}>X</div>

        {props.word.split('').map((hanzi, index) => 
          <Hanzi hanzi={hanzi} 
            pinyin={props.character_definitions[hanzi].english} />
        )}
      
      <p>{props.definitions.join('; ')}</p>
    </div>
  )
}

export default Definition;