const axios = require("axios");
module.exports = function (RED) {
    function FunctionNode(n) {
        RED.nodes.createNode(this, n);
        if (RED.nodes.getNode(n.creds)){
            this.access_token = RED.nodes.getNode(n.creds).credentials.access_token;
            this.gitlab_url = RED.nodes.getNode(n.creds).credentials.gitlab_url;
        } else {
            this.access_token = "";
            this.gitlab_url = "";
        }
        var node = this;
        this.name = n.name;

        for (var key in n) {
            node[key] = n[key] || "";
        }
        this.on('input', function (msg) {
            for (var i in msg) {
                if (i !== 'req' | i !== 'res' | i !== 'payload' | i !== 'send' | i !== '_msgid') {
                    node[i] =  msg[i] || node[i];
                }
            }
            if(!node.url){
                if(node.api){
                    // node.gitlab_url=https://gitlab.example.com/api/v4/
                    // /projects/:id/jobs --> api=projects, path=/:id/jobs
                    node.url = node.gitlab_url + node.api.toLowerCase() + node.path.toLowerCase();
                }else{
                    node.url = node.gitlab_url; // https://gitlab.example.com/api/v4/
                }
            }

            node.options = {};
            node.options.headers = {};
            if(node.params){
                node.options.params = node.params;
            }else{
                node.options.params = {};
                node.options.params = n.params;

            }
            node.options.headers['PRIVATE-TOKEN'] = node.access_token;
            axios[node.method.toLowerCase()](node.url, node.options)
                .then(function (response){
                    msg.payload = response.data;
                    node.send(msg);
                }).catch(function (err){
                msg.payload = err;
                node.send(msg);
            });
        });
    }

    RED.nodes.registerType("gitlabapi", FunctionNode, {
        credentials: {
            access_token: {type:"text"},
            gitlab_url: {type:"text"}
        }
    });

    function gitlabapiApiKey(n){
        RED.nodes.createNode(this, n);
        this.access_token = n.access_token;
        this.gitlab_url = n.gitlab_url;
    }

    RED.nodes.registerType("gitlabapiApiKey", gitlabapiApiKey,{
        credentials: {
            access_token: {type:"text"},
            gitlab_url: {type:"text"}
        }
    });
};
