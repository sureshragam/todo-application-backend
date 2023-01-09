const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
const dbPath = path.join(__dirname, "todoApplication.db");

app.use(express.json());
let db = null;

// get / api

app.get("/", (request, response) => {
  response.send("im working");
});

// get /todos/ api

app.get("/todos/", async (request, response) => {
  const { status = "", priority = "", search_q = "" } = request.query;
  console.log(request.query);
  try {
    const todosdetailsQuery = `
        SELECT *
        FROM todo
        WHERE priority LIKE "%${priority}%"
        AND status LIKE "%${status}%"
        AND todo LIKE "%${search_q}%"
        ORDER BY id;
        `;
    const todosDetails = await db.all(todosdetailsQuery);
    response.send(todosDetails);
  } catch (e) {
    console.log(e.message);
  }
});

// get /todos/:todoID

app.get("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  try {
    const getTodoQuery = `
        SELECT *
        FROM todo
        WHERE id = ${todoId}
        `;
    const todoDetail = await db.get(getTodoQuery);
    response.send(todoDetail);
  } catch (e) {
    console.log(e.message);
  }
});
// post /todos/

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  try {
    const addTodoQuery = `
        INSERT INTO todo(id,todo,priority,status)
        VALUES(
            ${id},
            '${todo}',
            '${priority}',
            '${status}'
        );
        `;
    await db.run(addTodoQuery);

    response.send("Todo Successfully Added");
  } catch (e) {
    console.log(e.message);
  }
});

// put '/todos/:todoId/'

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = null;
  let value = null;
  switch (true) {
    case request.body.status !== undefined:
      updateColumn = "Status";
      let { status } = request.body;
      value = status;
      break;
    case request.body.priority !== undefined:
      updateColumn = "Priority";
      let { priority } = request.body;
      value = priority;
      break;
    case request.body.todo !== undefined:
      updateColumn = "Todo";
      let { todo } = request.body;
      value = todo;
      break;
  }
  try {
    const updateTodoQuery = `
        UPDATE todo
        SET
            ${updateColumn} = '${value}'
        WHERE id = ${todoId}
        `;
    await db.run(updateTodoQuery);
    response.send(`${updateColumn} Updated`);
  } catch (e) {
    console.log(e.message);
  }
});

// /todos/:todoId/

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
    DELETE
    FROM todo
    WHERE id = ${todoId}
    `;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

const initializeServerAndConnectDatabase = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server connect at http://localhost:3000/");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

initializeServerAndConnectDatabase();
module.exports = app;
