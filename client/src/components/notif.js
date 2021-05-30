import React from 'react';

import './notif.css';

class Notif extends React.Component {

    render() {
        return (
            <div className={(this.props.code !== 0) ? "slide notif" : "notif"}>
                {this.props.code === 1 && <p>Welcome SuperAdmin!</p>}
                {this.props.code === 2 && <p>Welcome Admin!</p>}
                {this.props.code === 3 && <p>Login Successful!</p>}
                {this.props.code === 4 && <p>Account created successfully!</p>}
                {this.props.code === 5 && <p>Account Change Detected.</p>}
                {this.props.code === 6 && <p>Admin Already Exists!</p>}
                {this.props.code === 7 && <p>Property Already Registered!</p>}
                {this.props.code === 8 && <p>Done Successfully!</p>}
                {this.props.code === 9 && <p>Account Change Detected<br />Logging you in...</p>}
                {this.props.code === 10 && <p>Logged Out</p>}
                {this.props.code === 11 && <p>Enter a Survey Number</p>}
                {this.props.code === 12 && <p>You don't own the property</p>}
            </div>
        )
    }
}

export default Notif