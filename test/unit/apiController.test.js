import * as apiController from '../../controllers/apiController';

jest.mock('../../controllers/apiController');

describe('apiController Functions', () => {
  it('should update agent in DB', async () => {
    apiController.updateAgentFromDB.mockImplementationOnce(async () => ({
      success: true,
      message: 'Agent Account updated successfully',
      data: {},
    }));

    await expect(apiController.updateAgentFromDB({
      rainbow_id: '5e57b7ff6c332176648fcaa4',
      personalInfo: {
        firstname: 'Alfred',
        lastname: 'Bob',
        email: 'bob_alfred@gmail.com',
      },
      details: {
        languages: {
          english: 1,
          chinese: 0,
          malay: 1,
        },
      },
    })).resolves.toStrictEqual({
      success: true,
      message: 'Agent Account updated successfully',
      data: {},
    });

    expect(apiController.updateAgentFromDB).toHaveBeenCalledWith({
      rainbow_id: '5e57b7ff6c332176648fcaa4',
      personalInfo: {
        firstname: 'Alfred',
        lastname: 'Bob',
        email: 'bob_alfred@gmail.com',
      },
      details: {
        languages: {
          english: 1,
          chinese: 0,
          malay: 1,
        },
      },
    });
  });

  it('should throw error for updating agent in DB', async () => {
    apiController.updateAgentFromDB.mockImplementationOnce(async (json) => {
      throw new Error('rainbow_id does not exist.');
    });

    await expect(apiController.updateAgentFromDB({
      rainbow_id: '5e57b7ff6c332176648fcaa4',
      personalInfo: {
        firstname: 'Alfred',
        lastname: 'Bob',
        email: 'bob_alfred@gmail.com',
      },
      details: {
        languages: {
          english: 1,
          chinese: 0,
          malay: 1,
        },
      },
    })).rejects.toThrowError('rainbow_id does not exist.'); // SUCCESS


    expect(apiController.updateAgentFromDB).toBeCalledWith({
      rainbow_id: '5e57b7ff6c332176648fcaa4',
      personalInfo: {
        firstname: 'Alfred',
        lastname: 'Bob',
        email: 'bob_alfred@gmail.com',
      },
      details: {
        languages: {
          english: 1,
          chinese: 0,
          malay: 1,
        },
      },
    });
  });

  it('should delete agent in DB', async () => {
    apiController.deleteAgentFromDB.mockImplementationOnce(async () => ({
      success: true,
      message: 'Agent Account deleted successfully',
      data: {},
    }));

    await expect(apiController.deleteAgentFromDB('5e783b6cae2042244e43154d')).resolves.toStrictEqual({
      success: true,
      message: 'Agent Account deleted successfully',
      data: {},
    });

    expect(apiController.deleteAgentFromDB).toBeCalledWith('5e783b6cae2042244e43154d');
  });

  it('should throw error deleting agent from DB', async () => {
    let userId;
    apiController.deleteAgentFromDB.mockImplementationOnce(async (userId) => {
      throw new Error('rainbow_id does not exist.');
    });

    await expect(apiController.deleteAgentFromDB(userId))
      .rejects
      .toThrowError('rainbow_id does not exist.');

    expect(apiController.deleteAgentFromDB).toBeCalledWith(userId);
  });

  it('should generate Guest Account', async () => {
    let rainbowSDK;
    apiController.generateGuestAcc.mockImplementationOnce(async (rainbowSDK) => ({
      success: true,
      message: 'Guest Account generated successfully',
      data: { username: 'qwertyuiop@amail.com', password: 'Qweedsar2!' },
    }));

    await expect(apiController.generateGuestAcc(rainbowSDK))
      .resolves
      .toMatchObject({
        success: true,
        message: 'Guest Account generated successfully',
      });

    expect(apiController.generateGuestAcc).toBeCalledWith(rainbowSDK);
  });

  it('should throw error for generating guest account', async () => {
    let rainbowSDK;
    apiController.generateGuestAcc.mockImplementationOnce(async (rainbowSDK) => {
      throw new Error('Guest Account Creation Failed');
    });

    await expect(apiController.generateGuestAcc(rainbowSDK))
      .rejects
      .toThrowError('Guest Account Creation Failed');

    expect(apiController.generateGuestAcc).toBeCalledWith(rainbowSDK);
  });

  it('should delete agent from Rainbow', async () => {
    let rainbowSDK; let
      userId;
    apiController.deleteAgentFromRainbow.mockImplementationOnce(async (rainbowSDK, userId) => true);

    await expect(apiController.deleteAgentFromRainbow(rainbowSDK, userId))
      .resolves
      .toBe(true);

    expect(apiController.deleteAgentFromRainbow).toBeCalledWith(rainbowSDK, userId);
  });

  it('should throw error for deleting agent v1 in Rainbow', async () => {
    let rainbowSDK;
    apiController.deleteAgentFromRainbow.mockImplementationOnce(async (rainbowSDK, userId) => {
      throw new Error('Invalid resource identifiers, '
        + 'expected UUID: identifier must be alpha-numeric and have a length of 24 chars');
    });

    await expect(apiController.deleteAgentFromRainbow(rainbowSDK, '5e783b6cae2042244e43154d'))
      .rejects
      .toThrowError(
        'Invalid resource identifiers, '
        + 'expected UUID: identifier must be alpha-numeric and have a length of 24 chars',
      );

    expect(apiController.deleteAgentFromRainbow).toBeCalledWith(rainbowSDK, '5e783b6cae2042244e43154d');
  });

  it('should throw error for deleting agent v2 in Rainbow', async () => {
    let rainbowSDK;

    apiController.deleteAgentFromRainbow.mockImplementationOnce(async (rainbowSDK, userId) => {
      throw new Error('User with id 5e760445f43fc36ab0f4bcce does not exist, '
        + 'not able to delete it.');
    });

    await expect(apiController.deleteAgentFromRainbow(rainbowSDK, '5e760445f43fc36ab0f4bcce'))
      .rejects
      .toThrowError(
        'User with id 5e760445f43fc36ab0f4bcce does not exist, '
        + 'not able to delete it.',
      );

    expect(apiController.deleteAgentFromRainbow).toBeCalledWith(rainbowSDK, '5e760445f43fc36ab0f4bcce');
  });


  it('should generate agent account', async () => {
    let rainbowSDK; let userEmailAccount; let userPassword; let userFirstName; let
      userLastName;
    apiController.generateAgentAcc.mockImplementationOnce(async (rainbowSDK, userEmailAccount,
      userPassword, userFirstName,
      userLastName) => ({
      id: '5e532bccb4528b74a00c92f9',
    }));

    await expect(apiController.generateAgentAcc(rainbowSDK, userEmailAccount, userPassword,
      userFirstName, userLastName))
      .resolves
      .toStrictEqual({
        id: '5e532bccb4528b74a00c92f9',
      });
    expect(apiController.generateAgentAcc).toBeCalledWith(rainbowSDK, userEmailAccount, userPassword,
      userFirstName, userLastName);
  });

  it('should throw error generating agent account with existing email address', async () => {
    let rainbowSDK; let userEmailAccount; let userPassword; let userFirstName; let
      userLastName;
    apiController.generateAgentAcc.mockImplementationOnce(async (rainbowSDK, userEmailAccount,
      userPassword, userFirstName,
      userLastName) => {
      throw new Error('User with loginEmail = as32334@gmail.com already exists.');
    });

    await expect(apiController.generateAgentAcc(rainbowSDK, userEmailAccount, userPassword,
      userFirstName, userLastName))
      .rejects
      .toThrowError('User with loginEmail = as32334@gmail.com already exists.');

    expect(apiController.generateAgentAcc).toBeCalledWith(rainbowSDK, userEmailAccount, userPassword,
      userFirstName, userLastName);
  });

  it('should throw error generating agent account with invalid password error #1', async () => {
    let rainbowSDK; let userEmailAccount; let userPassword; let userFirstName; let
      userLastName;
    apiController.generateAgentAcc.mockImplementationOnce(async (rainbowSDK, userEmailAccount,
      userPassword, userFirstName,
      userLastName) => {
      throw new Error('Field password length must be between 8 and 64 characters.'
        + 'Invalid field password. Expected a password matching the following rules: length must be between 8 and 64 characters, '
        + 'and contain at least 1 lowercase, 1 uppercase, 1 number and 1 special character');
    });

    await expect(apiController.generateAgentAcc(rainbowSDK, userEmailAccount, userPassword,
      userFirstName, userLastName))
      .rejects
      .toThrowError('Field password length must be between 8 and 64 characters.'
        + 'Invalid field password. Expected a password matching the following rules: length must be between 8 and 64 characters, '
        + 'and contain at least 1 lowercase, 1 uppercase, 1 number and 1 special character');

    expect(apiController.generateAgentAcc).toBeCalledWith(rainbowSDK, userEmailAccount, userPassword,
      userFirstName, userLastName);
  });

  it('should throw error generating agent account with invalid password error #2', async () => {
    let rainbowSDK; let userEmailAccount; let userPassword; let userFirstName; let
      userLastName;
    apiController.generateAgentAcc.mockImplementationOnce(async (rainbowSDK, userEmailAccount,
      userPassword, userFirstName,
      userLastName) => {
      throw new Error('Invalid field password. Expected a password matching the following rules: '
        + 'length must be between 8 and 64 characters, '
        + 'and contain at least 1 lowercase, 1 uppercase, 1 number and 1 special character');
    });

    await expect(apiController.generateAgentAcc(rainbowSDK, userEmailAccount, userPassword,
      userFirstName, userLastName))
      .rejects
      .toThrowError('Invalid field password. Expected a password matching the following rules: '
        + 'length must be between 8 and 64 characters, '
        + 'and contain at least 1 lowercase, 1 uppercase, 1 number and 1 special character');

    expect(apiController.generateAgentAcc).toBeCalledWith(rainbowSDK, userEmailAccount, userPassword,
      userFirstName, userLastName);
  });

  it('should save agent to DB', async () => {
    let user; let personalInfo; let
      details;

    apiController.saveNewAgentToDB.mockImplementationOnce(async (user, personalInfo, details) => ({
      success: true,
      message: 'Agent Account generated successfully',
      data: {},
    }));

    await expect(apiController.saveNewAgentToDB(user, personalInfo, details))
      .resolves
      .toStrictEqual({
        success: true,
        message: 'Agent Account generated successfully',
        data: {},
      });

    expect(apiController.saveNewAgentToDB).toBeCalledWith(user, personalInfo, details);
  });

  it('should throw error saving agent to DB', async () => {
    let user; let personalInfo; let
      details;

    apiController.saveNewAgentToDB.mockImplementationOnce(async (user, personalInfo, details) => {
      throw new Error();
    });

    await expect(apiController.saveNewAgentToDB(user, personalInfo, details))
      .rejects
      .toThrowError();

    expect(apiController.saveNewAgentToDB).toBeCalledWith(user, personalInfo, details);
  });

  it('should change contact presence on Rainbow', async () => {
    let contact;
    apiController.changeContactPresence.mockImplementationOnce((contact) => {

    });
    apiController.changeContactPresence(contact);

    expect(apiController.changeContactPresence).toBeCalledWith(contact);
  });
});
