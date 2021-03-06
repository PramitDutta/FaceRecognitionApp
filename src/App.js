import React, { Component } from 'react';
import './App.css';
import Navigation from './components/navigation/Navigation.js';
import FaceRecognition from './components/facerecognition/FaceRecognition.js';
import Logo from './components/logo/Logo.js';
import Signin from './components/signin/Signin.js';
import Register from './components/register/Register.js';
import ImageLinkForm from './components/imageLinkForm/ImageLinkForm.js';
import Rank from './components/rank/Rank.js';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';

const app = new Clarifai.App({
 apiKey: 'a4dee455172240e7beee04a88d6abc23'
});

const particleOptions={
  particles: {
    number:{
      value:70,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}
class App extends Component {
  constructor(){
    super();
    this.state={
      input: '',
      imageUrl:'',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user:{
        id: '',
        name: '',
        email:'',
        entries: 0,
        joined: ''
      }
    }
  }

  loadUser=(data)=>{
    this.setState({user: {
        id: data.id,
        name: data.name,
        email:data.email,
        entries: data.entries,
        joined: data.joined
    }})
  }

  calculateFaceLocation=(data)=>{
      const clarifaiFace= data.outputs[0].data.regions[0].region_info.bounding_box;
      const image= document.getElementById('inputImage');
      const width= Number(image.width);
      const height= Number(image.height);
      //console.log(width, height);
      return{
        leftCol:clarifaiFace.left_col * width,
        topRow:clarifaiFace.top_row * height,
        rightCol:width-(clarifaiFace.right_col * width),
        bottomRow: height-(clarifaiFace.bottom_row * height)
      }
  }
  displayFaceBox=(box)=>{
    this.setState({box: box})
  }
  onInputChange=(event)=>{
    //console.log(event.target.value);
    this.setState({input: event.target.value});
  }
  onButtonSubmit=()=>{
    //onsole.log('click');
    this.setState({imageUrl: this.state.input})
    app.models.predict(
      Clarifai.FACE_DETECT_MODEL, 
      this.state.input)
      .then(response =>{
        if(response){
          fetch('http://localhost:3001/image',{
                method:'put',
                headers:{
                  'Content-Type':'application/json'
                },
                body: JSON.stringify({
                  email:this.state.user.id,
                })
          })
            .then(response => response.json())
            .then(count=> {
              this.setState({user:{
                entries: count
              }})
            })

        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(err=> console.log(err));
  }

  onRouteChange=(route)=>{
    if(route === 'signout'){
      this.setState({isSignedIn: false })
    }else if(route === 'home'){
      this.setState({isSignedIn: true })
    }
    this.setState({route: route});
  }
  render() {
    const { isSignedIn, imageUrl, route, box} = this.state;
    return (
      <div className="App">
        <Particles className='particles'
          params={particleOptions}
        />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
        { route ==='home'
          ? <div>
              <Logo />
              <Rank name={this.state.user.name} entries={this.state.user.entries} 
              />
              <ImageLinkForm 
                onInputChange={this.onInputChange}           
                onButtonSubmit={this.onButtonSubmit}
              />
              <FaceRecognition box={box} imageUrl={imageUrl}/>
            </div>
            :(
                this.state.route === 'signin'
                ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
                : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
              )
        }
      </div>
    );
  }
}

export default App;
