import React from 'react';

import './header.css';
import emblem from '../assets/emblem.svg'
import digiindia from '../assets/digiindia.svg'


class Header extends React.Component {
    render() {
        return (
            <header>
                <div className="emblem-text">
                    <img src={emblem} alt="Emblem" height={45} />
                    <div className="text-wrap">
                        <h1>Land Registration Portal</h1>
                        <p>Government of India</p>
                    </div>
                </div>
                <img src={digiindia} alt="Emblem" height={45} />
            </header>
        )
    }
}

export default Header