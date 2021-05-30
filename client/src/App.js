import React, { Component } from "react";
import axios from 'axios';
import Cookies from 'js-cookie';
import LandRegistryContract from "./contracts/LandRegistry.json";
import getWeb3 from "./getWeb3";
import Header from './components/header'
import Login from './components/login'
import SuperAdmin from './components/superadmin'
import Admin from './components/admin'
import User from './components/user'
import Notif from './components/notif'

import './App.css';
import logout from './assets/poweroff.svg';

class App extends Component {
  state = { storageValue: 0, web3: null, accounts: null, contract: null, who: null, code: 0 };

  componentDidMount = async () => {
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = LandRegistryContract.networks[networkId];
      const instance = new web3.eth.Contract(
        LandRegistryContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      this.setState({ web3, accounts, contract: instance });
      if (Cookies.get("la57L0663D") && Cookies.get("la57L0663D") === this.state.accounts[0].toLowerCase()) {
        this.login()
      }
    } catch (error) {
      alert(`Failed to load web3, accounts, or contract. Check console for details.`,);
      console.error(error);
    }
  };

  //Smart Contract
  //Admin
  addAdminBC = async (adminAddress) => {
    const { accounts, contract } = this.state;
    console.log(adminAddress, accounts[0]);
    await contract.methods.addAdmin(adminAddress).send({ from: accounts[0] });
  }

  createPropertyBC = async (surveynumber, ownerAddress, marketValue, landType, citytown, district, state) => {
    const { accounts, contract } = this.state;
    await contract.methods.createProperty(surveynumber, ownerAddress, marketValue, landType, citytown, district, state).send({ from: accounts[0] })
  }

  propertyEnquiryBC = async (surveynumber) => {
    const { accounts, contract } = this.state;
    return await contract.methods.getPropertyDetails(surveynumber).call({ from: accounts[0] });
  }

  updateUserInfo = (obj) => {
    this.setState({ userinfo: obj })
  }

  logout = () => {
    Cookies.remove("la57L0663D");
    this.setState({ who: null, code: 10 })
    setTimeout(function () {
      this.setState({ code: 0 });
    }.bind(this), 2000);
  }

  login = () => {
    console.log('Checking if SuperAdmin...')
    if (this.state.accounts[0].toLowerCase() === "0x05Be6ed049113c0A92B6419D39201a5Dd4F7548e".toLowerCase()) {
      console.log("Welcome Lord!");
      this.setState({ who: 'superadmin', code: 1 })
    } else {
      console.log('Checking if admin...')
      axios.get('http://localhost:5000/api/admin/' + this.state.accounts[0].toLowerCase())
        .then(res => {
          if (res.data) {
            this.setState({ who: 'admin', userinfo: { name: res.data.name, aadhaar: res.data.aadhaar, citytown: res.data.citytown, district: res.data.district, state: res.data.state }, code: 2 })
          } else {
            console.log('Checking if existing user...')
            axios.get('http://localhost:5000/api/user/' + this.state.accounts[0].toLowerCase())
              .then(res => {
                if (res.data) {
                  this.setState({ who: 'user', userinfo: res.data, code: 3 })
                } else {
                  console.log('Creating user...')
                  axios.post('http://localhost:5000/api/user/add', { address: this.state.accounts[0].toLowerCase() })
                    .then(res => {
                      this.setState({ who: 'user', userinfo: res.data, code: 4 })
                    })
                    .catch((error) => {
                      console.log(error, "Try again!")
                    });
                }
              })
              .catch((error) => {
                console.log(error, "Try again!")
              });
          }
        })
        .catch((error) => {
          console.log(error, "Try again!")
        });
    }
    Cookies.set("la57L0663D", this.state.accounts[0].toLowerCase());
    setTimeout(function () {
      this.setState({ code: 0 });
    }.bind(this), 2000);
  }

  componentDidUpdate = () => {
    const ethereum = window.ethereum
    if (ethereum) {
      // Listening to Event
      ethereum.on('accountsChanged', accounts => { //Useful when the account is changed in between
        let loggedin = (this.state.who !== null)
        this.setState({ accounts, who: null, code: 5 })
        setTimeout(function () {
          if (loggedin) {
            this.login()
          } else {
            this.setState({ code: 0 })
            return
          };
        }.bind(this), 1500);
      })
    }
  }

  codeChanger = (x) => {
    this.setState({ code: x })
    setTimeout(function () {
      this.setState({ code: 0 });
    }.bind(this), 2000);
  }

  render() {
    return (
      <div className="App">
        <div className="main">
          <Header />
          <Notif code={this.state.code} />
          <div className="components">
            {!this.state.who && <Login login={this.login} quickCheck={this.propertyEnquiryBC} codeChanger={this.codeChanger} />}
            {this.state.who === 'admin' && <Admin address={this.state.accounts[0].toLowerCase()} userinfo={this.state.userinfo} codeChanger={this.codeChanger} createProp={this.createPropertyBC} />}
            {this.state.who === 'superadmin' && <SuperAdmin address={this.state.accounts[0].toLowerCase()} codeChanger={this.codeChanger} addAdmin={this.addAdminBC} />}
            {this.state.who === 'user' && <User userinfo={this.state.userinfo} updateUserInfo={this.updateUserInfo} address={this.state.accounts[0].toLowerCase()} accounts={this.state.accounts} contract={this.state.contract} />}
          </div>
          {this.state.who && <div className="logout" onClick={() => this.logout()}><img src={logout} alt="MetaMask" className="Log Out" height={20} /></div>}
        </div>
      </div>
    );
  }
}

export default App;
