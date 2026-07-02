import http from "node:http";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const PORT = 3000;
const FILE = path.join(process.cwd(), "database/users.json");

async function saveUsers() {
  if (existsSync(FILE)) return;

  const response = await fetch("https://jsonplaceholder.typicode.com/users");
  const users = await response.json();

  await fs.writeFile(FILE, JSON.stringify(users, null, 2));
}

await saveUsers();

const server = http.createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  const data = await fs.readFile(FILE, "utf-8");
  const users = JSON.parse(data);

  if (req.method === "GET" && req.url === "/users") {
    res.statusCode = 200;
    return res.end(JSON.stringify(users));
  }

  if (req.method === "GET" && req.url.startsWith("/users/")) {
    const id = Number(req.url.split("/")[2]);

    if (isNaN(id)) {
      res.statusCode = 400;
      return res.end(
        JSON.stringify({
          message: "id raqam bo'lishi kerak",
        })
      );
    }

    const user = users.find((item) => item.id === id);

    if (!user) {
      res.statusCode = 404;
      return res.end(
        JSON.stringify({
          message: "User topilmadi",
        })
      );
    }

    res.statusCode = 200;
    return res.end(JSON.stringify(user));
  }

  res.statusCode = 404;
  res.end(
    JSON.stringify({
      message: "Route topilmadi",
    })
  );
});

server.listen(PORT, () => {
  console.log("Server ishlayapti:", PORT);
});