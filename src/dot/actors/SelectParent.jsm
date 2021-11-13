class SelectParent extends JSWindowActorParent {
    receiveMessage(message) {
        switch (message.name) {
            case "Forms:ShowDropDown": {
                console.log(message);

                break;
            }
    
            case "Forms:HideDropDown": {
                console.log("hide");
                
                break;
            }
        }
    }
}
  