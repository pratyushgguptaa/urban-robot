/*
* The google form here has four responses 0-indexed
* response[0] is a checkbox response of accepting the rules and regulations
* response[1] is the name of the participant
* response[2] is the discord id
* response[3] is the image submission

* Task 1 is to set the name of image submission as --> Submission_No. Name Discord_Id.[extension]
* Task 2 is to set to input these data in JSON to send request to post on Discord using the Discord webhook
* Task 3 is to add a trigger to this function as each time the form is submitted the function is called
* Task 4 is to sit back and see your bot work
*/

function onFormSubmit() {

  //get active form
  var form=FormApp.getActiveForm();
  
  //get total no. of responses
  var length=form.getResponses().length;
  
  //get latest responses that was submitted
  var latest = form.getResponses()[length-1].getItemResponses();
  
  //getting field values
  var name=latest[1].getResponse();     //name entered form form
  var discord=latest[2].getResponse();  //the discord id entered from form
  var id=latest[3].getResponse();       //get the file id of the image/gif  submitted
  
  //getting the file as object from the driveApp using the id
  var file = DriveApp.getFileById(id);
  
  //getting its name as string
  fileName = file.getName();
  
  //getting the last occurence of full-stop 
  dot = fileName.lastIndexOf('.');
  
  //using the index of last dot to get the file extension
  ext = fileName.substr(dot,fileName.length-dot);
  
  //setting the new name of the name using the field values and extension
  file.setName(length+' '+name+' '+discord+''+ext);
  
  //calling the function with all the details
  postMessageToDiscord(length,name,discord,file);
}



/*
* Here we are calling the discord api using the UrlFetchApp to send request with all the data
* The discord API can also take 'WEBHOOK' url as authentication rahter than access tokens
* This makes it extremely user friendly to use and execute


* The discord API takes the webhook url and 'params' 
* Here, the params is the parameters list that is i.e., method (get/post), the payload (in JSON format that is basically the message), contentType, muteHttpExceptions etc.
* The Payload parameter takes JSON in string format and that JSON is contained with the matter that is to be posted or displayed.


* You can check out the Discord API documentation for more usage details.
* Here the fields param shows the name and value as name and discord id
* And the next content to be an image

* Getting only the image from Google Drive was the tricky part as we only get the html not the image file.
* Had to use --> 'https://drive.google.com/uc?export=view&id='+file.getId() to get the image as only img so as to be accessible to the discord api
* And thats about it!

*/
function postMessageToDiscord(length,naam,discord,file) {

  //updating sharing options to be accessible anywhere outside and setting its permission as 'VIEW' can also change to 'EDIT' if you'd like
  file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
  
  /*
  * this is the webhook url generated from discord app 
  * to do so.. 
  * 1. open the discord app
  * 2. Open the server you want to post in. (remember you need permissions or be the owner)
  * 3. Go to Server Settings > Integrations > Add Webhook > Set the name, avatar and CHANNEL you want the bot to post
  * 4. Copy the webhook URL and use it below as shown
  */
  var discordUrl = 'https://discord.com/api/webhooks/123456789012345678/XXXXX-XXXXXXXXX_XXXXXXXXXXXXXXXXXXXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXX';
  
  //the payload
  var discordPayload = { 
    content: '',
    embeds: [{
      type: 'rich',
      title: 'Meme No. '+length,
      color: 7506394,
      fields: [
        { name : naam,
          value : discord
          }
      ],
      image : {
        url: 'https://drive.google.com/uc?export=view&id='+file.getId()
        }

    }]
  }
  var params = {
    method: 'post',
    payload: JSON.stringify(discordPayload),
    contentType: 'application/json'
  };

  var response = UrlFetchApp.fetch(discordUrl, params);

  Logger.log(response.getContentText());

}
