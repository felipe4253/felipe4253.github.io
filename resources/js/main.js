var GoogleAuth;
var user;
var SCOPE = 'https://www.googleapis.com/auth/photoslibrary';
function handleClientLoad() {
    // Load the API's client and auth2 modules.
    // Call the initClient function after the modules load.
    console.log("handleClientLoad");
    gapi.load('client:auth2', initClient);
}

function initClient() {
    // Retrieve the discovery document for version 3 of Google Drive API.
    // In practice, your app can retrieve one or more discovery documents.
    console.log("initClient");
    var discoveryUrl = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

    // Initialize the gapi.client object, which app uses to make API requests.
    // Get API key and client ID from API Console.
    // 'scope' field specifies space-delimited list of access scopes.
    gapi.client.init(
        {
            'apikey': 're5wAbu17MgMH3rNhAmA_V81',
            'discoveryDocs': [discoveryUrl],
            'clientId': '246367152520-3a59tu2ucm0hs6rgn54t4talth9vupk1.apps.googleusercontent.com',
            'scope': SCOPE
    }).then(function () {
        GoogleAuth = gapi.auth2.getAuthInstance();

        // Listen for sign-in state changes.
        GoogleAuth.isSignedIn.listen(updateSigninStatus);

        // Handle initial sign-in state. (Determine if user is already signed in.)
        var user = GoogleAuth.currentUser.get();
        setSigninStatus();

        // Call handleAuthClick function when user clicks on
        //      "Sign In/Authorize" button.
        $('#sign-in-or-out-button').click(function() {
            handleAuthClick();
        }); 
        $('#revoke-access-button').click(function() {
            revokeAccess();
        }); 
    }, function(err) {
        console.log(err);
    });
}

function handleAuthClick() {
    console.log("handleAuthClick");
    if (GoogleAuth.isSignedIn.get()) {
        // User is authorized and has clicked 'Sign out' button.
        GoogleAuth.signOut();
    } else {
        // User is not signed in. Start Google auth flow.
        GoogleAuth.signIn();
    }
}

function revokeAccess() {
    console.log("revokeAccess");
    GoogleAuth.disconnect();
}

function setSigninStatus(isSignedIn) {
    console.log("setSigninStatus");
    user = GoogleAuth.currentUser.get();
    var isAuthorized = user.hasGrantedScopes(SCOPE);
    if (isAuthorized) {
        $('#sign-in-or-out-button').html('Sair');
        $('#revoke-access-button').css('display', 'inline-block');
        $('#auth-status').html('Olá '+ user.w3.ig + '. Você está logado e permitiu o acesso ao Google Photos.');
        fetchUserLibraryItems();
        fetchUserAlbums();
    } else {
        $('#sign-in-or-out-button').html('Login');
        $('#revoke-access-button').css('display', 'none');
        $('#auth-status').html('Você não está logado ainda.');
    }
}

function updateSigninStatus(isSignedIn) {
    console.log("updateSigninStatus");
    setSigninStatus();
}

function fetchUserAlbums() {
    var token = user.Zi.access_token;
    $.ajax({
        url: 'https://photoslibrary.googleapis.com/v1/albums',
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        },
        data: {},
        success: function (data) {
            console.log(data);
            var albums = data.albums;
            if (albums.length > 0){
                $("#albums-list-container").html("");
                for (var albumIndex in albums) {
                    album = albums[albumIndex];
                    $("#albums-list-container").append(
                        ' <li class="sidebar-brand">' +
                            '<a href="#"><span class="fa fa-home solo" data-album-id="'+album.id+'">'+ album.title + ' ('+album.totalMediaItems+')' +'</span></a>' +
                        '</li>'
                    );
                }
            }
             
        },
        error: function (err) {console.log(err) },
    });
}

function fetchUserLibraryItems() {
    var token = user.Zi.access_token;
    $.ajax({
        url: 'https://photoslibrary.googleapis.com/v1/mediaItems',
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        },
        data: {"pageSize" : "15"},
        success: function (data) {
            console.log(data);
            for (var photoIndex in data.mediaItems) {
                var photoUrl = data.mediaItems[photoIndex].baseUrl + "=w202-h151-no";
                $("#thumb-container").append(
                    '<img src="'+ photoUrl + '" class="img-responsive">'
                )
            }
        },
        error: function (err) {console.log(err) },
    });
}

$(document).ready(function() {
    if (GoogleAuth) {
        updateSigninStatus();
    }
});