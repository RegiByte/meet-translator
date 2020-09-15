import React, {useEffect, useState} from "react";
import {hot} from "react-hot-loader";
import messageTypes from "../constants/messageTypes";

function TranslationList(props) {
  const [blocks, setBlocks] = useState([])

  useEffect(() => {
    const port = chrome.runtime.connect({
      name: 'listener'
    })

    port.onMessage.addListener(({type, data}) => {
      console.log(type, data)
      if (type === messageTypes.CAPTIONS_UPDATE) {
        setBlocks(currentBlocks => {
          console.log(data)
          const newBlocks = [...currentBlocks]
          data.forEach(block => {
            const matchingBlockIndex = currentBlocks.findIndex(existingBlock => existingBlock.id === block.id)
            console.log(matchingBlockIndex)
            if (matchingBlockIndex > -1) {
              console.log('update it is', block)
              newBlocks[matchingBlockIndex] = block
            } else {
              console.log('create itt  is', block)
              newBlocks.push(block)
            }
          })
          console.log(currentBlocks, newBlocks)
          return newBlocks
        })
      }
    })
  }, [])

  return (
    <div>
      {!blocks.length ? (
        <div>
          Nenhuma tradução disponivel ainda
        </div>
      ) : (
        <div>
          {blocks.map(block => (
            <div key={block.id}>
              <div>
                <img src={block.picture} alt={block.name}/>
                <span>{block.name}</span>
              </div>
              <div>
                {block.phrase}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TranslationList
