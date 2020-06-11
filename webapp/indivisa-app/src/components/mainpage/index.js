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
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import logo from "../../logo.svg";
import "../../App.css";
import APIClient from "../../lib/API.js";
import 'font-awesome/css/font-awesome.min.css';
import {
    FilterDialog,
    StatsDialog,
    TagDialog,
    TopicDialog,
    BatchDialog,
    CustomizedDialog,
    NodeDialog
} from "../popups";
import Inputs from "../inputs";
import Graph from "react-graph-vis";

let basicInputs = Inputs.generateBasicUIInputs();
let dashboardElements = []

export default window.Arrays = {
    basicInputs,
    dashboardElements,
}


class SimpleMenu extends Component {
    state = {
        anchorEl: null,
        isFilterVisible: false,
        isTagVisible: false,
        isStatsVisible: false,
        isTopicVisible: false,
        isBatchVisible: false,
        isNodeVisible: false
    };

    handleClick = event => {
        this.setState({anchorEl: event.currentTarget});
    };

    filterVisible = () => {
        this.setState(prev => ({...prev, isFilterVisible: true}));
    };

    filterNonVisible = () => {
        this.setState(prev => ({...prev, isFilterVisible: false, anchorEl: null}));
    };

    tagVisible = () => {
        this.setState(prev => ({...prev, isTagVisible: true}));
    };

    tagNonVisible = () => {
        this.setState(prev => ({...prev, isTagVisible: false, anchorEl: null}));
    };

    statsVisible = () => {
        this.setState(prev => ({...prev, isStatsVisible: true}));
    };

    statsNonVisible = () => {
        this.setState(prev => ({...prev, isStatsVisible: false, anchorEl: null}));
    };

    topicVisible = () => {
        this.setState(prev => ({...prev, isTopicVisible: true}));
    };

    topicNonVisible = () => {
        this.setState(prev => ({...prev, isTopicVisible: false, anchorEl: null}));
    };

    batchVisible = () => {
        this.setState(prev => ({...prev, isBatchVisible: true}));
    };

    batchNonVisible = () => {
        this.setState(prev => ({...prev, isBatchVisible: false, anchorEl: null}));
    };

    render() {
        const {anchorEl} = this.state;
        let filter;
        let tag;
        let stats;
        let topic;
        let batch;
        if (this.state.isFilterVisible) {
            filter = <FilterDialog addEdges={this.props.addEdges} addNode={this.props.addNode}
                                   blockTopologies={this.props.blockTopologies}
                                   filterNonVisible={this.filterNonVisible}/>;
        }
        if (this.state.isTagVisible) {
            tag = <TagDialog addEdges={this.props.addEdges} addNode={this.props.addNode}
                             blockTopologies={this.props.blockTopologies} tagNonVisible={this.tagNonVisible}/>;
        }
        if (this.state.isStatsVisible) {
            stats = <StatsDialog addEdges={this.props.addEdges} addNode={this.props.addNode}
                                 blockTopologies={this.props.blockTopologies} statsNonVisible={this.tagNonVisible}/>;
        }
        if (this.state.isTopicVisible) {
            topic = <TopicDialog addEdges={this.props.addEdges} addNode={this.props.addNode}
                                 blockTopologies={this.props.blockTopologies} topicNonVisible={this.topicNonVisible}/>;
        }
        if (this.state.isBatchVisible) {
            batch = <BatchDialog addEdges={this.props.addEdges} addNode={this.props.addNode}
                                 blockTopologies={this.props.blockTopologies} batchNonVisible={this.batchNonVisible}/>;
        }
        return <>
            <div>
                <Button
                    aria-owns={anchorEl ? 'simple-menu' : undefined}
                    aria-haspopup="true"
                    onClick={this.handleClick}
                    style={{
                        width: "80%",
                        backgroundColor: "white",
                        padding: "10px 20px",
                        margin: "10px 0px",
                        color: "dark",
                        fontSize: "12pt",
                    }}
                >
                    Images
                </Button>
                <Menu
                    id="simple-menu"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={this.handleClose}
                >
                    <MenuItem onClick={this.filterVisible}>Filter</MenuItem>
                    <MenuItem onClick={this.tagVisible}>Tag Cloud</MenuItem>
                    <MenuItem onClick={this.topicVisible}>Topic Analysis</MenuItem>
                    <MenuItem onClick={this.statsVisible}>Stats</MenuItem>
                    <MenuItem onClick={this.batchVisible}>Batch</MenuItem>
                </Menu>
                {filter}
                {tag}
                {stats}
                {topic}
                {batch}
            </div>
        </>
    }
}


class GenericError extends Component {

    render() {
        return (
            <div>
                <h4 style={{color: 'red'}}>{this.props.error}</h4>
            </div>
        );
    }
}

export class MainPage extends Component {


    constructor(props) {
        super(props)

        this.state = {
            isDialogVisible: false,
            isNodeVisible: false,
            reader: new FileReader(),
            topology_blocked: false,
            custom_blocked: true,
            graph: {
                nodes: [
                    {id: 1, label: "Twitter texts"},
                    {id: 2, label: "Reddit comments"},
                    {id: 3, label: "Reddit submissions"}
                ],
                edges: []
            },
            options: {
                layout: {
                    hierarchical: {
                        enabled:true,
                        levelSeparation: 150,
                        nodeSpacing: 100,
                    }
                },
                nodes: {
                  font: {
                      size: 20,
                  },
                  shape: 'box'
                },
                edges: {
                    color: "#000000"
                },
                physics: {
                    solver: "repulsion",
                },
                height: '1000px',
                width: '1300px'
            },
            events: {
                selectNode: this.handleSelect,
            },
            error: false,
            error_msg: '',
            toDashboard: false,
            selectedNode: null,
            removeList: [],
            uploaded: false,
            labelColor: "white"
        }
    }

    addToDashboard = () => {
        if(window.Arrays.dashboardElements.length<1){
            window.Arrays.dashboardElements.push(this.state.selectedNode)
            console.log(window.Arrays.dashboardElements);
        }
    }

    handleSelect = (event) => {
        var {nodes, edges} = event;
        this.nodeVisible(nodes)
    }

    addInput = (edge) => {
        let nodesCopy = this.state.graph.nodes.slice();
        let edgesCopy = this.state.graph.edges.slice();
        edgesCopy.push(edge)
        this.setState({graph: {nodes: nodesCopy, edges: edgesCopy}});
    }

    removeInput = (edge) => {
        let nodesCopy = this.state.graph.nodes.slice();
        let edgesCopy = this.state.graph.edges.slice();
        const index = edgesCopy.indexOf(edge)
        if(index > -1){
            edgesCopy.splice(index,1)
        }
        this.setState({graph: {nodes: nodesCopy, edges: edgesCopy}});
    }

    nodeVisible = (nodes) => {
        for(let i in this.state.graph.nodes){
            if(nodes[0]===this.state.graph.nodes[i].id){
                this.setState(prev => ({...prev, selectedNode: this.state.graph.nodes[i].label}));
                break;
            }
        }
        let aux = []
        for(let i in this.state.graph.edges){
            if(nodes[0]===this.state.graph.edges[i].to){
                aux.push(this.state.graph.edges[i])
            }
        }
        this.setState({removeList: aux});
        this.setState(prev => ({...prev, isNodeVisible: true}));
    }

    nodeNonVisible = () => {
        this.setState(prev => ({...prev, isNodeVisible: false, selectedNode: null}));
    }

    dialogVisible = () => {
        this.setState(prev => ({...prev, isDialogVisible: true}));
        console.log(this.state)
    };

    dialogNonVisible = () => {
        this.setState(prev => ({...prev, isDialogVisible: false, anchorEl: null}));
    };

    blockTopologies = () => {
        this.setState({topology_blocked: true});
        this.setState({labelColor: "gray"});
    };

    addNode = (node) => {
        let nodesCopy = this.state.graph.nodes.slice(); // this will create a copy with the same items
        let edgesCopy = this.state.graph.edges.slice();
        let len = nodesCopy.length
        let id = nodesCopy[len - 1].id
        let newId = id + 1
        nodesCopy.push({id: newId, label: node});
        console.log(nodesCopy)
        this.setState({graph: {nodes: nodesCopy, edges: edgesCopy}});
        return newId
    };

    addEdges = (id, edges) => {
        let nodesCopy = this.state.graph.nodes.slice(); // this will create a copy with the same items
        let edgesCopy = this.state.graph.edges.slice();
        for (let i in edges) {
            let input = edges[i]
            const key = Object.keys(input)
            for (let j in nodesCopy) {
                if (nodesCopy[j].label === key[0]) {
                    edgesCopy.push({from: nodesCopy[j].id, to: id,idFrom:input[key[0]][0],topic:input[key[0]][1],orig_text:input[key[0]][2]})
                    break;
                }
            }
        }
        this.setState({graph: {nodes: nodesCopy, edges: edgesCopy}});
        console.log(this.state.graph)
    }

    unblockTopologies = () => {
        this.setState({topology_blocked: false});
        this.setState({labelColor: "white"});
    };

    unblockCustom = () => {
        this.setState({custom_blocked: false});
    };

    activateError = () => {
        this.setState({error: true});
    };

    deactivateError = () => {
        this.setState({error: false});
    };

    setErrorMsg = (msg) => {
        this.setState({error_msg: msg});
    };

    locateNode = (id) => {
        let nodeLabel = null
        let found = false
        for (let j = 0; j < Inputs.inputs.length; j++) {
            let aux = Inputs.inputs[j]
            Object.keys(aux).forEach(function (key) {
                if (id === aux[key].id) {
                    nodeLabel = key
                    found = true
                }
            });
            if (found) {
                break;
            }
        }
        return nodeLabel
    };

    recoverId = (nodeLabel) => {
        let nodeId = null
        for (let i in this.state.graph.nodes) {
            let node = this.state.graph.nodes[i]
            if (node.label === nodeLabel) {
                nodeId = node.id
                break;
            }
        }
        return nodeId
    };

    generateEdges = (inputs) => {
        let edges = []
        let found = false
        for (let i in inputs) {
            let input = inputs[i].split("-")
            for (let j = 0; j < Inputs.inputs.length; j++) {
                let aux = Inputs.inputs[j]
                Object.keys(aux).forEach(function (key) {
                    let dict = {}
                    if (input[0] === aux[key].id) {
                        if (!found) {
                            dict[key] = [aux[key].id,aux[key].topics[0],aux[key].orig_text]
                            edges.push(dict)
                            found = true
                        }
                    } else if (aux[key].id === "" && aux[key].topics[0] === input[0]) {
                        if (!found) {
                            dict[key] = [aux[key].id,aux[key].topics[0],aux[key].orig_text]
                            edges.push(dict)
                            found = true
                        }
                    }
                });
            }
            found = false
        }
        return edges
    };

    handleFileRead = async (e) => {
        const content = this.state.reader.result;
        console.log(content);
        const postRequest = await APIClient.launchTopology(content);
        const postResponse = await postRequest.json();
        if (postRequest.ok) {
            this.blockTopologies();
        }
        console.log(postResponse);
        for (let element in postResponse) {
            let aux = Inputs.addNewTopics(postResponse[element], this.addNode, this.addEdges, []);
            window.Arrays.basicInputs = [...window.Arrays.basicInputs, ...aux];
        }

        let nodeId = null
        let nodeLabel = null
        let edges = []
        for (let i in postResponse) {
            let id = postResponse[i].id
            nodeLabel = this.locateNode(id)
            nodeId = this.recoverId(nodeLabel)
            edges = this.generateEdges(postResponse[i].inputs)
            this.addEdges(nodeId, edges)
            edges = []
            nodeLabel = null
            nodeId = null
        }

    };

    changeUploaded = () => {
        this.setState({uploaded: !this.state.uploaded});
    }

    launchTopology = (file) => {
        this.state.reader.onloadend = this.handleFileRead;
        this.state.reader.readAsText(file);
    };

    sendImageTar = async (file) => {
        this.deactivateError();
        const data = new FormData()
        data.append('image', file)
        console.log(file)
        await APIClient.sendCustomImage(data, this.unblockCustom, this.activateError, this.setErrorMsg,this.changeUploaded)
    };

    showDashboard = () => {
        this.props.history.push(`/dashboard`)
        this.setState({toDashboard: true});
    };

    deleteContainers = async () => {
        const postRequest = await APIClient.deleteContainers();
        if (postRequest.ok) {
            this.unblockTopologies();
            this.setState({graph:{
                    nodes: [
                        {id: 1, label: "Twitter texts"},
                        {id: 2, label: "Reddit comments"},
                        {id: 3, label: "Reddit submissions"}
                    ],
                    edges: []
                }});
            Inputs.inputs = [
                {'Twitter texts':{"id":"","topics":['twitter_texts'],"orig_text":"Twitter texts"}},
                {'Reddit comments':{"id":"","topics":['reddit_comments'],"orig_text":"Reddit comments"}},
                {'Reddit submissions':{"id":"","topics":['reddit_submissions'],"orig_text":"Reddit submissions"}}
            ];
            window.Arrays.basicInputs = Inputs.generateBasicUIInputs();
        }
    };

    render() {

        if (this.state.toDashboard) {
            this.state.toDashboard = false;
            return null;
        }
        let dialog;
        let error;
        let node;
        let confirmation;
        if (this.state.isDialogVisible) {
            dialog = <CustomizedDialog addEdges={this.addEdges} addNode={this.addNode}
                                       blockTopologies={this.blockTopologies}
                                       dialogNonVisible={this.dialogNonVisible}/>;
        }
        if(this.state.isNodeVisible){
            node = <NodeDialog addToDashboard={this.addToDashboard} showDashboard={this.showDashboard} nodeNonVisible={this.nodeNonVisible} addInput={this.addInput} removeInput={this.removeInput} graph={this.state.graph} removeList={this.state.removeList}/>
        }
        if (this.state.error) {
            error = <GenericError error={this.state.error_msg}/>
        }
        if(this.state.uploaded){
            confirmation = <p style={{color:'green'}}>Image correctly loaded</p>
        }
        return (
            <div>
                <div className="App">
                    <div className="App-body">
                        <div className="side">
                            <img src={logo} alt="logo"/>
                            <form>
                                <p>Topologies</p>
                                <label htmlFor="file-upload" className="custom-file-upload" style={{fontSize:'12pt', color: this.state.labelColor }}>
                                    <i className="fa fa-cloud-upload"></i> Upload
                                </label>
                                <input id="file-upload" type="file" name="topology" accept='.yaml'
                                       onChange={e => this.launchTopology(e.target.files[0])}
                                       disabled={this.state.topology_blocked}/>
                                <p>Customized module</p>
                                <label htmlFor="docker-upload" className="custom-file-upload"  style={{fontSize:'12pt'}}>
                                    <i className="fa fa-cloud-upload"></i> Upload docker image
                                </label>
                                <input id="docker-upload" type="file" name="image" accept='.tar'
                                       onChange={e => this.sendImageTar(e.target.files[0])}/>
                                <p><input type="button" value="Config parameters" className="button"
                                          onClick={this.dialogVisible} disabled={this.state.custom_blocked}/></p>
                                {confirmation}
                                {error}
                            </form>
                            <SimpleMenu addEdges={this.addEdges} addNode={this.addNode}
                                        blockTopologies={this.blockTopologies} graph = {this.state.graph}/>
                            {dialog}
                        </div>
                        <Graph
                            graph={this.state.graph}
                            options={this.state.options}
                            events={this.state.events}
                            style={{
                                margin: "0 0 0 10%"
                            }}
                        />
                        {node}
                        <div className="buttons">
                            <Button
                                aria-haspopup="true"
                                onClick={this.deleteContainers}
                                style={{
                                    width: "90%",
                                    backgroundColor: "white",
                                    padding: "10px 20px",
                                    margin: "30px 10px",
                                    color: "dark",
                                    fontSize: "12pt",
                                }}
                            >
                                Clear graph
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
