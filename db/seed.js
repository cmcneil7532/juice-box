const { client, getAllUsers } = require("./index");

const testDB = async () => {
  try {
    client.connect(() => {
      console.log("Connected to juicebox db!"); //connect to the database
    });
    const users = await getAllUsers();
    console.log(users);
  } catch (error) {
    console.error(error);
  } finally {
    client.end();
  }
};
testDB();
