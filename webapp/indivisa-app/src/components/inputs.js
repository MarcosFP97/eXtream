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

export default class Inputs { /*Class that will keep all topology active inputs*/

    static inputs = [
        {'Twitter texts':{"id":"","topics":['twitter_texts'],"orig_text":"Twitter texts"}},
        {'Reddit comments':{"id":"","topics":['reddit_comments'],"orig_text":"Reddit comments"}},
        {'Reddit submissions':{"id":"","topics":['reddit_submissions'],"orig_text":"Reddit submissions"}}
    ];

    static generateBasicUIInputs = () => {
        let topics = []
        for(var i=0;i<Inputs.inputs.length;i++){
            let aux = Inputs.inputs[i]
            Object.keys(aux).forEach(function(key) {
                topics.push(key)
            });
        }
        return topics
    }

    static associateToBackend = inputs => {
        let real_inputs = []
        let keys = []

        for(var j in inputs){
            for(var i=0;i<Inputs.inputs.length;i++){
                let aux = Inputs.inputs[i]
                Object.keys(aux).forEach(function(key) {
                    if (inputs[j] === aux[key]["orig_text"]) {
                        real_inputs.push(aux[key])
                        let dict = {}
                        dict[key] = [aux[key].id,aux[key].topics[0],aux[key].orig_text]
                        keys.push(dict)
                    }
                });
            }
        }

        return [real_inputs,keys]
    }

    static generateUserResult = (dict, image, topic, newKey) => {
        let result = []
        let orig_text = null
        if(topic){
            if(image==="filter"){
                let aux = topic
                let len = aux.length
                let exact = aux.charAt(len-1)
                if(exact==="0"){
                    orig_text = newKey+"-"+topic.substring(0, len-1)+" Exact"
                    result.push(orig_text)
                }else if(exact==="1"){
                    orig_text = newKey+"-"+topic.substring(0, len-1)+" Non-exact"
                    result.push(orig_text)
                }
            }else if(image==="batch"){
                let aux = topic
                let window = aux.split("-")
                for(var w in window){
                    var dateTimeFormat1 = new Intl.DateTimeFormat('default',{year: 'numeric', month: '2-digit',day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'})
                    window[window.indexOf(window[w])]= dateTimeFormat1.format(Number(window[w])*1000);
                    console.log("W",window[window.indexOf(window[w])])
                }
                orig_text = newKey +"-"+window[0]+"-"+window[1]
                result.push(orig_text)
            }else{
                orig_text = newKey+"-"+topic
                result.push(orig_text)
            }
        }else{
            orig_text = newKey
            result.push(orig_text)
        }
        dict[newKey]["orig_text"] = orig_text
        return result
    }

    static addNewTopics = (postResponse,addNode,addEdges,edges) => {
        let image = postResponse.image
        let outputs = postResponse.outputs
        let type = postResponse.type
        let id = postResponse.id
        let topics = []
        let newKey = null
        let result = []
        let dict = null
        let hasOutputs = false //if the launched container has no output then we shouldn't generate a new input in the dropdown

        for(var o in outputs){ /*We process container's outputs*/
            if(image==="filter" || image==="topic_analysis"){
                let aux = outputs[o].split("-");
                id = aux[0];
                topics.push(aux[1]);
            } else if(image==="batch"){
                let aux = outputs[o].split("-");
                id = aux[0];
                let topic = aux[1] + "-" + aux[2];
                topics.push(topic);
            }else{
                id = outputs[o];
            }
            hasOutputs = true
        }


        let equal = false
        for(var i=0;i<Inputs.inputs.length;i++){
            let aux = Inputs.inputs[i]
            Object.keys(aux).forEach(function(key) {
                let idAux = aux[key]["id"]
                console.log("Id aux "+idAux)
                let len = key.length
                let n = key.charAt(len-1)
                key = key.substring(0, len-1).toLowerCase();
                if(key===image){
                    if(id!==idAux){
                        n = parseInt(n) + 1;
                    }else{
                        equal = true
                    }
                    newKey = image.charAt(0).toUpperCase() + image.slice(1) + n.toString();
                }
            });
            if(equal){
                break;
            }
        }

        if(!newKey){
            newKey = image.charAt(0).toUpperCase() + image.slice(1) + "0";
            let nodeId = addNode(newKey);
            addEdges(nodeId,edges);
            equal = true;
        }
        if(!equal){
            let nodeId = addNode(newKey);
            addEdges(nodeId,edges);
        }
        if(topics.length > 0){
            for(let t in topics){
                dict = {[newKey]:{"id":id,"topics":[topics[t]]}}
                Inputs.inputs.push(dict)
                result = [ ...result, ...Inputs.generateUserResult(dict,image, topics[t],newKey) ]
            }
        }else{
            dict = {[newKey]:{"id":id}}
            Inputs.inputs.push(dict)
            result = [ ...result, ...Inputs.generateUserResult(dict,image,"",newKey)]
        }
        console.log("###############")
        console.log(Inputs.inputs)
        console.log(result)

        if(type==='leaf' || !hasOutputs){
            return []
        }

        return result
    }
}
