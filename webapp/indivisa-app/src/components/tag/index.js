// Indivisa
// Copyright (C) 2019 Marcos Fernández Pichel

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import React, {Component} from "react";
import APIClient from "../../lib/API";
import Inputs from "../inputs";
import 'font-awesome/css/font-awesome.min.css';
import "../../App.css";
import WordCloud from 'react-d3-cloud';

const fontSizeMapper = word => Math.log2(word.value) * 7;

class Tag extends Component{

    constructor(props) {
        super(props);
        this.state = {
            interval: null,
            cloud: '',
            id: '',
            data: []
        };
    }

    tick = async () => {
        const response = await APIClient.getDataFromPlatform(this.state.id);
        const values = await response.json()
        this.setState({data:values},()=>console.log("Data",this.state.data))
        this.setState({cloud:<WordCloud
                data={this.state.data[this.state.id]}
                fontSizeMapper={fontSizeMapper}
                style={{
                    width: '100%'
                }}
            />})
    }

    componentDidMount() {
        let intervalId = setInterval(this.tick, 3000);
        const module = this.props.module;
        this.setState({interval:intervalId},()=>console.log("Interval",this.state.interval));
        let id = null
        let found = false
        for(let i=0;i<Inputs.inputs.length;i++){
            let aux = Inputs.inputs[i]
            Object.keys(aux).forEach(function(key) {
                if(key===module){
                    id = aux[key].id;
                    found = true
                }
            });
            if(found){
                break;
            }
        }
        this.setState({id:id},()=>console.log("Id",this.state.id));
    }

    componentWillUnmount() {
        clearInterval(this.state.interval);
        window.Arrays.dashboardElements = []
    }

    render() {
        return (
            <div>{this.state.cloud}</div>
        );
    }
}

export default (Tag);