import React, { Component } from 'react'
import TypeWriter from '../components/TypeWriter'
import ThreeScene from '../components/ThreeScene'
import * as visualization from './viz.js'

import { playSfx } from '../lib/sfx'
import { Motion, spring } from 'react-motion'
import MotionButton from "../components/MotionButton";
import Navigation from '../components/Navigation'
import Paper from '../components/Paper'

import THREE from 'three'
import TWEEN from 'tween'

require('./styles/home.css')

export default class Scene extends Component {

  constructor(props) {
    super(props)
    this.state = {
      mouseover: false,
      author: false,
      launched: false,
      pageIdx: -1,
      showNavigation: false,
      audioLoaded: false
    }

    this.mouseOver = this.mouseOver.bind(this)
    this.mouseOut = this.mouseOut.bind(this)

  }

  componentDidMount() {
    this.audioEl = document.getElementById('track')

    function isLoaded() {
      return this.audioEl.readyState == 4
    }

    function checkIsLoaded() {
      setTimeout(function() {
        if(isLoaded()) {
          return this.setState({
            audioLoaded: true
          })
        }
      }, 250)
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if(this.state.launched && !prevState.launched) {
      setTimeout(() => {
        visualization.init()
        visualization.animate()  
      }, 0)
      
    }
  }

  componentDidMount() {
    this.typewrite()
  }

  typewrite() {
    playSfx('sfx08', 0.2)
    setTimeout(() => {
      this.setState({
        author: !this.state.author
      })
      this.typewrite()
    }, 5000)
  }

  mouseOver() {
    playSfx('sfx05')
    this.setState({
      mouseover: true
    })
  }

  mouseOut() {
    this.setState({
      mouseover: false
    }) 
  }

  launch() {
    this.setState({
      launched: true
    })
  }

  render() {

    const { launched, pageIdx, showNavigation } = this.state
    const springParamsA = {stiffness: 60, damping: 12, precision: 0.1}
    const springParams = {stiffness: 20, damping: 20, precision: 0.1}
    const springParamsAlt = {stiffness: 80, damping: 16, precision: 0.1}

    let headerMotionStyle = {
      scale: spring(1), 
      opacity: spring(1),
      y: spring(0)
    }

    let buttonMotionStyle = {
      scale: spring(1), 
      opacity: spring(1),
      y: spring(0)
    }

    if(launched) {
      headerMotionStyle.scale = spring(.7, springParams)
      headerMotionStyle.opacity =spring(.25, springParams)
      headerMotionStyle.y = spring(-310, springParams)

      buttonMotionStyle.scale = spring(3, springParams)
      buttonMotionStyle.y = spring(200, springParams)
      buttonMotionStyle.opacity =  spring(0, springParams)
    }

    if(showNavigation) {
      headerMotionStyle.scale = spring(.7, springParamsA)
      headerMotionStyle.opacity = spring(.4, springParamsA)
      headerMotionStyle.y = spring(0, springParamsA)
      buttonMotionStyle = headerMotionStyle
    }

    return <div>

      {launched && <div id="visualization" />}

      <Motion
        defaultStyle={{
          scale: 1, 
          opacity: 1,
          y: 0
        }} 
        style={{
          scale: pageIdx > -1 ? spring(.9, springParamsAlt) : spring(1),
          opacity: pageIdx > - 1 ? spring(0, springParamsAlt) : spring(1),
          y: pageIdx > -1 ? spring(-100, springParamsAlt) : spring(0),
        }}>
        {values => 
          <div 
            style={{
              opacity: values.opacity,
              transform: `translate3d(0, ${values.y}vh, 0) scale(${values.scale})`,
            }}
            className="gt-screen gt-screen--home">
            <Motion 
              defaultStyle={{
                scale: 1, 
                y: 0,
                opacity: 1,
              }} 
              style={headerMotionStyle}>
              {values => 
                <div style={{
                  transform: `translate3d(0, ${values.y}px, 0) scale(${values.scale})`,
                  opacity: values.opacity
                }} className="gt-screen__title">
                  <h1 className="gt-title">
                    <TypeWriter word="glasstress" />
                  </h1>
                  <h2>
                    {this.state.author==0 && <TypeWriter word="max/casacci" />}
                    {this.state.author==1 && <TypeWriter word="daniele/mana" />}
                  </h2>
                </div>}
            </Motion>

            <div className="gt-screen__icosahedron">
              <Navigation 
                onToggle={this.toggleNavigation.bind(this)}
                onNavigate={this.navigate.bind(this)} />
            </div>

            <Motion defaultStyle={{
                scale: 1,
                opacity: 1, 
                y: 0,
              }} 
              style={buttonMotionStyle}>
              {values => 
                <div style={{
                  transform: `translate3d(0, ${values.y}px, 0)  scale(${values.scale})`,
                  opacity: values.opacity
                }} className="gt-screen__action">
                  <MotionButton 
                    onMouseOver={this.mouseOver}
                    onMouseOut={this.mouseOut}
                    onClick={this.launch.bind(this)}
                    className="gt-button gt-button--launch"
                    label="launch visualization*" /> 
                </div>}
            </Motion>


            {/*<div className="gt-screen__footer">
              <p className="gt-text gt-text--small">detect webgl</p>
            </div>*/}
          </div>}
      </Motion>

      {this.state.pageIdx > -1 &&
        <Motion
        defaultStyle={{
          scale: 1, 
          opacity: 1,
          y: 0
        }} 
        style={{
          scale: pageIdx > -1 ? spring(1, springParamsAlt) : spring(.7),
          opacity: pageIdx > - 1 ? spring(1, springParamsAlt) : spring(0),
          y: pageIdx > -1 ? spring(0, springParamsAlt) : spring(200),
        }}>
          {values => 
          <Paper style={{
            transform: `translate3d(0, ${values.y}px, 0) scale(${values.scale})`,
            opacity: values.opacity
          }}>
            
          </Paper>}
        </Motion>
      }

    </div>
  }

  toggleNavigation(shown) {
    console.log('toggle', shown)
    this.setState({
      showNavigation: shown
    })
  }

  navigate(item) {
    const pageIdx = item.id
    setTimeout(() => {
      this.setState({ pageIdx })    
    }, 250)
    
  }
}