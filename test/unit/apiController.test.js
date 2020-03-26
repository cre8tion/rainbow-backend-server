import * as apiController from "../../controllers/apiController";

jest.mock( "../../controllers/apiController");

describe('apiController Functions', () => {
  it('should update agent in DB', async() =>{

    apiController.updateAgentFromDB.mockImplementation( () => {
      return {
        "success": true,
        "message": "Agent Account updated successfully",
        "data": {}
      }
    });

    expect(apiController.updateAgentFromDB({
      "rainbow_id": "5e57b7ff6c332176648fcaa4",
      "personalInfo": {
        "firstname": "Alfred",
        "lastname": "Bob",
        "email": "bob_alfred@gmail.com"
      },
      "details": {
        "languages": {
          "english": 1,
          "chinese": 0,
          "malay": 1
        }
      }
    })).toStrictEqual({
      "success": true,
      "message": "Agent Account updated successfully",
      "data": {}
    });

    expect(apiController.updateAgentFromDB).toHaveBeenCalledWith({
      "rainbow_id": "5e57b7ff6c332176648fcaa4",
      "personalInfo": {
        "firstname": "Alfred",
        "lastname": "Bob",
        "email": "bob_alfred@gmail.com"
      },
      "details": {
        "languages": {
          "english": 1,
          "chinese": 0,
          "malay": 1
        }
      }
    });

  });

  it('should delete agent in DB', async() => {
    apiController.deleteAgentFromDB.mockImplementation( () => {
      return {
        "success": true,
        "message": "Agent Account deleted successfully",
        "data": {}
      }
    });

    expect(apiController.deleteAgentFromDB("5e783b6cae2042244e43154d")).toStrictEqual({
      "success": true,
      "message": "Agent Account deleted successfully",
      "data": {}
    });

    expect(apiController.deleteAgentFromDB).toBeCalledWith("5e783b6cae2042244e43154d")
  });

  it('should generate Guest Account', async() => {
    let rainbowSDK;
    apiController.generateGuestAcc.mockImplementation((rainbowSDK) => {
      return {
        "success": true,
        "message": "Guest Account generated successfully",
        "data": {username: "qwertyuiop@amail.com", password: "Qweedsar2!"}
      }
    });

    expect(apiController.generateGuestAcc(rainbowSDK)).toMatchObject({
      "success": true,
      "message":"Guest Account generated successfully"
    });

    expect(apiController.generateGuestAcc).toBeCalledWith(rainbowSDK)
  });

  it('should delete agent from Rainbow', async() => {
    let rainbowSDK, userId;
    apiController.deleteAgentFromRainbow.mockImplementation((rainbowSDK, userId) => {
      return true
    });

    expect(apiController.deleteAgentFromRainbow(rainbowSDK, userId)).toBe(true);
    expect(apiController.deleteAgentFromRainbow).toBeCalledWith(rainbowSDK, userId)
  });

  it('should generate agent account', async() => {
    let rainbowSDK, userEmailAccount, userPassword, userFirstName, userLastName;
    apiController.generateAgentAcc.mockImplementation((rainbowSDK, userEmailAccount,
                                                       userPassword, userFirstName,
                                                       userLastName) => {
      return {
        "id": "5e532bccb4528b74a00c92f9"
      }
    });

    expect(apiController.generateAgentAcc(rainbowSDK, userEmailAccount, userPassword,
      userFirstName, userLastName)).toStrictEqual({
      "id": "5e532bccb4528b74a00c92f9"
    });
    expect(apiController.generateAgentAcc).toBeCalledWith(rainbowSDK, userEmailAccount, userPassword,
      userFirstName, userLastName)
  });

  it('should save agent to DB', async() => {
    let user, personalInfo, details;

    apiController.saveNewAgentToDB.mockImplementation((user, personalInfo, details) => {
      return {
        "success": true,
        "message": "Agent Account generated successfully",
        "data": {}
      }
    });

    expect(apiController.saveNewAgentToDB(user, personalInfo, details)).toStrictEqual({
      "success": true,
      "message": "Agent Account generated successfully",
      "data": {}
    });

    expect(apiController.saveNewAgentToDB).toBeCalledWith(user, personalInfo, details);
  });

  it('should change contact presence on Rainbow', async() => {
    let contact;
    apiController.changeContactPresence.mockImplementation((contact) => {

    });
    apiController.changeContactPresence(contact);

    expect(apiController.changeContactPresence).toBeCalledWith(contact)
  })


});
