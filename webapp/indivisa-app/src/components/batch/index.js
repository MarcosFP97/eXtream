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
import Input from "@material-ui/core/Input";
import Chip from "@material-ui/core/Chip";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        },
    },
};

class Batch extends Component{

    constructor(props) {
        super(props);
        this.state = {
            interval: null,
            texts_in_range:'',
            ids: {},
            ranges: [],
            range: ''
        };
    }

    tick = async () => {
        if(this.state.range){
            const response = await APIClient.getDataFromPlatform(this.state.ids[this.state.range]);
            const values = await response.json()
            console.log("Result",values[this.state.ids[this.state.range]])
            this.setState({texts_in_range:values[this.state.ids[this.state.range]]},()=>console.log("Texts in range",this.state.texts_in_range))
        }
    }

    componentDidMount() {
        let intervalId = setInterval(this.tick, 6000);
        const module = this.props.module;
        this.setState({interval:intervalId},()=>console.log("Interval",this.state.interval));
        let dict = {}
        let auxRanges = []
        for(let i=0;i<Inputs.inputs.length;i++){
            let aux = Inputs.inputs[i]
            Object.keys(aux).forEach(function(key) {
                if(key===module){
                    let range = aux[key].orig_text.split("-");
                    range = range[1]+"-"+range[2];
                    dict[range] = aux[key].id+"-"+aux[key].topics[0];
                    auxRanges.push([range])
                }
            });
        }
        this.setState({ids:dict},()=>console.log("Id",this.state.ids));
        this.setState({ranges:this.state.ranges.concat(auxRanges)},()=>console.log("Ranges",this.state.ranges))
    }

    selectRange = event => {
        this.setState(({range: event.target.value }),()=>console.log("Range",this.state.range));
    };

    componentWillUnmount() {
        clearInterval(this.state.interval);
        window.Arrays.dashboardElements = []
    }

    render() {
        return <>
            <div className="queries">
                <InputLabel
                    htmlFor="select-range"
                    style={{
                        color: 'white',
                        margin: '0px 0px 0px 50px',
                        fontSize:'14pt'
                    }}
                >
                    Time ranges
                </InputLabel>
                <Select
                    value={this.state.range}
                    onChange={this.selectRange}
                    input={<Input id="select-range"/>}
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
                        name: 'available ranges',
                        id: 'ranges',
                    }}
                >
                    {this.state.ranges.map(name => (
                        <MenuItem key={name} value={name} style={{fontSize:'12pt'}}>
                            {name}
                        </MenuItem>
                    ))}
                </Select>
            </div>
            <div className="container container-margins">
                <div className="row">
                    <div className="card stats-card horizontal">
                        <div className="card-stacked">
                            <div className="card-content">
                                <i className="big-card-icon2 material-icons">question_answer</i>
                                <h1><span className="batch-text accent-2">{this.state.texts_in_range} texts in the given period</span>
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    }
}

export default (Batch);