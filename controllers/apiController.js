import db from "../db";

export async function updateAgentFromDB(json){
  try{
    await db.updateAgentDetails(json);
    return {
      "success": true,
      "message": "Agent Account updated successfully",
      "data": {}
    }
  } catch (e){
    console.log(e);
    throw new Error(e);
  }
}

export async function deleteAgentFromDB(userId){
  try{
    await db.deleteAgent(userId);

    return {
      "success": true,
      "message": "Agent Account deleted successfully",
      "data": {}
    }
  } catch (e) {
    throw new Error(e.sqlMessage);
  }
}

export async function generateGuestAcc(rainbowSDK){
  try{
    let guest = await rainbowSDK.admin.createAnonymousGuestUser(86400);
    console.log("New anonymous user with Jid: " + guest['jid_im']);
    console.log("Your Account is : " + guest['loginEmail']);
    console.log("Your Password is : " + guest['password']);

    return {
      "success": true,
      "message": "Guest Account generated successfully",
      "data": {username: guest['loginEmail'], password: guest['password']}
    }
  } catch (e) {
    console.log(e);
    throw new Error("Guest Account Creation Failed");
  }
}

export async function deleteAgentFromRainbow(rainbowSDK, userId){
  try{
    await rainbowSDK.admin.deleteUser(userId);
    return true
  } catch (e) {
    console.log(e);
    if(Array.isArray(e.error.errorDetails)){
      throw new Error(e.error.errorDetails[0].msg);
    }
    else{
      throw new Error(e.error.errorDetails);
    }
  }
}

export async function generateAgentAcc(rainbowSDK, userEmailAccount, userPassword, userFirstName, userLastName){
  try {
    let user = await rainbowSDK.admin.createUserInCompany(userEmailAccount, userPassword, userFirstName, userLastName);
    console.log(user);
    return user;

  } catch (e) {
    console.log(e);
    if(Array.isArray(e.error.errorDetails) && e.error.errorDetails.length > 1){
      const reducer = (accumulator, currentValue) => accumulator + currentValue.msg;
      const result = e.error.errorDetails.reduce(reducer,"");
      throw new Error(result);
    }
    else if(Array.isArray(e.error.errorDetails)){
      throw new Error(e.error.errorDetails[0].msg);
    }
    else{
      throw new Error(e.error.errorDetails);
    }
  }
}

export async function saveNewAgentToDB(user, personalInfo, details){
  try{
    await db.addAgent(user.id, personalInfo);
    await db.initialiseAgentDetails(user.id, details);

    return {
      "success": true,
      "message": "Agent Account generated successfully",
      "data": {}
    }
  } catch (e) {
    console.log(e);
    throw new Error(e.sqlMessage);
  }
}

export 
