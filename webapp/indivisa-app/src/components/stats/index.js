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

class Stats extends Component{

    constructor(props) {
        super(props);
        this.state = {
            interval: null,
            id: '',
            texts_sec:'',
            users_sec:'',
            total_texts:'',
            total_users:''
        };
    }

    tick = async () => {
        const response = await APIClient.getDataFromPlatform(this.state.id);
        const values = await response.json()
        this.setState({texts_sec:values[this.state.id].texts_sec})
        this.setState({users_sec:values[this.state.id].users_sec})
        this.setState({total_texts:values[this.state.id].total_texts})
        this.setState({total_users:values[this.state.id].total_users})
    }

    componentDidMount() {
        let intervalId = setInterval(this.tick, 2000);
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
            <div className="container container-margins">
                <div className="row">
                    <div className="col s12 m6">
                        <div className="card stats-card horizontal">
                            <div className="card-stacked">
                                <div className="card-content">
                                    <i className="big-card-icon material-icons">question_answer</i>
                                    <h1><span className="blue-text accent-2">{this.state.total_texts} texts</span>
                                    </h1>
                                </div>
                                <div className="card-action stats-card-action blue accent-2">
                                    <h5><i
                                        className="left material-icons">swap_calls</i>{Number((parseFloat(this.state.texts_sec)).toFixed(1))} received/sec
                                    </h5>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col s12 m6">
                        <div className="card stats-card horizontal">
                            <div className="card-stacked">
                                <div className="card-content">
                                    <i className="big-card-icon material-icons">people</i>
                                    <h1><span className="blue-text accent-2">{this.state.total_users} users</span>
                                    </h1>
                                </div>
                                <div className="card-action stats-card-action blue accent-2">
                                    <h5><i className="left material-icons">swap_calls</i>{Number((parseFloat(this.state.users_sec)).toFixed(1))*60} received/min</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default (Stats);