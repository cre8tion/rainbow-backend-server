const request = require('supertest');

/*
 Start Server before running ANY tests
 */

describe('Guest Account Creation API', () => {
  let server;
  beforeAll( async () => {
    server = request('http://localhost:8080');
    //await new Promise(resolve => setTimeout(resolve, 8000));
  });

  it('should create a guest account', async() => {
    const res = await server.get('/api/v1/guest_creation')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body.success).toBe(true)
  });
});

describe('Agent Account Creation API', () => {
  let server;
  beforeAll( async () => {
    server = request('http://localhost:8080');
  });

  it('should create an agent account without details', async() => {
    //TODO
    const res = await server.post('/api/v1/agent_creation')
      .set('Accept', 'application/json')
      .send({
        "userEmailAccount":"a2p2a344@gmail.com",
        "userPassword": "ASd23ads!",
        "userFirstName": "Tom",
        "userLastName": "Hanks"
      })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Agent Account generated successfully");
  });

  it('should create an agent account with details', async() => {
    //TODO
    const res = await server.post('/api/v1/agent_creation')
      .set('Accept', 'application/json')
      .send({
        "userEmailAccount":"a2p2dga344@gmail.com",
        "userPassword": "ASd23ads!",
        "userFirstName": "Tom",
        "userLastName": "Hanks",
        "details": {
          "languages": {
            "english": 1,
            "chinese": 0,
            "malay": 1
          },
          "skills": {
            "insurance": 1,
            "bank statement": 1,
            "fraud": 0
          }
        }
      })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Agent Account generated successfully");
  });

  it('should throw agent account created error', async() => {
    const res = await server.post('/api/v1/agent_creation')
      .set('Accept', 'application/json')
      .send({
        "userEmailAccount" :"as32334@gmail.com",
        "userPassword": "heyA2!aaaa",
        "userFirstName" : "John",
        "userLastName": "Tan"
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe(`User with loginEmail = as32334@gmail.com already exists.`)
  });

  it('should throw agent password error v1', async() => {
    const res = await server.post('/api/v1/agent_creation')
      .set('Accept', 'application/json')
      .send({
        "userEmailAccount" :"as32qq34@gmail.com",
        "userPassword": "h",
        "userFirstName" : "John",
        "userLastName": "Tan"
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Field password length must be between 8 and 64 characters." +
      "Invalid field password. Expected a password matching the following rules: length must be between 8 and 64 characters, " +
      "and contain at least 1 lowercase, 1 uppercase, 1 number and 1 special character")
  });

  it('should throw agent password error v2', async() => {
    const res = await server.post('/api/v1/agent_creation')
      .set('Accept', 'application/json')
      .send({
        "userEmailAccount" :"as32qq34@gmail.com",
        "userPassword": "hhhhhhhhh",
        "userFirstName" : "John",
        "userLastName": "Tan"
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Invalid field password. Expected a password matching the following rules: " +
      "length must be between 8 and 64 characters, " +
      "and contain at least 1 lowercase, 1 uppercase, 1 number and 1 special character")
  });
});


describe("Agent Account Update API", () => {
  let server;
  beforeAll( async () => {
    server = request('http://localhost:8080');
  });

  it('should update an agent account', async() => {
    const res = await server.post('/api/v1/update_agent')
      .set('Accept', 'application/json')
      .send({
        "rainbow_id": "5e760e49f43fc36ab0f3bd30",
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
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body.success).toBe(true)
  });

  it('should throw update agent error v1', async() => {
    const res = await server.post('/api/v1/update_agent')
      .set('Accept', 'application/json')
      .send({
        "rainbow_id": "5e760734f43fc3bcfb",
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
      .expect('Content-Type', /json/)
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("rainbow_id does not exist.")
  });
});

describe('Agent Account Delete API', () => {
  let server;
  beforeAll( async () => {
    server = request('http://localhost:8080');
  });

  it('should delete an agent account', async() => {
    // AgentId must be already present in DB
    const res = await server.post('/api/v1/delete_agent')
      .set('Accept', 'application/json')
      .send({
        "userId": "5e78410aae2042244e431584"
      })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Agent Account deleted successfully");
  });

  it('should throw delete agent error v1', async() => {
    const res = await server.post('/api/v1/delete_agent')
      .set('Accept', 'application/json')
      .send({
        "userId": "5e760445f43fc36ab0fbcce"
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Invalid resource identifiers, " +
      "expected UUID: identifier must be alpha-numeric and have a length of 24 chars")
  });

  it('should throw delete agent error v2', async() => {
    const res = await server.post('/api/v1/delete_agent')
      .set('Accept', 'application/json')
      .send({
        "userId": "5e760445f43fc36ab0f4bcce"
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("User with id 5e760445f43fc36ab0f4bcce does not exist, " +
      "not able to delete it.")
  });
});

