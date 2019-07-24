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
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import Input from "@material-ui/core/Input";
import Chip from "@material-ui/core/Chip";
import MenuItem from "@material-ui/core/MenuItem";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        },
    },
};

class TopicAnalysis extends Component{

    constructor(props) {
        super(props);
        this.state = {
            interval: null,
            ids: {},
            outputs: [],
            output: '',
            func:''
        };
    }

    tick = async () => {
        if(this.state.output){
            const response = await APIClient.getDataFromPlatform(this.state.ids[this.state.output]);
            const values = await response.json()
            this.setState({func:values[this.state.ids[this.state.output]]},()=>console.log(this.state.func))
        }
    }

    componentDidMount() {
        let intervalId = setInterval(this.tick, 2000);
        const module = this.props.module;
        this.setState({interval:intervalId},()=>console.log("Interval",this.state.interval));
        let dict = {}
        let auxOutputs = []
        let count = 0
        for(let i=0;i<Inputs.inputs.length;i++){
            let aux = Inputs.inputs[i]
            Object.keys(aux).forEach(function(key) {
                if(key===module){
                    count+=1;
                    let output = "Output "+count;
                    dict[output] = aux[key].id+"-"+aux[key].topics[0];
                    auxOutputs.push([output])
                }
            });
        }
        this.setState({ids:dict},()=>console.log("Ids",this.state.ids));
        this.setState({outputs:this.state.outputs.concat(auxOutputs)},()=>console.log("Outputs",this.state.outputs))
    }

    componentDidUpdate() {
        let node = document.getElementById('pyldavis');
        while (node.hasChildNodes()) {
            node.removeChild(node.firstChild);
        }
        window.eval(this.state.func);
    }

    componentWillUnmount() {
        clearInterval(this.state.interval);
        window.Arrays.dashboardElements = []
    }

    selectOutput = event => {
        this.setState(({output: event.target.value }),()=>console.log("Output",this.state.output));
    };

    render() {
        return <>
            <div className="queries">
                <InputLabel
                    htmlFor="select-output"
                    style={{
                        color: 'white',
                        margin: '0px 0px 0px 50px',
                        fontSize:'14pt'
                    }}
                >
                    Topic analysis
                </InputLabel>
                <Select
                    value={this.state.output}
                    onChange={this.selectOutput}
                    input={<Input id="select-output"/>}
                    renderValue={selected => (
                        <div>
                            {selected.map(value => (
                                <Chip key={value} label={value} style={{fontSize:'12pt'}}/>
                            ))}
                        </div>
                    )}
                    MenuProps={MenuProps}
                    style={{
                        width: '80%',
                        textAlign: 'center',
                    }}
                    inputProps={{
                        name: 'available outputs',
                        id: 'outputs',
                    }}
                >
                    {this.state.outputs.map(name => (
                        <MenuItem key={name} value={name} style={{fontSize:'12pt'}}>
                            {name}
                        </MenuItem>
                    ))}
                </Select>
            </div>
            <div id="pyldavis"></div>
        </>
    }
}

export default (TopicAnalysis);