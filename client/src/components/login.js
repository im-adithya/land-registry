import React from 'react';
import axios from 'axios';

import './login.css';
import fox from '../assets/fox.svg';

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            survey: "",
            checked: false
        }
    }

    handleInput = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    checkStatus = async () => {
        if (this.state.survey !== "") {
            console.log("data");
            try {
                let data = await this.props.quickCheck(this.state.survey)
                console.log(data);
                this.setState({ checked: true, searchres: data })
            } catch (error) {
                this.props.codeChanger(12)
            }
        } else {
            this.props.codeChanger(11)
        }
    }

    render() {
        return (
            <div className="logpage">
                <div className="logbox">
                    <div className="login">
                        <h2>Login</h2>
                        <button onClick={() => this.props.login()} className="app-button-1">Login using <img src={fox} alt="MetaMask" className="fox" height={15} /> MetaMask</button>
                    </div>
                    <hr className="line" />
                    <div className="register">
                        <h2>Quick Check <span className="between">(Owners only)</span></h2>
                        {!this.state.checked && <input className="app-input" type="text" name="survey" placeholder="Survey Number" value={this.state.survey} onChange={this.handleInput} />}
                        {!this.state.checked && <button className="app-button-1" onClick={() => this.checkStatus()}>Check Status</button>}
                        {this.state.checked && <div className="adminel">
                            <div className="adaddress"><strong>Survey Number:</strong> {this.state.survey}</div>
                            <div className="adaddress"><strong>Type:</strong> {this.state.searchres[0]}</div>
                            <div className="adTown"><strong>City/Town:</strong> {this.state.searchres[1]}</div>
                            <div className="adTown"><strong>District:</strong> {this.state.searchres[2]}</div>
                            <div className="adTown"><strong>State:</strong> {this.state.searchres[3]}</div>
                            <div className="adTown"><strong>Market Value:</strong> {this.state.searchres[4]}</div>
                        </div>}
                        {this.state.checked && <button className="app-button-1" onClick={() => this.setState({ checked: false, searchres: [], survey: "" })}>Return</button>}
                    </div>
                </div>
                <div className="someimage">
                </div>
            </div>
        )
    }
}

export default Login