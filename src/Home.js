import React, {Component} from 'react';
import './App.css';
import {Card} from 'luna-react';
import { withLabel, Sainsburys } from 'luna-images';
const SainsburysLogo = withLabel(Sainsburys)

class Home extends Component {

render() {
    return (
        <Card className="Logo">
          <SainsburysLogo label="Sainsburys Group plc" width="320px" />
          <p className="Subtitle">Pizza Locator</p>
        </Card>

        )
    }
}

export default Home;
