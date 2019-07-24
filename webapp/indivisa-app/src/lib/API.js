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

import axios from "axios";

const BASE_URL = 'http://localhost:3000/api/v1.0/platform'


export default class APIClient{

    static async launchModule(image,type, inputs, options, params){
        return fetch(`${BASE_URL}`, {
            method: "POST",
            mode: "cors",
            body: JSON.stringify({
                image: image,
                type: type,
                inputs: inputs,
                options: options,
                params: params
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
    }

    static async launchTopology(content){
        return fetch(`${BASE_URL}`, {
            method: "POST",
            mode: "cors",
            body: JSON.stringify({
                topology:content
            }),
        })
    }

    static async sendCustomImage(data,unblockCustom,activateError,setErrorMsg,changeUploaded){
        axios.post(`${BASE_URL}/image-upload`, data, { // receive two parameter endpoint url ,form data
        })
            .then(res => { // then print response status
                if(res.status===200){
                    unblockCustom();
                    changeUploaded();
                }
        })
            .catch(error =>{
                activateError();
                setErrorMsg(error.response.data['msg']);
            })
    }

    static async getDataFromPlatform(id){

        return fetch(`${BASE_URL}/${id}`, {
            method: "GET",
            mode: "cors",
            headers: {
                "Accept": "application/json"
            }
        })

    }


    static async deleteContainers(){
        return fetch(`${BASE_URL}`, {
            method: "DELETE",
            mode: "cors",
            headers: {
                "Accept": "application/json"
            }
        })
    }
}
