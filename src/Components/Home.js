import React, { useReducer } from 'react';
import Item from './Item';
import Upload from './Upload';
import Decompress from './Decompress'; // Import the Decompress component
import text from '../images/text.png';
import image from '../images/image.png';
import audio from '../images/audio.png';
import textw from '../images/textw.png';
import imagew from '../images/imagew.png';
import audiow from '../images/audiow.png';
import '../styles/home.css';

const initialState = {
  type: '',
  display: true,
  typeoffile: '',
};

function reducer(state, action) {
  switch (action.type) {
    case 'upload':
      return { ...state, display: false, typeoffile: action.typeoffile };
    case 'home':
      return { ...state, display: true, typeoffile: '', type: '' };
    default:
      return state;
  }
}

export default function Home(props) {
  const dataArray = [
    { image: text, detail: 'Text File' },
    { image: image, detail: 'Image File' },
    { image: audio, detail: 'Audio File' },
  ];
  const dataArray2 = [
    { image: textw, detail: 'Text File' },
    { image: imagew, detail: 'Image File' },
    { image: audiow, detail: 'Audio File' },
  ];

  const [state, dispatch] = useReducer(reducer, initialState);
  const { display, typeoffile } = state;

  const handle = (value) => {
    dispatch({ type: 'upload', typeoffile: value });
  };

  const back = () => {
    dispatch({ type: 'home' });
  };

  return (
    <div className='homediv'>
      {display ? (
        <>
          <Item
            background={props.background}
            dataArray={dataArray[0]}
            dataArray2={dataArray2[0]}
            onClick={() => handle('.txt')}
          />
          <Item
            background={props.background}
            dataArray={dataArray[1]}
            dataArray2={dataArray2[1]}
            onClick={() => handle('image/*')}
          />
          <Item
            background={props.background}
            dataArray={dataArray[2]}
            dataArray2={dataArray2[2]}
            onClick={() => handle('audio/*')}
          />
        </>
      ) : (
        <>
    <Upload
      background={props.background}
      back={back}
      typeoffile={typeoffile}
      text="Compression"
    />
    {typeoffile && (
      <Decompress
        background={props.background}
        back={back}
        typeoffile={typeoffile}
        text="Decompression"
      />
    )}
  </>
      )}
    </div>
  );
}
