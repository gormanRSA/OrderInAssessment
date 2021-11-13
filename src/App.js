import React, { Component } from 'react';
import axios from 'axios';
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      keywords: '',
      age: '',
      shops: [],
      cities: [],
      suburbs: [],
      results: []
    }
  }

  componentDidMount() {
    this.getShops();
    this.getCities();
    this.getSuburbs();
  }

  getShops = () => {
    axios.get('http://localhost:3005/shops').then(res => this.setState({shops: res.data}));
  }

  getCities = () => {
    const shops = this.state.shops;
    const citySelection = [...new Set(shops.map(item => item.City))];
    citySelection.map((City) => (
      this.state.cities.push(City)
    ));
  }

  getSuburbs = () => {
    const shops = this.state.shops;
    const suburbSelection = [...new Set(shops.map(item => item.Suburb))];
    suburbSelection.map((Suburb) => (
      this.state.suburbs.push(Suburb)
    ));
  }

  handleChange = (name) => event => {
    this.setState({ [name]: event.target.value });
  }
  
  handleRemove = (id) => {
    axios.delete(`http://localhost:3005/shops/${id}`).then(() => this.getShops());
  }

  handleSearch = () => {

    this.getCities();
    this.getSuburbs();

    console.log("Cities: " + JSON.stringify(this.state.cities));
    console.log("Suburbs: " + JSON.stringify(this.state.suburbs));


    var searchString = this.state.keywords.toLowerCase();

    var params = {};

    this.state.cities.forEach(function(city,indx) {
        if(searchString.includes(city.toLowerCase())){
          params["City"] = city;
        }
          
    });

    this.state.suburbs.forEach(function(suburb,indx) {
      if(searchString.includes(suburb.toLowerCase())){
        params["Suburb"] = suburb;
      }
    });

    console.log(JSON.stringify(params));

    axios.get('http://localhost:3005/shops', { params }).then(res => this.setState({results: res.data})).then(this.handleFilter());

    
  }

  // handleEdit = (value) => {
  //   axios.put(`http://localhost:3005/shops/${value.Id}`, {name: value.name, age: value.age})
  //     .then(() => this.getUsers())
  // }

  handleFilter = () => {
    var hitCount = 0;
    var searchString = this.state.keywords.toLowerCase().split(" ");
    //For every result
    this.state.results.forEach(function(result,indx) {
      //Loop through keywords
      searchString.forEach(function(word, indx){
        //Loop through categories
        result.Categories.forEach(function(category, indx){
          //Does the category name contain the keyword
          if(category.Name.includes(word)){
            hitCount++;
            category["active"] = true;
          }
          //Check MenuItems for keyword matches
          category.MenuItems.forEach(function(item, indx){
            if(item.Name.includes(word)){
              hitCount++;
              item["active"] = true;
            }
          });
        });
      });
      //Add hits to the result object
      result["keyword-hits"] = hitCount;   
    });
    console.log("Filter Data: " + JSON.stringify(this.state.results));
  }

  render() {
    return (
      <div className="App">
        <form onSubmit={this.handleSearch}>
          <div className="title">Search</div>
          <input placeholder="search" type="text" value={this.state.keywords} onChange={this.handleChange('keywords')}/>
          <div className="btn"  onClick={this.handleSearch}>send</div>
        </form>
        <div className="title">all users</div>
        <ul className="list">
          {this.state.results.length > 0 ? this.state.results.map((x, i) => 
            //<User key={i} user={x} remove={() => this.handleRemove(x.id)} edit={this.handleEdit}/>
            <li className="item" key={i}>
              <input value={x.Name} disabled/>
              <input value={x.City} disabled/>
              <div className="btn-edit" onClick={this.handleEdit}>edit</div>
              <div className="btn-remove" onClick={() => this.handleRemove(x.id)}>remove</div>
            </li>
          ) : <div>add some users</div>}          
        </ul>
      </div>
    );
  }
}


export default App;
