import React, { Component } from "react";
import Type from './Type'

export default class TypeWriter extends Component {
  constructor(props) {
    // code
    super(props)
  }

  // methods
  render() {
    const { word, totalTime } = this.props
    const chars = word.split('')


    return (
      <span ref={(ref) => {
        this.ref = ref
      }}>
        {
          chars.map((char, i) =>
            <Type 
              minDelay={(i*10)+10} 
              maxDelay={(i*10)+100} 
              iterations={4}
              char={char} 
              key={i} />
          )
        }
      </span>)
  }
}