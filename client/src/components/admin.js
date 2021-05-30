// Can assign land and view all properties he approved previously
import React from 'react';
import axios from 'axios';

class Admin extends React.Component {

    constructor(props) {
        super(props);
        this.state = { registeredList: [], address: "", surveynumber: "", type: "", marketvalue: "" }
    }

    componentDidMount() {
        axios.get('http://localhost:5000/api/properties/admin/' + this.props.address)
            .then(res => {
                this.setState({ registeredList: res.data })
            })
            .catch((error) => {
                console.log(error, "Try again!")
            })
    }

    handleInput = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    changeDetect() {
        let { phone, name, aadhaar, email } = this.props.userinfo
        let { phone: updatedPhone, name: updatedName, aadhaar: updatedAadhaar, email: updatedEmail } = this.state
        if (phone === updatedPhone && name === updatedName && aadhaar === updatedAadhaar && email === updatedEmail) {
            return false
        } else {
            return true
        }
    }

    registerLand = async () => {
        await this.props.createProp(this.state.surveynumber, this.state.address.toLowerCase(), this.state.marketvalue, this.state.type, this.props.userinfo.citytown, this.props.userinfo.district, this.props.userinfo.state)
        axios.get('http://localhost:5000/api/properties/' + this.state.surveynumber)
            .then(res => {//Check if the property is already registered
                if (res.data === null) {//Check if a user exists with the given address
                    axios.get('http://localhost:5000/api/user/' + this.state.address.toLowerCase())
                        .then(res => {
                            if (res.data) {
                                //This code is repetitive; Can be optimized (1)
                                axios.post('http://localhost:5000/api/properties/register', { address: this.state.address.toLowerCase(), surveynumber: this.state.surveynumber, type: this.state.type, marketvalue: this.state.marketvalue, citytown: this.props.userinfo.citytown, district: this.props.userinfo.district, state: this.props.userinfo.state, registeredby: this.props.address })
                                    .then(res => {
                                        let list = this.state.registeredList;
                                        list.push(res.data);
                                        this.setState({ registeredList: list, address: "", surveynumber: "", type: "", marketvalue: "" });
                                        this.props.codeChanger(8)
                                    })
                                    .catch((error) => {
                                        console.log(error, "Try again!")
                                    })
                            } else {//Create a user with the given address
                                axios.post('http://localhost:5000/api/user/add', { address: this.state.address.toLowerCase() })
                                    .then(res => {
                                        //This code is repetitive; Can be optimized (2)
                                        axios.post('http://localhost:5000/api/properties/register', { address: this.state.address.toLowerCase(), surveynumber: this.state.surveynumber, type: this.state.type, marketvalue: this.state.marketvalue, citytown: this.props.userinfo.citytown, district: this.props.userinfo.district, state: this.props.userinfo.state, registeredby: this.props.address })
                                            .then(res => {
                                                let list = this.state.registeredList;
                                                list.push(res.data);
                                                this.setState({ registeredList: list, address: "", surveynumber: "", type: "", marketvalue: "" });
                                                this.props.codeChanger(8)
                                            })
                                            .catch((error) => {
                                                console.log(error, "Try again!")
                                            })
                                    })
                                    .catch((error) => {
                                        console.log(error, "Try again!")
                                    });
                            }
                        })
                        .catch((error) => {
                            console.log(error, "Try again!")
                        });
                } else {
                    this.props.codeChanger(7)
                }
            })
    }

    render() {
        return (
            <div className="superadmin admin">
                <div className="wrapper">
                    <h2>Register Property</h2>
                    <input className="app-input" type="text" name="address" placeholder="Owner's Address" autoComplete="new-password" value={this.state.address} onChange={this.handleInput} />
                    <input className="app-input" type="text" name="surveynumber" placeholder="Survey Number" value={this.state.surveynumber} onChange={this.handleInput} />
                    <input className="app-input" type="text" name="type" placeholder="Type" value={this.state.type} onChange={this.handleInput} />
                    <input className="app-input" type="number" name="marketvalue" placeholder="Market Value" value={this.state.marketvalue} onChange={this.handleInput} />
                    <button className="app-button-1" onClick={() => this.registerLand()}>Register</button>
                </div>
                <div className="adminpanel">
                    <h3 className="superadmintitle">Admin Portal</h3>
                    <div className="adminslist">
                        <p className="superadmintitle">Recently Registered Properties</p>
                        {this.state.registeredList.map((info, index) => (
                            <div className="adminel" key={"adminele-" + index}>
                                <div className="adaddress"><strong>Address:</strong> {info.address}</div>
                                <div className="adTown"><strong>Survey Number:</strong> {info.surveynumber}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }
}

export default Admin