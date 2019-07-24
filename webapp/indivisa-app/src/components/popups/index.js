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
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Chip from '@material-ui/core/Chip';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import "../../App.css";
import APIClient from "../../lib/API.js";
import Inputs from "../inputs.js";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        },
    },

};

export class FilterDialog extends Component {
    state = {
        open: true,
        type: '',
        query: '',
        exact: true,
        inputs: [],
    };

    handleClose = () => {
        this.setState({ open: false });
        this.props.filterNonVisible();
    };

    selectQuery = name => event => {
        this.setState({
            [name]: event.target.value,
        },()=>console.log(this.state.query));
    };

    launchFilter = async ()  => {
        let exactToNum = null
        if(this.state.exact){
            exactToNum="0"
        }else{
            exactToNum="1"
        }
        let array = Inputs.associateToBackend(this.state.inputs)
        const postRequest = await APIClient.launchModule("filter",this.state.type,array[0],{"query":[this.state.query],"exact":[exactToNum]},{});
        const postResponse = await postRequest.json()
        if(postRequest.ok){
            this.props.blockTopologies();
        }
        console.log(postResponse)
        let aux = Inputs.addNewTopics(postResponse,this.props.addNode,this.props.addEdges,array[1]);
        window.Arrays.basicInputs = [...window.Arrays.basicInputs,...aux]
        this.setState({ open: false });
        this.props.filterNonVisible();
    }

    selectType = event => {
        this.setState(prev => ({...prev,[event.target.name]: event.target.value }),()=>console.log(this.state.type));

    };

    updateExact = () => {
        this.setState(prev => ({...prev,exact: !this.state.exact }),()=>console.log(this.state.exact));
    };

    addInput = event => {
        this.setState(prev => ({...prev, inputs: event.target.value }),()=>console.log(this.state.inputs));
    };

    render() {
        return (
            <div>
                <Dialog
                    open={this.state.open}
                    onClose={this.handleClose}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">Filter</DialogTitle>
                    <DialogContent>
                        <InputLabel htmlFor="link-type" className="inputLabel">
                            Type
                        </InputLabel>
                        <Select
                            value={this.state.type}
                            onChange={this.selectType}
                            inputProps={{
                                name: 'type',
                                id: 'type-simple',
                            }}
                            autoWidth={true}
                        >
                            <MenuItem value={'source'}>Source Link</MenuItem>
                            <MenuItem value={'middle'}>Middle Link</MenuItem>
                            <MenuItem value={'leaf'}>Leaf Link</MenuItem>
                        </Select>
                        <br/>
                        <br/>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="query"
                            label="query"
                            value={this.state.query}
                            type="text"
                            onChange={this.selectQuery('query')}
                            fullWidth
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={this.state.exact}
                                    onChange={this.updateExact}
                                    value="exact"
                                    color="primary"
                                />
                            }
                            label="Exact-match"
                        />
                        <br/>
                        <br/>
                        <InputLabel htmlFor="select-multiple-inputs" className="inputLabel">Inputs</InputLabel>
                        <Select
                            multiple
                            value={this.state.inputs}
                            onChange={this.addInput}
                            input={<Input id="select-multiple-inputs" />}
                            renderValue={selected => (
                                <div>
                                    {selected.map(value => (
                                        <Chip key={value} label={value}/>
                                    ))}
                                </div>
                            )}
                            MenuProps={MenuProps}
                            autoWidth={true}
                        >
                            {window.Arrays.basicInputs.map(name => (
                                <MenuItem key={name} value={name}>
                                    {name}
                                </MenuItem>
                            ))}
                        </Select>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={this.launchFilter} color="primary">
                            Launch
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

export class TagDialog extends Component {
    state = {
        open: true,
        type: '',
        inputs: [],
    };

    handleClose = () => {
        this.setState({ open: false });
        this.props.tagNonVisible();
    };

    launchTag = async ()  => {
        let array = Inputs.associateToBackend(this.state.inputs)
        const postRequest = await APIClient.launchModule("tag",this.state.type,array[0],{},{});
        const postResponse = await postRequest.json()
        if(postRequest.ok){
            this.props.blockTopologies();
        }
        console.log(postResponse)
        console.log("Array[1]",array[1])
        let aux = Inputs.addNewTopics(postResponse,this.props.addNode,this.props.addEdges,array[1]);
        window.Arrays.basicInputs = [...window.Arrays.basicInputs,...aux]
        this.setState({ open: false });
        this.props.tagNonVisible();
    }

    selectType = event => {
        this.setState(prev => ({...prev,[event.target.name]: event.target.value }),()=>console.log(this.state.type));

    };

    addInput = event => {
        this.setState(prev => ({...prev, inputs: event.target.value }),()=>console.log(this.state.inputs));
    };

    render() {
        return (
            <div>
                <Dialog
                    open={this.state.open}
                    onClose={this.handleClose}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">Tag Cloud</DialogTitle>
                    <DialogContent>
                        <InputLabel htmlFor="link-type" className="inputLabel">
                            Type
                        </InputLabel>
                        <Select
                            value={this.state.type}
                            onChange={this.selectType}
                            inputProps={{
                                name: 'type',
                                id: 'type-simple',
                            }}
                            autoWidth={true}
                        >
                            <MenuItem value={'source'}>Source Link</MenuItem>
                            <MenuItem value={'middle'}>Middle Link</MenuItem>
                            <MenuItem value={'leaf'}>Leaf Link</MenuItem>
                        </Select>
                        <br/>
                        <br/>
                        <InputLabel htmlFor="select-multiple-inputs" className="inputLabel">Inputs</InputLabel>
                        <Select
                            multiple
                            value={this.state.inputs}
                            onChange={this.addInput}
                            input={<Input id="select-multiple-inputs" />}
                            renderValue={selected => (
                                <div>
                                    {selected.map(value => (
                                        <Chip key={value} label={value}/>
                                    ))}
                                </div>
                            )}
                            MenuProps={MenuProps}
                            autoWidth={true}
                        >
                            {window.Arrays.basicInputs.map(name => (
                                <MenuItem key={name} value={name}>
                                    {name}
                                </MenuItem>
                            ))}
                        </Select>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={this.launchTag} color="primary">
                            Launch
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}


class TimeForm extends Component {

    render() {
        return (
            <div>
                <TextField
                    value = {this.props.start}
                    id="datetime-local"
                    label="Start point"
                    type="datetime-local"
                    InputLabelProps={{
                        shrink: true,
                    }}
                    onChange={this.props.selectStart}
                />
                <br/>
                <br/>
                <TextField
                    value = {this.props.stop}
                    id="datetime-local"
                    label="End point"
                    type="datetime-local"
                    InputLabelProps={{
                        shrink: true,
                    }}
                    onChange={this.props.selectStop}
                />
            </div>
        );
    }
}

class NtextsForm extends Component {

    render() {
        return (
            <div>
                <InputLabel htmlFor="link-type" className="inputLabel">
                    Number of texts
                </InputLabel>
                <br/>
                <TextField value={this.props.ntexts} id="number" type="number" inputProps={{ min:"0", max: "500"}} onChange={this.props.selectTexts}/>
            </div>
        );
    }
}

export class TopicDialog extends Component {
    state = {
        open: true,
        type: '',
        inputs: [],
        mode: '',
        start: '',
        stop: '',
        ntexts: '',
        ntopics: '',
        isNumberVisible: false,
        isTimeVisible: false
    };

    handleClose = () => {
        this.setState({ open: false });
        this.props.topicNonVisible();
    };

    launchTopic = async ()  => {
        let options = {}
        options["mode"] = {}
        options["ntopics"] = []
        options["ntopics"].push(this.state.ntopics)
        if(this.state.mode==="ntexts"){
            options["mode"]["ntexts"] = this.state.ntexts;
        }else if(this.state.mode==="time"){
            options["mode"]["time"] = [];
            let start = new Date(this.state.start).getTime()/1000;
            console.log("Start",start);
            let stop = new Date(this.state.stop).getTime()/1000;
            console.log("Start",stop);
            options["mode"]["time"].push(start.toString());
            options["mode"]["time"].push(stop.toString());
        }
        let array = Inputs.associateToBackend(this.state.inputs)
        const postRequest = await APIClient.launchModule("topic_analysis",this.state.type,array[0],options,{});
        const postResponse = await postRequest.json()
        if(postRequest.ok){
            this.props.blockTopologies();
        }
        console.log(postResponse)
        let aux = Inputs.addNewTopics(postResponse,this.props.addNode,this.props.addEdges,array[1]);
        window.Arrays.basicInputs = [...window.Arrays.basicInputs,...aux];
        this.setState({ open: false });
        this.props.topicNonVisible();
    }

    selectType = event => {
        this.setState(prev => ({...prev,[event.target.name]: event.target.value }),()=>console.log(this.state.type));

    };

    addInput = event => {
        this.setState(prev => ({...prev, inputs: event.target.value }),()=>console.log(this.state.inputs));
    };

    selectTopics = (event) => {
        this.setState({
            ntopics: event.target.value,
        },()=>console.log(this.state.ntopics));
    };

    selectNTexts = (event) => {
        this.setState({
            ntexts: event.target.value,
        },()=>console.log("Ntexts",this.state.ntexts));
    };

    callback_mode = () => {
        console.log(this.state.mode)
        if(this.state.mode==="ntexts"){
            this.setState(prev => ({...prev,isNumberVisible: true}),()=>console.log("Number",this.state.isNumberVisible));
            this.setState(prev => ({...prev,isTimeVisible: false}),()=>console.log("Time",this.state.isTimeVisible));
        }else if(this.state.mode==="time"){
            this.setState(prev => ({...prev,isTimeVisible: true}),()=>console.log("Time",this.state.isTimeVisible));
            this.setState(prev => ({...prev,isNumberVisible: false}),()=>console.log("Number",this.state.isNumberVisible));
        }
    }

    selectMode = (event) => {
        this.setState({
            mode: event.target.value,
        },this.callback_mode);
    };

    selectStart = (event) => {
        this.setState({
            start: event.target.value,
        },()=>console.log("Start",this.state.start));
    };

    selectStop = (event) => {
        this.setState({
            stop: event.target.value,
        },()=>console.log("Stop",this.state.stop));
    };

    render() {
        let time;
        let ntexts;
        if(this.state.isTimeVisible){
            time = <TimeForm start = {this.state.start} stop = {this.state.stop} selectStart = {this.selectStart} selectStop = {this.selectStop}/>;
        }
        else if(this.state.isNumberVisible){
            ntexts = <NtextsForm ntexts = {this.state.ntexts} selectTexts = { this.selectNTexts }/>;
        }
        return (
            <div>
                <Dialog
                    open={this.state.open}
                    onClose={this.handleClose}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">Topic Analysis</DialogTitle>
                    <DialogContent>
                        <InputLabel htmlFor="link-type" className="inputLabel">
                            Type
                        </InputLabel>
                        <Select
                            value={this.state.type}
                            onChange={this.selectType}
                            inputProps={{
                                name: 'type',
                                id: 'type-simple',
                            }}
                            autoWidth={true}
                        >
                            <MenuItem value={'source'}>Source Link</MenuItem>
                            <MenuItem value={'middle'}>Middle Link</MenuItem>
                            <MenuItem value={'leaf'}>Leaf Link</MenuItem>
                        </Select>
                        <br/>
                        <br/>
                        <InputLabel htmlFor="select-multiple-inputs" className="inputLabel">Inputs</InputLabel>
                        <Select
                            multiple
                            value={this.state.inputs}
                            onChange={this.addInput}
                            input={<Input id="select-multiple-inputs" />}
                            renderValue={selected => (
                                <div>
                                    {selected.map(value => (
                                        <Chip key={value} label={value}/>
                                    ))}
                                </div>
                            )}
                            MenuProps={MenuProps}
                            autoWidth={true}
                        >
                            {window.Arrays.basicInputs.map(name => (
                                <MenuItem key={name} value={name}>
                                    {name}
                                </MenuItem>
                            ))}
                        </Select>
                        <br/>
                        <br/>
                        <InputLabel htmlFor="link-type" className="inputLabel">
                            Number of topics
                        </InputLabel>
                        <br/>
                        <TextField id="number" type="number" inputProps={{ min:"0", max: "500"}} value={this.state.ntopics} onChange={this.selectTopics}/>
                        <br/>
                        <br/>
                        <InputLabel htmlFor="link-type" className="inputLabel">
                            Mode
                        </InputLabel>
                        <br/>
                        <br/>
                        <RadioGroup
                            aria-label="gender"
                            name="gender2"
                            value={this.state.mode}
                            onChange={this.selectMode}
                        >
                            <FormControlLabel
                                value="ntexts"
                                control={<Radio color="primary" />}
                                label="Number of texts"
                                labelPlacement="start"
                            />
                            <FormControlLabel
                                value="time"
                                control={<Radio color="primary" />}
                                label="Time"
                                labelPlacement="start"
                            />
                        </RadioGroup>
                        {time}
                        {ntexts}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={this.launchTopic} color="primary">
                            Launch
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

export class StatsDialog extends Component {
    state = {
        open: true,
        type: '',
        inputs: [],
    };

    handleClose = () => {
        this.setState({ open: false });
        this.props.statsNonVisible();
    };

    launchStats = async ()  => {
        let array = Inputs.associateToBackend(this.state.inputs)
        const postRequest = await APIClient.launchModule("stats",this.state.type,array[0],{},{});
        const postResponse = await postRequest.json()
        if(postRequest.ok){
            this.props.blockTopologies();
        }
        console.log(postResponse)
        let aux = Inputs.addNewTopics(postResponse,this.props.addNode,this.props.addEdges,array[1]);
        window.Arrays.basicInputs = [...window.Arrays.basicInputs,...aux]
        this.setState({ open: false });
        this.props.statsNonVisible();
    }

    selectType = event => {
        this.setState(prev => ({...prev,[event.target.name]: event.target.value }),()=>console.log(this.state.type));

    };

    addInput = event => {
        this.setState(prev => ({...prev, inputs: event.target.value }),()=>console.log(this.state.inputs));
    };

    render() {
        return (
            <div>
                <Dialog
                    open={this.state.open}
                    onClose={this.handleClose}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">Stats</DialogTitle>
                    <DialogContent>
                        <InputLabel htmlFor="link-type" className="inputLabel">
                            Type
                        </InputLabel>
                        <Select
                            value={this.state.type}
                            onChange={this.selectType}
                            inputProps={{
                                name: 'type',
                                id: 'type-simple',
                            }}
                            autoWidth={true}
                        >
                            <MenuItem value={'source'}>Source Link</MenuItem>
                            <MenuItem value={'middle'}>Middle Link</MenuItem>
                            <MenuItem value={'leaf'}>Leaf Link</MenuItem>
                        </Select>
                        <br/>
                        <br/>
                        <InputLabel htmlFor="select-multiple-inputs" className="inputLabel">Inputs</InputLabel>
                        <Select
                            multiple
                            value={this.state.inputs}
                            onChange={this.addInput}
                            input={<Input id="select-multiple-inputs" />}
                            renderValue={selected => (
                                <div>
                                    {selected.map(value => (
                                        <Chip key={value} label={value}/>
                                    ))}
                                </div>
                            )}
                            MenuProps={MenuProps}
                            autoWidth={true}
                        >
                            {window.Arrays.basicInputs.map(name => (
                                <MenuItem key={name} value={name}>
                                    {name}
                                </MenuItem>
                            ))}
                        </Select>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={this.launchStats} color="primary">
                            Launch
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

export class BatchDialog extends Component {
    state = {
        open: true,
        type: '',
        inputs: [],
        start: '',
        stop: '',
    };

    handleClose = () => {
        this.setState({ open: false });
        this.props.batchNonVisible();
    };

    launchBatch = async () => {
        let w = []
        let start = new Date(this.state.start).getTime()/1000;
        console.log("Start",start);
        let stop = new Date(this.state.stop).getTime()/1000;
        console.log("Start",stop);
        w.push(start.toString());
        w.push(stop.toString());
        let array = Inputs.associateToBackend(this.state.inputs)
        const postRequest = await APIClient.launchModule("batch",this.state.type,array[0],{"windows":[w]},{});
        const postResponse = await postRequest.json()
        if(postRequest.ok){
            this.props.blockTopologies();
        }
        console.log(postResponse)
        let aux = Inputs.addNewTopics(postResponse,this.props.addNode,this.props.addEdges,array[1]);
        window.Arrays.basicInputs = [...window.Arrays.basicInputs,...aux]
        this.setState({ open: false });
        this.props.batchNonVisible();
    }

    selectType = event => {
        this.setState(prev => ({...prev,[event.target.name]: event.target.value }),()=>console.log(this.state.type));

    };

    addInput = event => {
        this.setState(prev => ({...prev, inputs: event.target.value }),()=>console.log(this.state.inputs));
    };

    selectStart = (event) => {
        this.setState({
            start: event.target.value,
        },()=>console.log("Start",this.state.start));
    };

    selectStop = (event) => {
        this.setState({
            stop: event.target.value,
        },()=>console.log("Stop",this.state.stop));
    };

    render() {
        return (
            <div>
                <Dialog
                    open={this.state.open}
                    onClose={this.handleClose}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">Batch processing</DialogTitle>
                    <DialogContent>
                        <InputLabel htmlFor="link-type" className="inputLabel">
                            Type
                        </InputLabel>
                        <Select
                            value={this.state.type}
                            onChange={this.selectType}
                            inputProps={{
                                name: 'type',
                                id: 'type-simple',
                            }}
                            autoWidth={true}
                        >
                            <MenuItem value={'source'}>Source Link</MenuItem>
                            <MenuItem value={'middle'}>Middle Link</MenuItem>
                            <MenuItem value={'leaf'}>Leaf Link</MenuItem>
                        </Select>
                        <br/>
                        <br/>
                        <InputLabel htmlFor="select-multiple-inputs" className="inputLabel">Inputs</InputLabel>
                        <Select
                            multiple
                            value={this.state.inputs}
                            onChange={this.addInput}
                            input={<Input id="select-multiple-inputs" />}
                            renderValue={selected => (
                                <div>
                                    {selected.map(value => (
                                        <Chip key={value} label={value}/>
                                    ))}
                                </div>
                            )}
                            MenuProps={MenuProps}
                            autoWidth={true}
                        >
                            {window.Arrays.basicInputs.map(name => (
                                <MenuItem key={name} value={name}>
                                    {name}
                                </MenuItem>
                            ))}
                        </Select>
                        <br/>
                        <br/>
                        <TimeForm start = {this.state.start} stop = {this.state.stop} selectStart = {this.selectStart} selectStop = {this.selectStop}/>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={this.launchBatch} color="primary">
                            Launch
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

class JSONError extends Component {

    render() {
        return (
            <div>
                <h3 style={{
                    color:'red',
                    fontSize:'15pt'
                }}>Options must have a correct JSON format!</h3>
            </div>
        );
    }
}

export class CustomizedDialog extends Component {

    state = {
        image: '',
        open: true,
        type: '',
        inputs: [],
        file: '',
        options: '',
        error: false
    };

    handleClose = () => {
        this.setState({ open: false });
        this.props.dialogNonVisible();
    };

    selectFile = name => event => {
        this.setState({
            [name]: event.target.value,
        },()=>console.log(this.state.file));
    };

    selectImage = name => event => {
        this.setState({
            [name]: event.target.value,
        },()=>console.log(this.state.image));
    };

    launchModule = async ()  => {
        this.setState(prev => ({...prev,error: false}),()=>console.log(this.state.error));
        var json = {}
        try{
            json = JSON.parse(this.state.options);
            try{
                let array = Inputs.associateToBackend(this.state.inputs)
                const postRequest = await APIClient.launchModule(this.state.image,this.state.type,array[0],json,{"file":this.state.file});
                const postResponse = await postRequest.json()
                if(postRequest.ok){
                    this.props.blockTopologies();
                }
                console.log(postResponse)
                let aux = Inputs.addNewTopics(postResponse,this.props.addNode,this.props.addEdges,array[1]);
                window.Arrays.basicInputs = [...window.Arrays.basicInputs,...aux]
                this.setState({ open: false });
                this.props.dialogNonVisible();
            }catch(e){

            }
        }catch(e){
            this.setState(prev => ({...prev,error: true}),()=>console.log(this.state.error));
        }

    }

    selectType = event => {
        this.setState(prev => ({...prev,[event.target.name]: event.target.value }),()=>console.log(this.state.type));

    };

    addInput = event => {
        this.setState(prev => ({...prev, inputs: event.target.value }),()=>console.log(this.state.inputs));
    };

    selectOptions = name => event => {
        this.setState({
            [name]: event.target.value,
        },()=>console.log(this.state.options));
    };

    render() {
        let error;
        if(this.state.error){
            error = <JSONError/>;
        }
        return (
            <div>
                <Dialog
                    open={this.state.open}
                    onClose={this.handleClose}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="image"
                            label="Image"
                            value={this.state.image}
                            type="text"
                            onChange={this.selectImage('image')}
                            fullWidth
                        />
                        <InputLabel htmlFor="link-type" className="inputLabel">
                            Type
                        </InputLabel>
                        <Select
                            value={this.state.type}
                            onChange={this.selectType}
                            inputProps={{
                                name: 'type',
                                id: 'type-simple',
                            }}
                            autoWidth={true}
                        >
                            <MenuItem value={'source'}>Source Link</MenuItem>
                            <MenuItem value={'middle'}>Middle Link</MenuItem>
                            <MenuItem value={'leaf'}>Leaf Link</MenuItem>
                        </Select>
                        <br/>
                        <br/>
                        <InputLabel htmlFor="select-multiple-inputs" className="inputLabel">Inputs <b>(empty if it is a source)</b></InputLabel>
                        <Select
                            multiple
                            value={this.state.inputs}
                            onChange={this.addInput}
                            input={<Input id="select-multiple-inputs" />}
                            renderValue={selected => (
                                <div>
                                    {selected.map(value => (
                                        <Chip key={value} label={value}/>
                                    ))}
                                </div>
                            )}
                            MenuProps={MenuProps}
                            autoWidth={true}
                        >
                            {window.Arrays.basicInputs.map(name => (
                                <MenuItem key={name} value={name}>
                                    {name}
                                </MenuItem>
                            ))}
                        </Select>
                        <br/>
                        <br/>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="file"
                            label="File (if necessary)"
                            value={this.state.file}
                            type="text"
                            placeholder={"e.g. json_adapter.py"}
                            onChange={this.selectFile('file')}
                            fullWidth
                        />
                        <br/>
                        <br/>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="options"
                            label="Options (if  there isn't any, please write {})"
                            value={this.state.options}
                            placeholder={"{\"key\":\"value\"}"}
                            type="text"
                            onChange={this.selectOptions('options')}
                            fullWidth
                        />
                        {error}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={this.launchModule} color="primary">
                            Launch
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

class NodeOptions extends Component {

    render() {
        return <>
                <Select
                    value={this.props.addElement}
                    onChange={this.props.selectAdd}
                    input={<Input id="select-input" />}
                    MenuProps={MenuProps}
                    fullWidth={true}
                >
                    {this.props.addList.map(name => (
                        <MenuItem key={name} value={name}>
                            {name.orig_text}
                        </MenuItem>
                    ))}
                </Select>
                <Button
                    aria-haspopup="true"
                    onClick={this.props.addInputTopic}
                    style={{
                        width: "100%",
                        backgroundColor: "white",
                        padding: "10px 20px",
                        margin: "10px 0px",
                        color: "dark",
                        fontSize: "12 pt",
                    }}
                >
                    Add input topic
                </Button>
                <Select
                    value={this.props.removeElement}
                    onChange={this.props.selectRemove}
                    input={<Input id="select-input"/>}
                    MenuProps={MenuProps}
                    fullWidth={true}
                >
                    {this.props.removeList.map(name => (
                        <MenuItem key={name} value={name}>
                            {name.orig_text}
                        </MenuItem>
                    ))}
                </Select>
                <Button
                    aria-haspopup="true"
                    onClick={this.props.removeInputTopic}
                    style={{
                        width: "100%",
                        backgroundColor: "white",
                        padding: "10px 20px",
                        margin: "10px 0px",
                        color: "dark",
                        fontSize: "12 pt",
                    }}
                >
                    Remove input topic
                </Button>
            </>
    }
}

export class NodeDialog extends Component {

    state = {
        open: true,
        addElement: '',
        removeElement: '',
        addList: [],
        selectedNode: {},
        isNodeOptionsVisible: true
    };

    handleClose = () => {
        this.setState({ open: false });
        this.props.nodeNonVisible();
    };

    handleClick = () =>{
        this.props.showDashboard();
        this.props.nodeNonVisible();
    }

    selectAdd = event => {
        this.setState(prev => ({...prev, addElement: event.target.value }),()=>console.log("!!!Add element",this.state.addElement));
    };

    selectRemove = event => {
        this.setState(prev => ({...prev, removeElement: event.target.value }),()=>console.log("!!!Remove element",this.state.removeElement));
    };

    componentDidMount() {
        this.props.addToDashboard();
        let selectedNodeAux = window.Arrays.dashboardElements[0];
        if(selectedNodeAux==="Twitter texts" || selectedNodeAux==="Reddit comments" || selectedNodeAux==="Reddit submissions"){
            this.props.nodeNonVisible();
        }
        let module = selectedNodeAux.substring(0,selectedNodeAux.length-1).toLowerCase();
        let dict = {}
        dict["image"] = module;
        dict["type"] = "middle";
        dict["inputs"] = []
        for(let i in this.props.removeList){
            dict["inputs"].push({"id":this.props.removeList[i].idFrom,"topics":[this.props.removeList[i].topic]})
        }
        this.setState({selectedNode:dict},()=> console.log("!!!Selected node",this.state.selectedNode))

        /*Now, we pick the elements that are not present in the removeList and include them in the addList*/
        let listAux = []
        for(let i=0;i<Inputs.inputs.length;i++){
            let aux = Inputs.inputs[i]
            let found = false
            let removeList = this.props.removeList.slice()
            let nodesList = this.props.graph.nodes.slice()
            Object.keys(aux).forEach(function(key) {
                for(let j in removeList){
                    if(removeList[j].idFrom===aux[key].id && removeList[j].topic===aux[key].topics[0]){
                        found = true;
                        break;
                    }
                }
                if(!found && key!==selectedNodeAux){
                    let dictAdd = {}
                    dictAdd["idFrom"] = aux[key].id
                    if("topics" in aux[key]){
                        dictAdd["topic"] = aux[key].topics[0]
                    }else{
                        dictAdd["topic"] = ""
                    }
                    dictAdd["orig_text"] = aux[key].orig_text
                    for(let k in nodesList){
                        if(nodesList[k].label===selectedNodeAux){
                            dictAdd["to"] = nodesList[k].id
                        } else if(nodesList[k].label===key){
                            dictAdd["from"] = nodesList[k].id
                        }
                    }
                    listAux.push(dictAdd)
                }
            });
        }
        this.setState({addList:listAux},()=> console.log("!!!Add List",this.state.addList))
    }

    componentWillUnmount() {
        window.Arrays.dashboardElements = []
    }

    addInputTopic = async() => {
        let input = ""
        if(this.state.addElement.idFrom && this.state.addElement.topic){
            input = this.state.addElement.idFrom+"-"+this.state.addElement.topic
        } else if(this.state.addElement.topic){
            input = this.state.addElement.topic
        } else{
            input = this.state.addElement.idFrom
        }
        const postRequest = await APIClient.launchModule(this.state.selectedNode.image,this.state.selectedNode.type,this.state.selectedNode.inputs,{},{"met":"add_topic","met_args":[input]});
        const postResponse = await postRequest.json()
        if(postRequest.ok){
            this.props.addInput(this.state.addElement);
            this.props.nodeNonVisible();
        }
    }

    removeInputTopic = async() => {
        let input = ""
        if(this.state.removeElement.idFrom && this.state.removeElement.topic){
            input = this.state.removeElement.idFrom+"-"+this.state.removeElement.topic
        } else if(this.state.removeElement.topic){
            input = this.state.removeElement.topic
        } else{
            input = this.state.removeElement.idFrom
        }
        const postRequest = await APIClient.launchModule(this.state.selectedNode.image,this.state.selectedNode.type,this.state.selectedNode.inputs,{},{"met":"remove_topic","met_args":[input]});
        const postResponse = await postRequest.json()
        if(postRequest.ok){
            this.props.removeInput(this.state.removeElement);
            this.props.nodeNonVisible();
        }
    }

    render() {
        return (
            <div>
                <Dialog
                    open={this.state.open}
                    onClose={this.handleClose}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogContent>
                        <Button
                            aria-haspopup="true"
                            onClick={this.handleClick}
                            style={{
                                width: "100%",
                                backgroundColor: "white",
                                padding: "10px 20px",
                                margin: "10px 0px",
                                color: "dark",
                                fontSize: "12 pt",
                            }}
                        >
                            Show in Dashboard
                        </Button>
                        <NodeOptions addInputTopic = {this.addInputTopic} removeInputTopic={this.removeInputTopic} selectAdd={this.selectAdd} selectRemove={this.selectRemove} addElement={this.state.addElement} removeElement={this.state.removeElement} addList={this.state.addList} removeList={this.props.removeList}/>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="primary">
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}
