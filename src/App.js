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
      results: [],
      checks: [],
      basket: []
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

  getbtnText = () => {
    if(this.state.basket.Items == 0){
      document.getElementById("orderBtn").innerHTML = "No Items selected";
      document.getElementById("orderBtn").disabled = true;
    }else{
      document.getElementById("orderBtn").innerHTML = "Order R " + this.state.basket.price.toFixed(2);
      document.getElementById("orderBtn").disabled = false;
    }
  }
  
  handleChecked = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const thisID = parseInt(target.name);

    var thisChecks = this.state.checks;
    thisChecks.forEach(function(check, indx){
      if(check.id == thisID){
        var thisCheck = check;
        thisCheck.checked = value;
        thisChecks.splice(indx,1,thisCheck);
      }
    });
    this.state.checked = thisChecks;
    this.calculateOrder();
    this.getbtnText();
  }

  // getChecked = (event) => {
  //   const target = event.target;
  //   const thisID = parseInt(target.name);
  //   this.state.checks.forEach(function(check, indx){
  //     if(check.Id == thisID){
  //       return check.checked;
  //     }
  //   });
  // }

  calculateOrder = () => {
      var thisBasket = [];
      var thisChecks = this.state.checks;
      var total = 0;

      thisChecks.forEach(function(check, indx){
        if(check.checked){
          total = total + check.price;
          thisBasket.push(check);
        }
      });

      var finalBasket = {};
      finalBasket.Items = thisBasket.length;
      finalBasket.ItemInfo = thisBasket;
      finalBasket.price = total;
      this.state.basket = finalBasket;
  }

  placeOrder = () => {
    console.log("place order");
    axios.put('http://localhost:3005/orders', this.state.basket);
    document.getElementById("orderBtn").innerHTML = "No Items selected";
    document.getElementById("orderBtn").disabled = true;
    alert("Your order has been placed!");
  }

  handleSearch = () => {
    this.getCities();
    this.getSuburbs();
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

    //axios.get('http://localhost:3005/shops', { params }).then(res => this.setState({results: res.data})).then(this.handleFilter());
    axios.get('http://localhost:3005/shops', { params }).then(res => this.setState({results: res.data})).then(this.setState({shops: this.handleFilter()}));
  }

  handleFilter = () => {
    var hitCount = 0;
    var searchString = this.state.keywords.toLowerCase().split(" ");
    var filteredResult = [];
    var thisChecks = [];
    
    //For every result
    this.state.results.forEach(function(result,indx) {
      //Loop through keywords
      searchString.forEach(function(word, indx){
        //Loop through categories
        console.log("For each " + word);
        result.Categories.forEach(function(category, indx){
          //Does the category name contain the keyword
          console.log(category.Name + " includes " + word);
          if(category.Name.toLowerCase().includes(word)){
            hitCount++;
            category["active"] = true;
          }
          //Check MenuItems for keyword matches
          category.MenuItems.forEach(function(item, indx){
            if(item.Name.toLowerCase().includes(word)){
              hitCount++;
              item["active"] = true;
            }
            thisChecks.push({"id" : item.Id,"checked": false, "price": item.Price});
          });
        });
      });
      //Add hits to the result object
      result["keyword_hits"] = hitCount;
      hitCount = 0; //Reset  
    });
    console.log("Before Data: " + JSON.stringify(this.state.results));
    filteredResult = this.state.results;

    filteredResult.sort(function(a, b) {
      if(b.keyword_hits === a.keyword_hits){
        return (a.Rank - b.Rank)
      }
      return (b.keyword_hits - a.keyword_hits);
    });

    for (var i = filteredResult.length - 1; i >= 0; --i) {
      if (filteredResult[i].keyword_hits == 0) {
        filteredResult.splice(i,1);
      }
    }

    //this.setState({results: filteredResult});
    //this.state.results = filteredResult;
    console.log("After data: " + JSON.stringify(filteredResult));
    this.state.checks = thisChecks;
    console.log("Checks: " + JSON.stringify(this.state.checks));
    return filteredResult;
  }

  render() {
    return (
      <div className="App">
        <form onSubmit={this.handleSearch}>
          <div className="title">Search</div>
          <input placeholder="search" type="text" value={this.state.keywords} onChange={this.handleChange('keywords')}/>
          <button type="button" class="btn btn-primary" onClick={this.handleSearch}>Search</button>
        </form>
        <ul className="list">
          {this.state.shops.length > 0 ? this.state.shops.map((x, i) => 
            <div className="container">
              <div className="row">
                <div className="card col-12 my-3">
                  <div className="card-body">
                    <div className="media" key={i}>
                      <img className="align-self-start mr-3" src={x.LogoPath} alt="Generic placeholder image" width="64px"/>
                      <div className="media-body">
                      <h5 className="mt-0">{x.Name} - {x.Suburb} - rated #{x.Rank + 1} overall</h5>
                        {x.Categories.length > 0 ? x.Categories.map((y, i) =>        
                          <div className="col-12">
                            <h4>{y.Name}</h4>
                            {y.MenuItems.length > 0 ? y.MenuItems.map((j, i) => 
                              <div className="form-check">
                                <input className="form-check-input" type="checkbox" name={j.Id} checked={j.selected} onChange={this.handleChecked} value="" id="flexCheckDefault" />
                                <label className="form-check-label" for="flexCheckDefault">
                                {j.Name} - R{j.Price}
                              </label>
                            </div>
                            ): <div>No Items found!</div>}
                          </div>
                        ) : <div>No Categories found!</div> }
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          ) : <div>No Shops found!</div>}          
        </ul>
        <div className="col-12">
          <div id="orderBtn" type="button" class="btn btn-primary" onClick={this.placeOrder} disabled>No Items selected</div>
        </div>
      </div>
    );
  }
}


export default App;
