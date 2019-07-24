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
import Filter from "../filter";
import Tag from "../tag";
import TopicAnalysis from "../topic-analysis";
import Stats from "../stats";
import Batch from "../batch";
import CustomModule from "../customModule"
import "../../App.css";

export class Dashboard extends Component{
    render() {
        let selectedNode = window.Arrays.dashboardElements[0];
        let module = selectedNode.substring(0,selectedNode.length-1).toLowerCase();
        if(module==="filter"){
            return <div className={"App-body"}>
                    <Filter module={selectedNode}/>
            </div>
        } else if(module==="tag"){
            return <div className={"App-body"}>
                <Tag module={selectedNode}/>
            </div>
        } else if(module==="topic_analysis"){
            return <div className={"App-body"}>
                    <TopicAnalysis module={selectedNode}/>
                </div>
        } else if(module==="stats"){
            return <div className={"App-body"}>
                <Stats module={selectedNode}/>
            </div>
        } else if(module==="batch"){
            return <div className={"App-body"}>
                <Batch module={selectedNode}/>
            </div>
        } else{
            return <div className={"App-body"}>
                <CustomModule module={selectedNode}/>
            </div>
        }
    }
}
