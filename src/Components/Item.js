import React from 'react'
import '../styles/item.css'
export default function Item(props) {
  const imageSrc = props.background === 'whitebackground' 
  ? props.dataArray.image 
  : props.dataArray2.image;
  return (
    <>
    <div className={`itemDiv ${props.background==='whitebackground'?'white':'black'}` } onClick={props.onClick}>
     <img src={imageSrc} onClick={props.onClick}/>
        <div onClick={props.onClick}>{props.dataArray['detail']}</div>
    </div>
    </>
  )
}
