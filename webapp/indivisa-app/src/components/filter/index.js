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
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import InputLabel from '@material-ui/core/InputLabel';
import CardActions from "@material-ui/core/CardActions";
import Button from "@material-ui/core/Button";
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Input from '@material-ui/core/Input';
import Chip from '@material-ui/core/Chip';
import Inputs from "../inputs";
import PropTypes from 'prop-types';
import 'font-awesome/css/font-awesome.min.css';
import "../../App.css";
import { withStyles } from '@material-ui/core/styles';

const styles = {
    twitter: {
        backgroundColor: '#38A1F3',
    },
    reddit: {
        backgroundColor: '#ff4301',
    },
    content: {
        fontSize: '14pt',
        margin: '50px 50px',
        backgroundColor: '#F5F5F5',
    },
    icon: {
        fontSize: '32px'
    },
    title: {
        fontSize: '12pt',
    },
    subheader: {
      fontSize: '12pt'
    }
};

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        },
    },
};

class Filter extends Component{

    constructor(props) {
        super(props);
        this.state = {
            interval: null,
            posts: [],
            ids: {},
            renderMsgs: [],
            queries: [],
            query: ''
        };
    }

    cutBody = (body) => {
        if(body.length>1000){
            return body.slice(0,1000) + "[...]";
        }else{
            return body;
        }
    }

    tick = async () => {
        this.setState({posts:[]})
        if(this.state.query){
            const response = await APIClient.getDataFromPlatform(this.state.ids[this.state.query]);
            const texts = await response.json()
            const textsReverse = texts[this.state.ids[this.state.query]].reverse()
            this.setState({posts:this.state.posts.concat(textsReverse)})
            console.log(this.state.posts)
            this.setState({renderMsgs:[]})
            const {classes} = this.props;
            for(const i in this.state.posts){
                if(this.state.renderMsgs.length<100){
                    let icon = null
                    if(this.state.posts[i].src==="twitter"){
                        let timestamp = this.state.posts[i].timestamp
                        let date = new Intl.DateTimeFormat('en-US', {year: 'numeric', month: '2-digit',day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'}).format(timestamp)
                        icon = <div className={classes.icon}><i class="fa fa-twitter"></i></div>
                        this.setState({renderMsgs:this.state.renderMsgs.concat([<Card className={classes.content}>
                                <CardHeader className={classes.twitter}
                                    avatar = {icon}
                                    title={"@"+this.state.posts[i].user_id}
                                    subheader={date}
                                    titleTypographyProps={{variant:'h6'}}
                                    subheaderTypographyProps={{variant:'h6'}}
                                />
                                <CardContent style={{
                                    color: 'black',
                                }}>
                                    {this.cutBody(this.state.posts[i].body)}
                                </CardContent>
                                <CardActions>
                                    <Button
                                        size="small"
                                        href={this.state.posts[i].url}
                                        target="_blank"
                                    >
                                        Watch on source
                                    </Button>
                                </CardActions>
                            </Card>])})
                    }else{
                        let timestamp = this.state.posts[i].timestamp*1000
                        let date = new Intl.DateTimeFormat('en-US', {year: 'numeric', month: '2-digit',day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'}).format(timestamp)
                        icon  = <div className={classes.icon}><i class="fa fa-reddit"></i></div>
                        this.setState({renderMsgs:this.state.renderMsgs.concat([<Card className={classes.content}>
                                <CardHeader className={classes.reddit}
                                    avatar = {icon}
                                    title={"@"+this.state.posts[i].user_id}
                                    subheader={date}
                                    titleTypographyProps={{variant:'h6'}}
                                    subheaderTypographyProps={{variant:'h6'}}
                                />
                                <CardContent style={{
                                    color: 'black',
                                }}>
                                    {this.cutBody(this.state.posts[i].body)}
                                </CardContent>
                                <CardActions>
                                    <Button
                                        size="small"
                                        href={this.state.posts[i].url}
                                        target="_blank"
                                    >
                                        Watch on source
                                    </Button>
                                </CardActions>
                            </Card>])})
                    }
                }
            }
        }
    }

    selectQuery = event => {
        this.setState( ({query: event.target.value }),()=>console.log("Query",this.state.query));
    };

    componentDidMount() {
        let intervalId = setInterval(this.tick, 300);
        const module = this.props.module;
        this.setState({interval:intervalId},()=>console.log("Interval",this.state.interval));
        let auxQueries = []
        let dict = {}
        for(let i=0;i<Inputs.inputs.length;i++){
            let aux = Inputs.inputs[i]
            Object.keys(aux).forEach(function(key) {
                if(key===module){
                    let query = aux[key].orig_text.split("-");
                    if(query.length===2){
                        query = query[1].charAt(0).toUpperCase() + query[1].slice(1);
                    }else if(query.length===3){
                        query = query[1].charAt(0).toUpperCase() + query[1].slice(1)+"-"+query[2];
                    }
                    dict[query] = aux[key].id+"-"+aux[key].topics[0];
                    auxQueries.push([query])
                }
            });
        }
        this.setState({ids:dict},()=>console.log("Ids",this.state.ids))
        this.setState({queries:this.state.queries.concat(auxQueries)},()=>console.log("Queries",this.state.queries))
    }

    componentWillUnmount() {
        clearInterval(this.state.interval);
        window.Arrays.dashboardElements = []
    }

    render() {
        return <>
                <div className="queries">
                    <InputLabel
                        htmlFor="select-query"
                        style={{
                            color: 'white',
                            margin: '0px 0px 0px 50px',
                            fontSize: '14pt'
                        }}
                    >
                        Available queries
                    </InputLabel>
                    <Select
                        value={this.state.query}
                        onChange={this.selectQuery}
                        input={<Input id="select-query"/>}
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
                            name: 'available queries',
                            id: 'queries',
                        }}
                    >
                        {this.state.queries.map(name => (
                            <MenuItem key={name} value={name} style={{fontSize:'12pt'}}>
                                {name}
                            </MenuItem>
                        ))}
                    </Select>
                </div>
                <div className="cards">{this.state.renderMsgs}</div>
            </>
    }
}

Filter.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Filter);
