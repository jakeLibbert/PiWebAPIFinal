

var baseServiceUrl = "https://osi.burnsmcdbts.com/PIWebApi/";
var statusWebID;

var authSuccessCallBack = function (data, statusMessage, statusObj) {
    if (statusObj.status === 200) {
        $("#login").hide();
        $("#dataView").show();

        piwebapi.GetCircuits();
    }
};

var authErrorCallBack = function (data) {
    if (data.status === 401) {
        alert("Invalid username and password.");
    }
    else {
        alert("Error during validation.");
    }
};

var genErrorCallBack = function (data) {
    alert(data.responseText);
}

function loadCircuitCallBak(data) {
    for (var i = 0; i < data.Items.length; i++) {
        $('#circuitSelect').append('<option value="'+data.Items[i].WebId+'">'+data.Items[i].Name+'</option>');
    }
}

function circuitChange() {
    var newCircuit = $('#circuitSelect').val();
    if (newCircuit !== "") {
        $(".valuesContainer").show();
        piwebapi.GetAllEvents(newCircuit);

        piwebapi.GetStatusAttribute(newCircuit);

    }
    else{
        $(".valuesContainer").hide();
    }
}

function handleAttrData(data){
    var attr = data.Items[0];
    statusWebID = attr.WebId;
    piwebapi.GetStatusValue(attr.WebId);
    
}

function handleStatusData(data) {
    var val = data;
    if (val.Value) {
        $("#lblCurrentStatus").html("Good");
    }
    else {
        $("#lblCurrentStatus").html("Alarm");
    }
}

function updateStatus() {
    var newStatus = $('#statusSelect').val();
    if (newStatus !== "") {
        piwebapi.UpdateCPStatus(statusWebID, newStatus);
        $('#statusSelect').val("");
    }
}


function handleOutageEventFrameData(data) {
    var outageTotal = data.Items.length;
    $("#lblTotalOutage").html(outageTotal);
    var lastOutage = data.Items[data.Items.length - 1];
    $("#outName").html(lastOutage.Name);
}


function handleEmergencyEventFrameData(data){
    var emergTotal = data.Items.length;
    $("#lblTotalEmergencies").html(emergTotal);
    var lastEmergency = data.Items[data.Items.length - 1];
    $("#emerName").html(lastEmergency.Name);
}

$("#btnLogin").click(function () {
    var username = $("#username").val();
    var password = $("#password").val();

    piwebapi.SetBaseUrl(baseServiceUrl);
    piwebapi.SetCredentials(username, password);
    piwebapi.Authorize(authSuccessCallBack, authErrorCallBack);
 
});

$("#back-btn").click(function () {
    $("#username").val('');
    $("#password").val('');

    $("#dataView").hide();
    $("#login").show();

    piwebapi.Reset();
});



