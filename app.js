const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbpath = path.join(__dirname, "cricketTeam.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3005, () => {
      console.log("Server Running at http://localhost:3005/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();
const objectSnakeToCamel = (dbObject) => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  };
};
const districtSnakeToCamel = (dbObject) => {
  return {
    districtId: dbObject.district_id,
    districtName: dbObject.district_name,
    stateId: dbObject.state_id,
    cases: dbObject.cases,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObject.deaths,
  };
};
const reportSnakeToCamel = (dbObject) => {
  return {
    totalCames: dbObject.total_cames,
    totalCured: dbObject.total_cured,
    totalActive: dbObject.total_active,
    totalDeaths: dbObject.total_deaths,
  };
};
app.get("/states/", async (request, response) => {
  const allStateList = `
    SELECT 
    * 
    FROM
    state
    ORDER BY state_id;`;
  const stateListArray = await database.all(allStateList);
  const statesResults = stateListArray.map((eachObject) => {
    return objectSnakeToCamel(eachObject);
  });
  response.send(statesResults);
});
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateList = `
    SELECT 
    * 
    FROM state
    WHERE 
    state_id = ${stateId};`;
  const getStateListArray = await database.get(getStateList);
  const getResults = getStateListArray((eachObject) => {
    response.send(getResults);
  });
});
app.post("/districts/", async (request, response) => {
  const createDistrict = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = createDistrict;
  const newDistrinct = `
        INSERT INTO
        district (district_name, state_id, cases, cured, active,
    deaths)
    VALUES 
    ('${districtName}',
    ${stateId},
    ${cases},
    ${cured},
    ${active},
    ${deaths}
    );`;
  const addDistrict = await database.run(newDistrinct);
  const districtId = addDistrict.lastId;
  response.send("District Successfully Added");
});
module.exports = app;
