import * as apiController from "../../controllers/apiController";

jest.mock( "../../controllers/apiController");

describe('API Functions', () => {
  it('should update agent in DB', async() =>{
    await apiController.updateAgentFromDB({
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
    })
  });
});
