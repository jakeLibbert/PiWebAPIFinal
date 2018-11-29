
var afServerName = "BTS-OSI-D01";
var afDatabaseName = "Pipe Cable Monitoring";
var circuitTemplate = "Circuit";
var dataBaseWebID = "";

var piwebapi = (function () {
    // private variables
    var basePIWebAPIUrl = null;
    var currentUserName = null;
    var currentPassword = null;

    // private methods
    var processJsonContent = function (url, type, data, successCallBack, errorCallBack) {
        return $.ajax({
            url: encodeURI(url),
            type: type,
            data: data,
            contentType: "application/json; charset=UTF-8",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", makeBasicAuth(currentUserName, currentPassword));
            },
            success: successCallBack,
            error: errorCallBack
        });
    };

    var makeBasicAuth = function (user, password) {
        var tok = user + ':' + password;
        var hash = window.btoa(tok);
        return "Basic " + hash;
    };

    var getDatabaseWebId = function (databaseName, successCallBack, errorCallBack) {
        var url = basePIWebAPIUrl + "assetdatabases?path=\\\\" + afServerName + "\\" + databaseName;
        return processJsonContent(url, 'GET', null, successCallBack, errorCallBack);
    };


    return {
        //get all elements of the Circuit template to load the drop down menu
        GetCircuits: function () {
            var circuitsURL = "";
            var ajaxDb = getDatabaseWebId(afDatabaseName, null, null);

            $.when(ajaxDb).fail(function () {
                console.log("Cannot connect to AF database " + afDatabaseName);
            });

            $.when(ajaxDb).done(function (data) {
                dataBaseWebID = data.WebId;
                circuitsURL = basePIWebAPIUrl + "assetdatabases/" + data.WebId + "//elements?templateName=";
                circuitsURL += circuitTemplate + "&searchFullhierarchy=true";

                processJsonContent(circuitsURL, 'GET', null, loadCircuitCallBak, genErrorCallBack);

            });
        },
        //get event frames related to the sent element. Of 2 specific event templates
        GetAllEvents: function(elementID){

            var requestURL = basePIWebAPIUrl + "elements/" + elementID;
            requestURL += "/eventframes?startTime=01/01/2018";

            var outageURL = requestURL + "&TemplateName=Circuit Outage"
            processJsonContent(outageURL, 'GET', null, handleOutageEventFrameData, genErrorCallBack);

            var emergencyURL = requestURL + "&TemplateName=Circuit Emergency"
            processJsonContent(outageURL, 'GET', null, handleEmergencyEventFrameData, genErrorCallBack);

        },
        //get status attribute for use later
        GetStatusAttribute: function (elementID) {

            var requestURL = basePIWebAPIUrl + "elements/" + elementID;
            requestURL += "/attributes?nameFilter=CP OVERALL STATUS";
            processJsonContent(requestURL, 'GET', null, handleAttrData, genErrorCallBack);

        },
        //get current status value
        GetStatusValue: function (streamID) {

            var requestURL = basePIWebAPIUrl + "streams/" + streamID + "/value";
            processJsonContent(requestURL, 'GET', null, handleStatusData, genErrorCallBack);

        },
        //update status value
        UpdateCPStatus: function (streamID, newData){
            var postURL = basePIWebAPIUrl + "streams/" + streamID + "/value";
            var dataObj = { Timestamp: "*", Value: newData };
            var data = JSON.stringify(dataObj);

            var ajaxUpdate = processJsonContent(postURL, 'POST', data, null, genErrorCallBack)

            $.when(ajaxUpdate).fail(function () {
                console.log("Error updating data");
            });

            $.when(ajaxUpdate).done(function (data) {

                var requestURL = basePIWebAPIUrl + "streams/" + streamID + "/value";
                processJsonContent(requestURL, 'GET', null, handleStatusData, genErrorCallBack);

            });

        },
        // Set base PI Web API URL
        SetBaseUrl: function (baseUrl) {
            basePIWebAPIUrl = baseUrl;
            if (basePIWebAPIUrl.slice(-1) != '/') {
                basePIWebAPIUrl = basePIWebAPIUrl + "/";
            }
        },

        // Set username and password
        SetCredentials: function (user, password) {
            currentUserName = user;
            currentPassword = password;
        },

        // Check authentication
        Authorize: function (successCallBack, errorCallBack) {
            // Make ajax call
            return processJsonContent(basePIWebAPIUrl, 'GET', null, successCallBack, errorCallBack);
        },

        Reset: function() {
            basePIWebAPIUrl = null;
            currentUserName = null;
            currentPassword = null;
        }

    }
    
})();