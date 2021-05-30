import React from 'react';
import axios from 'axios';

import './user.css';

class User extends React.Component {
    constructor(props) {
        super(props);
        this.state = { ...this.props.userinfo, propertiesList: [], search: true, survey: "" }
    }

    componentDidMount() {
        axios.get('http://localhost:5000/api/properties/user/' + this.props.address)
            .then(res => {
                console.log(res)
                this.setState({ propertiesList: res.data })
            })
    }

    transferProperty = async (surveynumber, ownerAddress) => {
        const { accounts, contract } = this.props;
        await contract.methods.changeOwnership(surveynumber, ownerAddress).send({ from: accounts[0] });
    }

    givePerms = async (surveynumber, newOwner) => {
        const { accounts, contract } = this.props;
        await contract.methods.givePermission(surveynumber, newOwner).send({ from: accounts[0] });
    }

    removePerms = async (surveynumber) => {
        const { accounts, contract } = this.props;
        await contract.methods.notForSale(surveynumber).send({ from: accounts[0] });
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

    update = () => {
        axios.post('http://localhost:5000/api/user/update/' + this.props.address, { name: this.state.name, phone: this.state.phone, email: this.state.email, aadhaar: this.state.aadhaar })
            .then(res => {
                console.log(res.data)
                this.props.updateUserInfo(res.data)
            })
    }

    search = () => {
        axios.get('http://localhost:5000/api/properties/' + this.state.survey)
            .then(res => {
                console.log(res)
                this.setState({ searchres: res.data, search: false })
            })
    }

    request = () => {
        axios.post('http://localhost:5000/api/properties/request/' + this.state.searchres._id, { addressrequester: this.props.address })
            .then(res => {
                this.setState({ requestssent: res.data })
            })
    }

    approve = async (index) => {
        await this.givePerms(this.state.requestsrec[index].surveynumber, this.state.requestsrec[index].requester)
        axios.post('http://localhost:5000/api/user/approverequests/' + this.state.requestsrec[index].surveynumber, { address: this.props.address, addressrequester: this.state.requestsrec[index].requester })
            .then(res => {
                this.setState({ requestsrec: res.data })
            })
    }

    reject = (index) => {
        axios.post('http://localhost:5000/api/user/rejectrequests/' + this.state.requestsrec[index].surveynumber, { address: this.props.address, addressrequester: this.state.requestsrec[index].requester })
            .then(res => {
                this.setState({ requestsrec: res.data })
            })
    }

    withdraw = (index) => {
        axios.post('http://localhost:5000/api/user/requestssent/' + this.state.requestssent[index].surveynumber, { address: this.props.address, owner: this.state.requestssent[index].owner })
            .then(res => {
                this.setState({ requestssent: res.data })
            })
    }

    buy = async (index) => {
        await this.transferProperty(this.state.requestssent[index].surveynumber, this.state.requestssent[index].owner)
        axios.post('http://localhost:5000/api/properties/transfer/' + this.state.requestssent[index].surveynumber, { addressto: this.props.address, addressfrom: this.state.requestssent[index].owner })
            .then(res => {
                console.log(res.data)
                let propertiesList = this.state.propertiesList;
                propertiesList.push(res.data);
                let requestssent = this.state.requestssent;
                requestssent.splice(index, 1);
                this.setState({ propertiesList, requestssent })
            })
    }

    deletereqsent = (index) => {
        axios.post('http://localhost:5000/api/user/delrequestssent/' + this.state.requestssent[index].surveynumber, { address: this.props.address, owner: this.state.requestssent[index].owner })
            .then(res => {
                console.log(res.data);
                this.setState({ requestssent: res.data })
            })
    }

    sale = async (index) => {
        if (this.state.propertiesList[index].sale) {
            await this.removePerms(this.state.propertiesList[index].surveynumber)
        }
        axios.post('http://localhost:5000/api/properties/sale/' + this.state.propertiesList[index].surveynumber, { address: this.props.address })
            .then(res => {
                let propertiesList = this.state.propertiesList
                if (!this.state.propertiesList[index].sale) {
                    propertiesList[index].sale = res.data;
                    this.setState({ propertiesList })
                } else {
                    console.log(res.data)
                    propertiesList[index].sale = false;
                    this.setState({ requestsrec: res.data, propertiesList })
                }
            })
    }

    render() {
        return (
            <div className="superadmin user">
                <div className="wrapper">
                    <h2>Personal Details</h2>
                    <input className="app-input" type="text" name="name" placeholder="Name" value={this.state.name} onChange={this.handleInput} />
                    <input className="app-input" type="text" name="aadhaar" placeholder="Aadhaar" value={this.state.aadhaar} onChange={this.handleInput} />
                    <input className="app-input" type="text" name="phone" placeholder="Phone" value={this.state.phone} onChange={this.handleInput} />
                    <input className="app-input" type="text" name="email" placeholder="Email" value={this.state.email} onChange={this.handleInput} />
                    <button onClick={() => this.changeDetect() ? this.update() : ""} className={this.changeDetect() ? "app-button-1" : "app-button-1 app-button-1-inactive"}>Update</button> {/*Disabled*/}
                </div>
                <div className="userwrap">
                    <div className="wrappersmall justifystart regprop">
                        <h2>Properties Registered</h2>
                        {this.state.propertiesList.map((info, index) => (
                            <div className="adminel" key={"adminelem-" + index}>
                                <div className="adnumber"><strong>PID:</strong> {info._id}</div>
                                <div className="adaddress"><strong>Survey Number:</strong> {info.surveynumber}</div>
                                <div className="adaddress"><strong>Type:</strong> {info.type}</div>
                                <div className="adTown"><strong>City/Town:</strong> {info.citytown}</div>
                                <div className="adTown"><strong>District:</strong> {info.district}</div>
                                <div className="adTown"><strong>State:</strong> {info.state}</div>
                                <button onClick={() => this.sale(index)} className={"app-button-2 " + (info.sale ? "pendingbg" : "approvedbg")}>Make it {info.sale ? "Unavailable" : "Available"} for Sale</button>
                            </div>
                        ))}
                        {this.state.propertiesList.length === 0 && <div className="adminel emptyel">
                            Nothing to show here.
                        </div>}
                    </div>
                    {this.state.search && <div className="wrappersmall">
                        <h2>Search For Properties</h2>
                        <input className="app-input" type="text" name="survey" placeholder="Survey Number" value={this.state.survey} onChange={this.handleInput} />
                        <button onClick={() => (this.state.survey !== "") ? this.search() : ""} className={(this.state.survey !== "") ? "app-button-1" : "app-button-1 app-button-1-inactive"}>Search</button></div>}
                    {!this.state.search && <div className="wrappersmall justifystart">
                        <h2>Search Results</h2>
                        <div className="back-btn" onClick={() => this.setState({ search: true, searchres: [], survey: "" })}>«</div>
                        {this.state.searchres && <div className="adminel">
                            <div className="adTown"><strong>Owner:</strong> <p style={{ fontSize: '10px', margin: '5px 0' }}>{this.state.searchres.address}</p></div>
                            <div className="adnumber"><strong>PID:</strong> <span style={{ fontSize: '15px' }}>{this.state.searchres._id}</span></div>
                            <div className="adaddress"><strong>Survey Number:</strong> {this.state.searchres.surveynumber}</div>
                            <div className="adaddress"><strong>Type:</strong> {this.state.searchres.type}</div>
                            <div className="adTown"><strong>City/Town:</strong> {this.state.searchres.citytown}</div>
                            <div className="adTown"><strong>District:</strong> {this.state.searchres.district}</div>
                            <div className="adTown"><strong>State:</strong> {this.state.searchres.state}</div>
                            <div className="adTown"><strong>Market Value:</strong> {this.state.searchres.marketvalue}</div>
                            <div className="adTown"><strong>Availability:</strong> {(this.state.searchres.sale && !this.state.searchres.approved) ? "For Sale" : "Not for Sale"} </div>
                            {this.state.searchres.sale && !this.state.searchres.approved && (this.state.searchres.address !== this.props.address) && <button onClick={() => this.state.requestssent.some(el => el.propertyid === this.state.searchres._id) ? "" : this.request()} className={this.state.requestssent.some(el => el.propertyid === this.state.searchres._id) ? "app-button-2 app-button-2-inactive" : "app-button-2"} >Request Property</button>}
                        </div>}
                        {!this.state.searchres && <div className="adminel emptyel">
                            Not Registered
                        </div>}
                    </div>}
                </div>
                <div className="userwrap">
                    <div className="wrappersmall justifystart">
                        <h2>Requests Sent</h2>
                        {this.state.requestssent.map((info, index) => (
                            <div className="adminel" key={"adminelem-" + index}>
                                <div className="adaddress"><strong>Owner:</strong> <p style={{ fontSize: '10px', margin: '5px 0' }}>{info.owner}</p></div>
                                <div className="adnumber"><strong>PID:</strong> <span style={{ fontSize: '15px' }}>{info.propertyid}</span></div>
                                <div className="adaddress"><strong>Survey Number:</strong> {info.surveynumber}</div>
                                <div className="adTown"><strong>Approval:</strong> <span className={(info.approved === null) ? "pending" : (info.approved) ? "approved" : "rejected"}>{(info.approved === null) ? "Pending" : (info.approved) ? "Approved" : "Rejected"}</span></div>
                                <button onClick={() => (info.approved === null) ? this.withdraw(index) : (info.approved) ? this.buy(index) : this.deletereqsent(index)} className={"app-button-2 " + ((info.approved === null) ? "pendingbg" : (info.approved) ? "approvedbg" : "rejectedbg")} >{(info.approved === null) ? "Withdraw" : (info.approved) ? "Buy Property" : "Delete Request"}</button>
                            </div>
                        ))}
                        {this.state.requestssent.length === 0 && <div className="adminel emptyel">
                            Nothing to show here.
                        </div>}
                    </div>
                    <div className="wrappersmall justifystart">
                        <h2>Requests Received</h2>
                        {this.state.requestsrec.map((info, index) => (
                            <div className="adminel" key={"adminelem-" + index}>
                                <div className="adaddress"><strong>Requester:</strong> <p style={{ fontSize: '10px', margin: '5px 0' }}>{info.requester}</p></div>
                                <div className="adnumber"><strong>PID:</strong> <span style={{ fontSize: '15px' }}>{info.propertyid}</span></div>
                                <div className="adaddress"><strong>Survey Number:</strong> {info.surveynumber}</div>
                                <div className="adTown"><strong>Approval:</strong> <span className={(info.approved === null) ? "pending" : (info.approved) ? "approved" : "rejected"}>{(info.approved === null) ? "Pending" : (info.approved) ? "Approved" : "Rejected"}</span></div>
                                {(info.approved === null) && <div className="divider">
                                    <button className="app-button-2 approvedbg half-l" onClick={() => this.approve(index)}>Accept</button>
                                    <button className="app-button-2 rejectedbg half-r" onClick={() => this.reject(index)} >Reject</button>
                                </div>}
                            </div>
                        ))}
                        {this.state.requestsrec.length === 0 && <div className="adminel emptyel">
                            Nothing to show here.
                        </div>}
                    </div>
                </div>
            </div >
        )
    }
}

export default User